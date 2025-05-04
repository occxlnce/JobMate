
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const settingsFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  jobAlerts: z.boolean().default(true),
  interviewReminders: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      emailNotifications: true,
      jobAlerts: true,
      interviewReminders: true,
      marketingEmails: false,
    },
  });

  // Load saved settings from localStorage
  useState(() => {
    try {
      const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      if (savedSettings) {
        form.reset({
          emailNotifications: savedSettings.emailNotifications ?? true,
          jobAlerts: savedSettings.jobAlerts ?? true,
          interviewReminders: savedSettings.interviewReminders ?? true,
          marketingEmails: savedSettings.marketingEmails ?? false,
        });
      }
    } catch (error) {
      console.error("Error loading saved settings:", error);
    }
  });

  async function onSubmit(values: SettingsFormValues) {
    setLoading(true);
    try {
      // Store settings in localStorage
      localStorage.setItem('userSettings', JSON.stringify(values));
      
      // In a real implementation, this would save to Supabase
      if (user) {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Delete account data
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      // Delete auth user
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) throw error;
      
      // Sign out
      await signOut();
      
      // Clear local storage
      localStorage.clear();
      
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            View and update your account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium">Email</div>
              <div>{user?.email || "Not logged in"}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium">Account Created</div>
              <div>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium">Account Status</div>
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                Active
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Manage how you receive notifications and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="font-medium">Email Notifications</FormLabel>
                        <FormDescription>
                          Receive notifications about your account via email
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobAlerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="font-medium">Job Alerts</FormLabel>
                        <FormDescription>
                          Get notified about new job matches that fit your profile
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interviewReminders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="font-medium">Interview Reminders</FormLabel>
                        <FormDescription>
                          Receive reminders about upcoming interview practice sessions
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketingEmails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="font-medium">Marketing Emails</FormLabel>
                        <FormDescription>
                          Receive emails about new features and promotions
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="bg-jobmate-600 hover:bg-jobmate-700"
                disabled={loading}
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Irreversible account actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting your account will remove all of your data and cannot be undone.
          </p>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-red-500 hover:bg-red-600"
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
