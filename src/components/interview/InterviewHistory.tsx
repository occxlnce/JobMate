
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Award, Calendar, Clock, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface InterviewSession {
  id: string;
  job_title: string;
  created_at: string;
  completed_at: string | null;
  is_complete: boolean;
  questions: any[];
  answers: any[];
  feedback: any[];
}

export const InterviewHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);

  useEffect(() => {
    if (user) {
      fetchInterviewSessions();
    }
  }, [user]);

  const fetchInterviewSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match the InterviewSession type
      const transformedData = data?.map(session => ({
        ...session,
        questions: Array.isArray(session.questions) ? session.questions : [],
        answers: Array.isArray(session.answers) ? session.answers : [],
        feedback: Array.isArray(session.feedback) ? session.feedback : []
      })) as InterviewSession[];

      setSessions(transformedData || []);
    } catch (error: any) {
      console.error("Error fetching interview sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load your interview history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => 
    session.job_title.toLowerCase().includes(filter.toLowerCase())
  );

  const viewSession = (session: InterviewSession) => {
    setSelectedSession(session);
  };

  const closeDetails = () => {
    setSelectedSession(null);
  };

  // Calculate score if available in feedback
  const calculateScore = (session: InterviewSession) => {
    if (!session.feedback || session.feedback.length === 0) return "N/A";
    
    const scores = session.feedback
      .filter(f => f.score !== undefined)
      .map(f => f.score);
    
    if (scores.length === 0) return "N/A";
    
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return `${Math.round(avg * 100)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (selectedSession) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Interview Details</h2>
          <Button variant="outline" onClick={closeDetails}>Back to List</Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{selectedSession.job_title}</CardTitle>
                <CardDescription>
                  Completed on: {selectedSession.completed_at ? format(new Date(selectedSession.completed_at), 'PPP') : 'In progress'}
                </CardDescription>
              </div>
              <Badge variant={selectedSession.is_complete ? "default" : "outline"} className={selectedSession.is_complete ? "bg-green-500" : ""}>
                {selectedSession.is_complete ? "Completed" : "In Progress"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(selectedSession.created_at), 'PPP')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(selectedSession.created_at), 'p')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>Score: {calculateScore(selectedSession)}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Questions & Answers</h3>
              {selectedSession.questions.length === 0 ? (
                <p className="text-muted-foreground">No questions available.</p>
              ) : (
                <div className="space-y-4">
                  {selectedSession.questions.map((question, index) => {
                    const answer = selectedSession.answers[index] || { content: "No answer provided" };
                    const feedback = selectedSession.feedback[index] || {};
                    
                    return (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardHeader>
                          <CardTitle className="text-base">Q{index + 1}: {question.content}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <h4 className="font-medium mb-1">Your Answer:</h4>
                            <p className="text-muted-foreground">{answer.content}</p>
                          </div>
                          {feedback.content && (
                            <div>
                              <h4 className="font-medium mb-1">Feedback:</h4>
                              <p className="text-muted-foreground">{feedback.content}</p>
                              {feedback.score !== undefined && (
                                <Badge className="mt-2" variant="outline">
                                  Score: {feedback.score * 100}%
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Interview History</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by job title"
            className="pl-8"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>
      
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground text-center mb-4">You haven't taken any interview practice sessions yet.</p>
            <Button asChild>
              <a href="/interview-coach">Take an Interview</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.job_title}</TableCell>
                    <TableCell>{format(new Date(session.created_at), 'PP')}</TableCell>
                    <TableCell>
                      <Badge variant={session.is_complete ? "default" : "outline"} className={session.is_complete ? "bg-green-500" : ""}>
                        {session.is_complete ? "Completed" : "In Progress"}
                      </Badge>
                    </TableCell>
                    <TableCell>{calculateScore(session)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" onClick={() => viewSession(session)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          {filteredSessions.length === 0 && (
            <CardFooter className="border-t px-6 py-4">
              <p className="text-sm text-muted-foreground">No interviews match your search.</p>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
};

export default InterviewHistory;
