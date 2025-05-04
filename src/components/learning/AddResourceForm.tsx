
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
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
  SelectValue 
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  skill: z.string().min(1, "Skill is required"),
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Please enter a valid URL"),
  source: z.string().min(1, "Source is required"),
  description: z.string().optional(),
  duration: z.string().optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"], {
    required_error: "Please select a difficulty level",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddResourceFormProps {
  onResourceAdded: () => void;
  skills: string[];
}

export function AddResourceForm({ onResourceAdded, skills }: AddResourceFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skill: "",
      title: "",
      url: "",
      source: "",
      description: "",
      duration: "",
      level: "Beginner",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to add resources",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase.from("learning_resources").insert({
        user_id: user.id,
        skill: values.skill,
        title: values.title,
        url: values.url,
        source: values.source,
        description: values.description || null,
        duration: values.duration || null,
        level: values.level,
      });

      if (error) throw error;

      toast({
        title: "Resource added successfully",
      });

      form.reset();
      setOpen(false);
      onResourceAdded();
    } catch (error) {
      console.error("Error adding resource:", error);
      toast({
        title: "Failed to add resource",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Resource
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Learning Resource</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="skill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select or enter a skill" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Show existing skills but also allow new ones */}
                        {skills.map(skill => (
                          <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                        ))}
                        <SelectItem value="JavaScript">JavaScript</SelectItem>
                        <SelectItem value="React">React</SelectItem>
                        <SelectItem value="TypeScript">TypeScript</SelectItem>
                        <SelectItem value="Node.js">Node.js</SelectItem>
                        <SelectItem value="CSS">CSS</SelectItem>
                        <SelectItem value="HTML">HTML</SelectItem>
                        <SelectItem value="Python">Python</SelectItem>
                        <SelectItem value="SQL">SQL</SelectItem>
                        <SelectItem value="AWS">AWS</SelectItem>
                        <SelectItem value="Docker">Docker</SelectItem>
                        <SelectItem value="GraphQL">GraphQL</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Resource title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="YouTube">YouTube</SelectItem>
                          <SelectItem value="Coursera">Coursera</SelectItem>
                          <SelectItem value="Microsoft Learn">Microsoft Learn</SelectItem>
                          <SelectItem value="freeCodeCamp">freeCodeCamp</SelectItem>
                          <SelectItem value="Udemy">Udemy</SelectItem>
                          <SelectItem value="Pluralsight">Pluralsight</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 2 hours, 3 weeks" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Brief description of the resource" 
                        className="resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Resource"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
