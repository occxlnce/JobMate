import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";
import SpeechSynthesis from "./SpeechSynthesis";
import { Switch } from "@/components/ui/switch";

const interviewSchema = z.object({
  jobTitle: z.string().min(3, "Job title must be at least 3 characters"),
  answer: z.string().optional(),
});

type InterviewFormValues = z.infer<typeof interviewSchema>;

// Sample interview questions by category
const interviewQuestions = {
  technical: [
    "Explain the concept of state management in React.",
    "What are the differences between REST and GraphQL APIs?",
    "How do you handle errors in asynchronous JavaScript code?",
    "Describe your experience with TypeScript and its benefits.",
    "How would you optimize the performance of a web application?",
  ],
  behavioral: [
    "Describe a challenging project you worked on and how you overcame obstacles.",
    "How do you handle disagreements with team members?",
    "Tell me about a time when you had to meet a tight deadline.",
    "How do you prioritize tasks when dealing with multiple projects?",
    "Describe your approach to learning new technologies.",
  ],
  situational: [
    "How would you handle a situation where requirements change mid-project?",
    "What would you do if you discovered a critical bug shortly before a release?",
    "How would you onboard a new team member to your project?",
    "Describe how you would explain a complex technical concept to a non-technical stakeholder.",
    "How would you approach refactoring legacy code?",
  ],
};

