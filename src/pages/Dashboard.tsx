import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, FileText, Briefcase, MessageSquare, Bookmark, Bell, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { JobModal } from "@/components/jobs/JobModal";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

// Career tips array
const careerTips = [
  "Tailor your CV for every application to highlight relevant experience.",
  "85% of jobs are filled through networking — connect with others!",
  "Include quantifiable achievements in your CV, not just responsibilities.",
  "Research the company thoroughly before any interview.",
  "Follow up after interviews with a thank you note within 24 hours.",
  "Use the STAR method (Situation, Task, Action, Result) for interview questions.",
  "Keep your LinkedIn profile updated with your latest achievements.",
  "Create a portfolio to showcase your work, especially for creative fields.",
  "Practice common interview questions with a friend or mentor.",
  "Set job alerts on multiple platforms to catch new opportunities quickly."
];

// Dream job suggestions
const dreamJobs = [
  {
    title: "Senior Frontend Developer",
    company: "Google",
    salary: "$150k+",
    location: "Remote"
  },
  {
    title: "Data Scientist",
    company: "Netflix",
    salary: "$170k+",
    location: "San Francisco"
  },
  {
    title: "UX/UI Designer",
    company: "Apple",
    salary: "$140k+",
    location: "Cupertino"
  },
  {
    title: "Blockchain Developer",
    company: "Coinbase",
    salary: "$180k+",
    location: "Remote"
  }
];

