
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ExternalLink, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface SavedJob {
  id: string;
  job_title: string;
  company: string;
  location?: string;
  description?: string;
  salary?: string;
  match_score?: number;
  created_at: string;
}

export function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSavedJobs() {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('saved_jobs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setSavedJobs(data || []);
      } catch (error: any) {
        console.error("Error fetching saved jobs:", error.message);
        toast({
          title: "Error fetching saved jobs",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchSavedJobs();
  }, [user, toast]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setSavedJobs(savedJobs.filter(job => job.id !== id));
      
      toast({
        title: "Job Removed",
        description: "Job has been removed from your saved list.",
      });
    } catch (error: any) {
      console.error("Error removing saved job:", error.message);
      toast({
        title: "Error removing job",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getMatchBadge = (score?: number) => {
    if (!score) return null;
    
    let color = "";
    if (score >= 80) color = "bg-green-500";
    else if (score >= 60) color = "bg-yellow-500";
    else color = "bg-red-500";
    
    return (
      <Badge className={`${color} text-white`}>
        {score}% Match
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (savedJobs.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No saved jobs</h3>
        <p className="text-muted-foreground mb-4">
          Explore and save jobs you're interested in
        </p>
        <Button asChild>
          <a href="/jobs">
            <Briefcase className="mr-2 h-4 w-4" />
            Find Jobs
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {savedJobs.map((job) => (
        <Card key={job.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="line-clamp-1">{job.job_title}</CardTitle>
              {getMatchBadge(job.match_score)}
            </div>
            <CardDescription>
              <div className="font-medium">{job.company}</div>
              {job.location && <div>{job.location}</div>}
              {job.created_at && (
                <div className="text-xs text-muted-foreground mt-1">
                  Saved on {new Date(job.created_at).toLocaleDateString()}
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {job.description && (
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {job.description}
              </p>
            )}
            {job.salary && (
              <div className="mt-2 text-sm font-medium">
                Salary: {job.salary}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" asChild>
              <a href={`/jobs/${job.id}`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Job
              </a>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-500 hover:text-red-500"
              onClick={() => handleDelete(job.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