const InterviewPractice = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<"technical" | "behavioral" | "situational">("technical");
  const [useVoice, setUseVoice] = useState(false);
  const [autoPlayQuestions, setAutoPlayQuestions] = useState(false);

  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      jobTitle: "",
      answer: "",
    },
  });

  const startInterview = async (values: InterviewFormValues) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get random questions from each category
      const selectedQuestions = [
        ...shuffle(interviewQuestions.technical).slice(0, 2),
        ...shuffle(interviewQuestions.behavioral).slice(0, 1),
        ...shuffle(interviewQuestions.situational).slice(0, 2),
      ];
      
      setQuestions(selectedQuestions);
      setAnswers(new Array(selectedQuestions.length).fill(""));
      setFeedback(new Array(selectedQuestions.length).fill(null));
      
      // Create a new interview session in the database
      const { data, error } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: user.id,
          job_title: values.jobTitle,
          questions: selectedQuestions.map(q => ({ content: q })),
          answers: new Array(selectedQuestions.length).fill({ content: "" }),
          feedback: new Array(selectedQuestions.length).fill({}),
          is_complete: false,
        })
        .select("id")
        .single();
      
      if (error) throw error;
      
      setSessionId(data.id);
      setInterviewStarted(true);
      setCurrentQuestionIndex(0);
      
    } catch (error: any) {
      console.error("Error starting interview:", error);
      toast({
        title: "Error",
        description: "Failed to start the interview session.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceRecordingComplete = async (audioBlob: Blob) => {
    if (!user || !sessionId) return;
    
    setSubmitting(true);
    try {
      // Create a base64 representation of the audio
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        if (!base64Audio) {
          throw new Error("Failed to process audio recording");
        }
        
        // For now, we'll use a mock transcription since we're not connecting to a real API
        // In a real app, you would send the base64Audio to a voice-to-text service
        
        // Mock transcription based on the current question
        const mockTranscription = `This is a simulated answer to the question: "${questions[currentQuestionIndex]}". In a real implementation, this would be the actual transcription of your spoken answer.`;
        
        form.setValue('answer', mockTranscription);
        
        // Now handle the answer submission as normal
        await handleAnswerSubmit(mockTranscription);
      };
      
      reader.readAsDataURL(audioBlob);
      
      toast({
        title: "Recording processed",
        description: "Your voice answer has been processed.",
      });
    } catch (error: any) {
      console.error("Error processing voice recording:", error);
      toast({
        title: "Error",
        description: "Failed to process your voice answer.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (!user || !sessionId) return;
    
    setSubmitting(true);
    try {
      // Update answers array
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = answer;
      setAnswers(updatedAnswers);
      
      // Save answer to database
      await supabase
        .from("interview_sessions")
        .update({
          answers: updatedAnswers.map(a => ({ content: a })),
        })
        .eq("id", sessionId);
      
      // Get feedback from edge function
      const question = questions[currentQuestionIndex];
      const jobTitle = form.getValues("jobTitle");
      
      const { data: feedbackData } = await supabase.functions.invoke("interview-coach", {
        body: { jobTitle, question, answer },
      });
      
      if (feedbackData) {
        // Update feedback array
        const updatedFeedback = [...feedback];
        updatedFeedback[currentQuestionIndex] = {
          content: feedbackData.feedback,
          score: feedbackData.score / 100,
          improvements: feedbackData.improvements,
          strengths: feedbackData.strengths,
        };
        setFeedback(updatedFeedback);
        
        // Save feedback to database
        await supabase
          .from("interview_sessions")
          .update({
            feedback: updatedFeedback.map(f => f || {}),
          })
          .eq("id", sessionId);
      }
      
      // Check if this is the last question
      if (currentQuestionIndex >= questions.length - 1) {
        await supabase
          .from("interview_sessions")
          .update({
            is_complete: true,
            completed_at: new Date().toISOString(),
          })
          .eq("id", sessionId);
        
        setInterviewCompleted(true);
      } else {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        form.setValue("answer", "");
      }
      
    } catch (error: any) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: "Failed to submit your answer.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      form.setValue("answer", answers[currentQuestionIndex + 1] || "");
    }
  };

  const finishInterview = () => {
    setInterviewStarted(false);
    setInterviewCompleted(false);
    setQuestions([]);
    setAnswers([]);
    setFeedback([]);
    setSessionId(null);
    form.reset();
  };

  // Fisher-Yates shuffle algorithm
  const shuffle = (array: string[]) => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const renderFeedback = () => {
    const currentFeedback = feedback[currentQuestionIndex];
    if (!currentFeedback) return null;
    
    return (
      <Card className="border-l-4 border-l-primary mt-6">
        <CardHeader>
          <CardTitle className="text-lg">AI Feedback</CardTitle>
          <CardDescription>
            Score: {Math.round(currentFeedback.score * 100)}%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Feedback:</h4>
            <p className="text-muted-foreground">{currentFeedback.content}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Strengths:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {currentFeedback.strengths?.map((strength: string, idx: number) => (
                <li key={idx} className="text-muted-foreground">{strength}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Areas for Improvement:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {currentFeedback.improvements?.map((improvement: string, idx: number) => (
                <li key={idx} className="text-muted-foreground">{improvement}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (interviewCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Interview Completed</CardTitle>
          <CardDescription>
            Great job! You've completed your interview practice session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            You've answered all the interview questions for {form.getValues("jobTitle")}. 
            Check your performance and feedback in the Interview History tab.
          </p>
          
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Questions Answered</p>
              <p className="text-sm text-muted-foreground">{questions.length} questions</p>
            </div>
            <div className="text-right">
              <p className="font-medium">Average Score</p>
              <p className="text-sm text-muted-foreground">
                {feedback.filter(f => f?.score).length > 0 
                  ? `${Math.round(
                      feedback
                        .filter(f => f?.score)
                        .reduce((acc, f) => acc + f.score, 0) / 
                        feedback.filter(f => f?.score).length * 100
                    )}%`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={finishInterview} className="w-full">
            Start a New Interview
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (interviewStarted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <CardTitle>{form.getValues("jobTitle")} Interview</CardTitle>
                <CardDescription>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardDescription>
              </div>
              <Select value={currentCategory} onValueChange={(value) => setCurrentCategory(value as any)}>
                <SelectTrigger className="w-[180px] mt-2 md:mt-0">
                  <SelectValue placeholder="Question Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="situational">Situational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium">
                {questions[currentQuestionIndex]}
              </div>
              
              <SpeechSynthesis 
                text={questions[currentQuestionIndex]} 
                autoPlay={autoPlayQuestions}
              />
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1 mb-2">
              <div className="flex items-center space-x-1">
                <Switch
                  id="auto-play"
                  checked={autoPlayQuestions}
                  onCheckedChange={setAutoPlayQuestions}
                  size="sm"
                />
                <label htmlFor="auto-play">Auto-play questions</label>
              </div>
              
              <div className="flex items-center space-x-1">
                <Switch
                  id="use-voice"
                  checked={useVoice}
                  onCheckedChange={setUseVoice}
                  size="sm"
                />
                <label htmlFor="use-voice">Use voice input</label>
              </div>
            </div>
            
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Answer</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Type your answer here..."
                          className="min-h-[150px]"
                          disabled={submitting}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a detailed answer as you would in a real interview.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            
            {useVoice && !feedback[currentQuestionIndex] && (
              <div className="border rounded-md p-4 bg-muted/20">
                <h4 className="text-sm font-medium mb-2">Voice Answer</h4>
                <VoiceRecorder 
                  onRecordingComplete={handleVoiceRecordingComplete} 
                  isDisabled={submitting}
                />
              </div>
            )}
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2">
              {currentQuestionIndex > 0 && !feedback[currentQuestionIndex] && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                  disabled={submitting}
                >
                  Previous Question
                </Button>
              )}
              
              {feedback[currentQuestionIndex] && currentQuestionIndex < questions.length - 1 && (
                <Button onClick={nextQuestion}>
                  Next Question
                </Button>
              )}
              
              {!feedback[currentQuestionIndex] && !useVoice && (
                <Button 
                  onClick={() => handleAnswerSubmit(form.getValues("answer") || "")}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Answer"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {feedback[currentQuestionIndex] && renderFeedback()}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice Interview</CardTitle>
        <CardDescription>
          Start a mock interview session to improve your skills
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(startInterview)}>
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Frontend Developer, Product Manager"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the job title you're practicing for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center space-x-2 text-sm">
              <Switch
                id="voice-features"
                checked={useVoice}
                onCheckedChange={setUseVoice}
              />
              <label htmlFor="voice-features">
                Enable voice features (listen to questions and answer with voice)
              </label>
            </div>
            
            {useVoice && (
              <div className="flex items-center space-x-2 text-sm ml-6">
                <Switch
                  id="auto-play"
                  checked={autoPlayQuestions}
                  onCheckedChange={setAutoPlayQuestions}
                />
                <label htmlFor="auto-play">
                  Automatically read questions aloud
                </label>
              </div>
            )}
            
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                "Start Interview"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col border-t px-6 py-4">
        <p className="text-sm text-muted-foreground">
          You'll be presented with job-specific interview questions and receive AI feedback on your answers.
        </p>
      </CardFooter>
    </Card>
  );
};

export default InterviewPractice;