type SavedCV = {
  id: string;
  title: string;
  completed: boolean | null;
  created_at: string;
};

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  posted_date: string;
  is_remote: boolean | null;
  description?: string;
};

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  bgColor,
  link,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  bgColor: string;
  link: string;
}) => {
  return (
    <Link to={link}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`p-2 rounded-md ${bgColor}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </Link>
  );
};

const ActionCard = ({
  title,
  description,
  icon: Icon,
  href,
  buttonText
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  buttonText: string;
}) => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-md bg-jobmate-100">
            <Icon className="h-5 w-5 text-jobmate-600" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <p className="text-sm text-muted-foreground mb-4 flex-1">{description}</p>
        <Button asChild className="mt-auto w-full bg-jobmate-600 hover:bg-jobmate-700">
          <Link to={href}>{buttonText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const RecentJobCard = ({ job, onViewDetails }: { job: Job; onViewDetails: (job: Job) => void }) => {
  return (
    <Card className="mb-3 hover:shadow-sm transition-shadow">
      <CardContent className="py-4 px-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-base font-medium">{job.title} at {job.company}</h4>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <span className="mr-3">{job.is_remote ? 'Remote' : job.location}</span>
              <span>Posted {formatDistanceToNow(new Date(job.posted_date), { addSuffix: true })}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(job)}
            className="text-jobmate-600 hover:text-jobmate-700"
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const DreamJobCard = ({ job }: { job: typeof dreamJobs[0] }) => {
  return (
    <Card className="mb-3 bg-gradient-to-r from-jobmate-50 to-jobmate-100 hover:shadow-md transition-shadow">
      <CardContent className="py-4 px-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-base font-medium">{job.title}</h4>
            <div className="flex flex-col sm:flex-row sm:items-center text-sm">
              <span className="text-jobmate-600 font-medium mr-2">{job.company}</span>
              <div className="flex items-center mt-1 sm:mt-0">
                <span className="mr-2">{job.location}</span>
                <Badge variant="outline" className="bg-jobmate-100 text-jobmate-700">
                  {job.salary}
                </Badge>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="text-jobmate-600 hover:text-jobmate-700 border-jobmate-200"
          >
            Explore
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    matchingJobs: 0,
    savedJobs: 0,
    createdCvs: 0,
    interviewPractices: 0
  });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [unfinishedCVs, setUnfinishedCVs] = useState<SavedCV[]>([]);
  const [currentTip, setCurrentTip] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoadingMoreJobs, setIsLoadingMoreJobs] = useState(false);

  useEffect(() => {
    // Set a random career tip
    setCurrentTip(careerTips[Math.floor(Math.random() * careerTips.length)]);
    
    if (user) {
      // Check if onboarding has been completed
      const onboardingCompleted = localStorage.getItem("onboarding_completed");
      if (!onboardingCompleted) {
        setShowOnboarding(true);
      }
      
      // Get user profile name
      fetchUserProfile();
      
      // Fetch dashboard data
      fetchDashboardData();
      
      // Fetch LinkedIn jobs (simulated for now)
      fetchLinkedInJobs();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        if (error) throw error;
        
        if (data && data.full_name) {
          setUserName(data.full_name);
        } else if (user.user_metadata && user.user_metadata.full_name) {
          setUserName(user.user_metadata.full_name);
        } else if (user.user_metadata && user.user_metadata.name) {
          setUserName(user.user_metadata.name);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  };

  const fetchLinkedInJobs = async () => {
    // In a real implementation, this would connect to LinkedIn's API
    // For now, we'll simulate it with our current jobs data
    try {
      const { data: linkedInJobs, error } = await supabase
        .from('jobs')
        .select('*')
        .order('posted_date', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Store these jobs in localStorage as a cache
      if (linkedInJobs) {
        localStorage.setItem('linkedInJobs', JSON.stringify(linkedInJobs));
      }
    } catch (error) {
      console.log('Error fetching LinkedIn jobs, using cached jobs if available');
      // Try to use cached jobs if API fails
      const cachedJobs = localStorage.getItem('linkedInJobs');
      if (cachedJobs) {
        setRecentJobs(JSON.parse(cachedJobs));
      }
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('posted_date', { ascending: false })
        .limit(5);

      if (jobsError) throw jobsError;
      setRecentJobs(jobsData || []);

      // Fetch statistics data
      const [savedJobsResponse, createdCvsResponse, interviewsResponse, unfinishedCVsResponse] = await Promise.all([
        supabase
          .from('saved_jobs')
          .select('count')
          .eq('user_id', user?.id)
          .single(),
          
        supabase
          .from('generated_cvs')
          .select('count')
          .eq('user_id', user?.id)
          .single(),
          
        supabase
          .from('interview_sessions')
          .select('count')
          .eq('user_id', user?.id)
          .single(),
          
        supabase
          .from('saved_cvs')
          .select('id, title, completed, created_at')
          .eq('user_id', user?.id)
          .eq('completed', false)
          .order('created_at', { ascending: false })
          .limit(1)
      ]);

      // Update stats with real data
      setStats({
        matchingJobs: recentJobs.length,
        savedJobs: savedJobsResponse.data?.count || 0,
        createdCvs: createdCvsResponse.data?.count || 0,
        interviewPractices: interviewsResponse.data?.count || 0
      });

      // Set unfinished CVs
      if (unfinishedCVsResponse.data) {
        setUnfinishedCVs(unfinishedCVsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
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

  const handleLoadMoreJobs = async () => {
    setIsLoadingMoreJobs(true);
    try {
      const currentCount = recentJobs.length;
      
      const { data: moreJobs, error } = await supabase
        .from('jobs')
        .select('*')
        .order('posted_date', { ascending: false })
        .range(currentCount, currentCount + 4);
        
      if (error) throw error;
      
      if (moreJobs && moreJobs.length > 0) {
        setRecentJobs([...recentJobs, ...moreJobs]);
      } else {
        toast({
          title: "No more jobs",
          description: "There are no more jobs to load at this time.",
        });
      }
    } catch (error) {
      console.error("Error loading more jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load more jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMoreJobs(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{userName ? `, ${userName}` : (user?.email ? `, ${user.email}` : '')}! Here's an overview of your job search.
          </p>
        </div>
        <Button variant="outline" size="icon" className="relative" onClick={() => toast({ title: "Notifications", description: "No new notifications at this time." })}>
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Matching Jobs" 
          value={stats.matchingJobs} 
          icon={Briefcase}
          bgColor="bg-blue-500"
          link="/jobs"
        />
        <DashboardCard 
          title="Saved Jobs" 
          value={stats.savedJobs} 
          icon={Bookmark}
          bgColor="bg-green-500"
          link="/saved-items"
        />
        <DashboardCard 
          title="CVs Created" 
          value={stats.createdCvs} 
          icon={FileText}
          bgColor="bg-jobmate-600"
          link="/cv-builder"
        />
        <DashboardCard 
          title="Interview Practices" 
          value={stats.interviewPractices} 
          icon={MessageSquare}
          bgColor="bg-amber-500"
          link="/interview-coach"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              <ActionCard
                title="Create Your CV"
                description="Generate a professional CV tailored to your skills and experiences with AI assistance."
                icon={FileText}
                href="/cv-builder"
                buttonText="Build My CV"
              />
              <ActionCard
                title="Find Matching Jobs"
                description="Discover job opportunities that match your skills and preferences."
                icon={Briefcase}
                href="/jobs"
                buttonText="View Jobs"
              />
              <ActionCard
                title="Practice Interviews"
                description="Practice answering interview questions with our AI interview coach."
                icon={MessageSquare}
                href="/interview-coach"
                buttonText="Start Practicing"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Job Posts</h2>
              <Link to="/jobs">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
            
            {recentJobs.length > 0 ? (
              <div>
                {recentJobs.map(job => (
                  <RecentJobCard 
                    key={job.id}
                    job={job}
                    onViewDetails={handleViewJobDetails}
                  />
                ))}
                
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={handleLoadMoreJobs}
                    disabled={isLoadingMoreJobs}
                  >
                    {isLoadingMoreJobs ? "Loading..." : "Load More Jobs"}
                  </Button>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-6 flex justify-center items-center">
                  <p className="text-muted-foreground">No job posts yet. We're finding matches for you.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          {unfinishedCVs.length > 0 && (
            <Card className="bg-jobmate-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Continue Building Your CV</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  You have {unfinishedCVs.length} unfinished CV — continue building?
                </p>
                <Link to={`/cv-builder?cvId=${unfinishedCVs[0].id}`}>
                  <Button className="w-full bg-jobmate-600 hover:bg-jobmate-700">
                    Continue CV
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <span>Tip of the Day</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="italic text-muted-foreground">{currentTip}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedJob && (
        <JobModal 
          job={selectedJob}
          isOpen={showJobModal} 
          setIsOpen={setShowJobModal} 
        />
      )}
      
      <OnboardingModal 
        open={showOnboarding} 
        onOpenChange={setShowOnboarding} 
      />
    </div>
  );
};

export default Dashboard;
