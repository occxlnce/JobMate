
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bookmark, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  posted_date: string;
  is_remote?: boolean | null;
  description?: string;
  requirements?: string[] | null;
  apply_link?: string;
  salary_min?: number | null;
  salary_max?: number | null;
};

type JobModalProps = {
  job: Job;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const JobModal = ({ job, isOpen, setIsOpen }: JobModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Format salary range if available
  const formatSalaryRange = () => {
    if (job.salary_min && job.salary_max) {
      return `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`;
    } else if (job.salary_min) {
      return `From $${job.salary_min.toLocaleString()}`;
    } else if (job.salary_max) {
      return `Up to $${job.salary_max.toLocaleString()}`;
    }
    return "Not specified";
  };

  // Format posted date
  const formatPostedDate = () => {
    if (!job.posted_date) return "Recently";
    try {
      const date = new Date(job.posted_date);
      return `${date.toLocaleDateString()}`;
    } catch (e) {
      return "Recently";
    }
  };

  const handleSaveJob = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save jobs",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Check if job is already saved
      const { data: existingData } = await supabase
        .from("saved_jobs")
        .select("id")
        .eq("job_id", job.id)
        .eq("user_id", user.id)
        .single();

      if (existingData) {
        // Job already saved, let's delete it
        await supabase
          .from("saved_jobs")
          .delete()
          .eq("id", existingData.id);

        setIsSaved(false);
        toast({
          title: "Job removed",
          description: "Job has been removed from your saved items.",
        });
      } else {
        // Save the job
        await supabase.from("saved_jobs").insert({
          job_id: job.id,
          user_id: user.id,
          job_title: job.title,
          company: job.company,
          location: job.location || (job.is_remote ? "Remote" : ""),
          description: job.description,
          salary: formatSalaryRange(),
        });
        
        setIsSaved(true);
        toast({
          title: "Job saved",
          description: "Job has been added to your saved items.",
        });
        
        // Also store in localStorage as fallback
        const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
        savedJobs.push({
          id: job.id,
          title: job.title,
          company: job.company,
          savedDate: new Date().toISOString(),
        });
        localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast({
        title: "Error",
        description: "Failed to save the job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyForJob = () => {
    setIsApplying(true);
    
    // If there's an apply link, open it in a new tab
    if (job.apply_link) {
      window.open(job.apply_link, '_blank');
      setIsApplying(false);
      return;
    }
    
    // If no apply link, construct one (in a real app, this would be provided by the API)
    const applyUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title + " " + job.company)}`;
    window.open(applyUrl, '_blank');
    
    setTimeout(() => {
      setIsApplying(false);
      toast({
        title: "Application initiated",
        description: "You've been redirected to the job application page.",
      });
    }, 1000);
  };

  // Check on mount if job is saved
  useState(() => {
    const checkIfSaved = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from("saved_jobs")
          .select("id")
          .eq("job_id", job.id)
          .eq("user_id", user.id)
          .single();
        
        setIsSaved(!!data);
      } catch (error) {
        // Job is not saved, or there was an error
        console.log("Job not found in saved jobs or error occurred");
      }
    };
    
    checkIfSaved();
    
    // Also check localStorage as fallback
    try {
      const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
      const isJobSaved = savedJobs.some((savedJob: any) => savedJob.id === job.id);
      if (isJobSaved) setIsSaved(true);
    } catch (e) {
      // Error reading localStorage
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
          <DialogDescription className="text-base font-medium text-muted-foreground pt-2">
            {job.company}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Job Meta */}
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{job.is_remote ? "Remote" : job.location}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              <span>Posted {formatPostedDate()}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <div>Salary: {formatSalaryRange()}</div>
            {job.is_remote && (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Remote</Badge>
            )}
          </div>
          
          <Separator />
          
          {/* Job Description */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Job Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {job.description || "No description available for this position."}
            </p>
          </div>
          
          {/* Requirements */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Requirements</h3>
            {job.requirements && job.requirements.length > 0 ? (
              <ul className="list-disc pl-6 space-y-1">
                {job.requirements.map((req, index) => (
                  <li key={index} className="text-muted-foreground">{req}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No specific requirements listed.</p>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-6">
          <Button 
            variant={isSaved ? "default" : "outline"} 
            onClick={handleSaveJob} 
            disabled={isSaving}
            className={isSaved ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isSaved ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Saved
              </>
            ) : (
              <>
                <Bookmark className="mr-2 h-4 w-4" /> Save Job
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleApplyForJob}
            disabled={isApplying}
            className="bg-jobmate-600 hover:bg-jobmate-700"
          >
            {isApplying ? "Redirecting..." : (
              <>
                Apply Now <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
