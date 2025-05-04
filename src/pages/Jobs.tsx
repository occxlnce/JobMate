
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookmarkIcon, Briefcase, Search, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { JobModal } from "@/components/jobs/JobModal";
import { Skeleton } from "@/components/ui/skeleton";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string | null;
  requirements: string[] | null;
  salary_min: number | null;
  salary_max: number | null;
  posted_date: string;
  is_remote: boolean | null;
  is_premium: boolean | null;
};

const JobCard = ({ 
  job, 
  onViewDetails 
}: { 
  job: Job; 
  onViewDetails: (job: Job) => void;
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
            <CardDescription className="text-base font-medium mt-1">{job.company}</CardDescription>
          </div>
          {job.is_premium && (
            <Badge className="bg-amber-500 hover:bg-amber-600">
              Premium
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{job.is_remote ? 'Remote' : job.location}</span>
          </div>
          
          {(job.salary_min || job.salary_max) && (
            <div className="flex items-center text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M12 6v12" />
                <path d="M17 10H7" />
                <path d="M22 20H2" />
                <path d="M2 4v16" />
                <path d="M22 4v16" />
              </svg>
              <span>
                {job.salary_min && job.salary_max 
                  ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                  : job.salary_min 
                    ? `From $${job.salary_min.toLocaleString()}`
                    : job.salary_max
                      ? `Up to $${job.salary_max.toLocaleString()}`
                      : 'Salary not specified'
                }
              </span>
            </div>
          )}

          <div className="flex items-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span>Posted {formatDistanceToNow(new Date(job.posted_date), { addSuffix: true })}</span>
          </div>
          
          {job.description && (
            <p className="mt-4 text-foreground leading-relaxed line-clamp-2">
              {job.description}
            </p>
          )}
          
          {job.requirements && job.requirements.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {job.requirements.slice(0, 3).map((req, index) => (
                <Badge key={index} variant="outline">{req}</Badge>
              ))}
              {job.requirements.length > 3 && (
                <Badge variant="outline">+{job.requirements.length - 3} more</Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <div className="flex space-x-2 w-full">
          <Button 
            onClick={() => onViewDetails(job)} 
            variant="outline" 
            className="flex-1"
          >
            View Details
          </Button>
          <Button size="icon" variant="ghost">
            <BookmarkIcon className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const JobCardSkeleton = () => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div className="w-3/4">
          <Skeleton className="h-7 w-full mb-2" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="pb-2">
      <div className="space-y-3">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-20 w-full mt-2" />
      </div>
    </CardContent>
    <CardFooter className="pt-1">
      <div className="flex space-x-2 w-full">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-10" />
      </div>
    </CardFooter>
  </Card>
);

const Jobs = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('posted_date', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewJobDetails = (job: Job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const filteredJobs = searchQuery
    ? jobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : jobs;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find Jobs</h1>
        <p className="text-muted-foreground mt-2">
          Discover job opportunities that match your skills and experience
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search jobs, companies or locations..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1">
        {loading ? (
          <>
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              onViewDetails={handleViewJobDetails}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
            <h3 className="mt-4 text-lg font-medium">No jobs found</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery 
                ? "Try adjusting your search terms or filters" 
                : "Check back later for new job listings"}
            </p>
          </div>
        )}
      </div>

      {!loading && filteredJobs.length > 0 && (
        <div className="text-center p-8">
          <Button variant="outline" className="mx-auto">
            <Briefcase className="mr-2 h-4 w-4" />
            Load More Jobs
          </Button>
        </div>
      )}

      {selectedJob && (
        <JobModal 
          job={selectedJob}
          isOpen={showJobModal} 
          setIsOpen={setShowJobModal} 
        />
      )}
    </div>
  );
};

export default Jobs;
