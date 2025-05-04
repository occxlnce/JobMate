
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { CoverLetterPreviewModal } from "./CoverLetterPreviewModal";

const formSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(10, "Job description is required and must be at least 10 characters"),
  tone: z.enum(["Formal", "Enthusiastic", "Direct"], {
    required_error: "Please select a tone",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function CoverLetterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: "",
      jobDescription: "",
      tone: "Formal",
    },
  });

  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        console.log("User profile data:", data);
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }

    fetchUserProfile();
  }, [user]);

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate a cover letter.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Extract user skills and experience from profile
      const userSkills = userProfile?.skills ? userProfile.skills.join(", ") : "";
      const userExperience = userProfile?.experience 
        ? userProfile.experience
            .map((exp: any) => `${exp.title || ''} at ${exp.company || ''} (${exp.description || ''})`)
            .join("; ")
        : "";

      // Call the Supabase Edge Function to generate cover letter
      const { data, error } = await supabase.functions.invoke('generate-cover-letter', {
        body: {
          jobTitle: values.jobTitle,
          jobDescription: values.jobDescription,
          tone: values.tone,
          userName: userProfile?.full_name || "",
          userSkills: userSkills,
          userExperience: userExperience,
        }
      });

      if (error) {
        throw new Error(`Failed to generate cover letter: ${error.message}`);
      }

      // Save to database
      const { error: saveError } = await supabase
        .from('cover_letters')
        .insert({
          user_id: user.id,
          job_title: values.jobTitle,
          job_description: values.jobDescription,
          tone: values.tone,
          generated_text: data.coverLetter
        });
      
      if (saveError) {
        console.error("Error saving cover letter:", saveError);
      }

      setGeneratedCoverLetter(data.coverLetter);
      setIsModalOpen(true);
      
      toast({
        title: "Cover letter generated",
        description: "Your cover letter has been created successfully.",
      });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate cover letter",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI Cover Letter Generator</h2>
        <p className="text-muted-foreground">
          Create a professional cover letter tailored to your job application
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Software Developer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste the job description here..."
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tone</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Formal">Formal</SelectItem>
                    <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="Direct">Direct</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {userProfile && (
            <div className="p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Auto-filled Profile Data:</h3>
              <div className="text-sm space-y-1">
                {userProfile.full_name && <p>Name: {userProfile.full_name}</p>}
                {userProfile.skills && userProfile.skills.length > 0 && (
                  <p>Skills: {userProfile.skills.join(", ")}</p>
                )}
                {userProfile.experience && userProfile.experience.length > 0 && (
                  <p>Experience: {userProfile.experience.length} entries included</p>
                )}
              </div>
            </div>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Cover Letter"
            )}
          </Button>
        </form>
      </Form>

      {generatedCoverLetter && (
        <CoverLetterPreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          coverLetterText={generatedCoverLetter}
          jobTitle={form.getValues("jobTitle")}
        />
      )}
    </div>
  );
}
