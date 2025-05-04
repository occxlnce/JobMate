import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Save, Trash2, PhoneCall, Plus, X } from "lucide-react";

// Components
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "@/components/ui/external-link";

// Define the allowed frequency values as a const to use in the schema
const FREQUENCY_OPTIONS = ["daily", "weekly", "immediate"] as const;
type FrequencyType = (typeof FREQUENCY_OPTIONS)[number];

// Validation schema
const whatsAppAlertsSchema = z.object({
  whatsapp_number: z
    .string()
    .min(10, "WhatsApp number must be at least 10 digits")
    .regex(/^\+?[0-9\s]+$/, "Please enter a valid phone number"),
  is_enabled: z.boolean().default(true),
  keywords: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  min_salary: z.number().min(0).optional().nullable(),
  frequency: z.enum(FREQUENCY_OPTIONS),
});

type WhatsAppAlertsFormValues = z.infer<typeof whatsAppAlertsSchema>;

const WhatsAppAlerts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const form = useForm<WhatsAppAlertsFormValues>({
    resolver: zodResolver(whatsAppAlertsSchema),
    defaultValues: {
      whatsapp_number: "",
      is_enabled: true,
      keywords: [],
      locations: [],
      min_salary: null,
      frequency: "daily",
    },
  });

  // Load saved settings when component mounts
  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("whatsapp_alerts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setIsConfigured(true);

        // Ensure the frequency value is one of the allowed options
        const frequency = data.frequency as FrequencyType;
        if (!FREQUENCY_OPTIONS.includes(frequency)) {
          // Default to 'daily' if the stored value isn't valid
          data.frequency = 'daily';
        }

        form.reset({
          whatsapp_number: data.whatsapp_number || "",
          is_enabled: data.is_enabled !== null ? data.is_enabled : true,
          keywords: data.job_search_keywords || [],
          locations: data.location_preferences || [],
          min_salary: data.min_salary || null,
          frequency: data.frequency as FrequencyType || "daily",
        });
      }
    } catch (error: any) {
      console.error("Error loading WhatsApp alert settings:", error);
      toast({
        title: "Error",
        description: "Failed to load your WhatsApp alert settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: WhatsAppAlertsFormValues) => {
    if (!user) return;

    setLoading(true);
    try {
      const alertData = {
        user_id: user.id,
        whatsapp_number: values.whatsapp_number,
        is_enabled: values.is_enabled,
        job_search_keywords: values.keywords || [],
        location_preferences: values.locations || [],
        min_salary: values.min_salary,
        frequency: values.frequency,
        updated_at: new Date().toISOString(),
      };

      // Check if settings already exist for this user
      if (isConfigured) {
        const { error } = await supabase
          .from("whatsapp_alerts")
          .update(alertData)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("whatsapp_alerts")
          .insert([alertData]);

        if (error) throw error;
        setIsConfigured(true);
      }

      toast({
        title: "Settings Saved",
        description: "Your WhatsApp job alert preferences have been updated.",
      });
    } catch (error: any) {
      console.error("Error saving WhatsApp alert settings:", error);
      toast({
        title: "Error",
        description: "Failed to save your WhatsApp alert settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    const currentKeywords = form.getValues("keywords") || [];
    if (!currentKeywords.includes(newKeyword.trim())) {
      form.setValue("keywords", [...currentKeywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    const currentKeywords = form.getValues("keywords") || [];
    form.setValue(
      "keywords",
      currentKeywords.filter((k) => k !== keyword)
    );
  };

  const addLocation = () => {
    if (!newLocation.trim()) return;
    const currentLocations = form.getValues("locations") || [];
    if (!currentLocations.includes(newLocation.trim())) {
      form.setValue("locations", [...currentLocations, newLocation.trim()]);
      setNewLocation("");
    }
  };

  const removeLocation = (location: string) => {
    const currentLocations = form.getValues("locations") || [];
    form.setValue(
      "locations",
      currentLocations.filter((l) => l !== location)
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Job Alerts</h1>
        <p className="text-muted-foreground mt-2">
          Get job notifications directly on WhatsApp
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setup WhatsApp Job Alerts</CardTitle>
          <CardDescription>
            Configure your preferences to receive job alerts via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="is_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable WhatsApp Alerts</FormLabel>
                      <FormDescription>
                        Receive job notifications on WhatsApp based on your preferences
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
                name="whatsapp_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormDescription>
                      Enter your WhatsApp number including country code (e.g., +1234567890)
                    </FormDescription>
                    <FormControl>
                      <div className="flex">
                        <Input placeholder="+1234567890" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate (as jobs are found)</SelectItem>
                        <SelectItem value="daily">Daily digest</SelectItem>
                        <SelectItem value="weekly">Weekly summary</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How often would you like to receive job alerts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="min_salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Salary (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter minimum salary"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseInt(e.target.value, 10)
                            : null;
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Only receive alerts for jobs with salaries above this amount
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Keywords</FormLabel>
                    <FormDescription>
                      Add keywords related to job titles or skills you're interested in
                    </FormDescription>
                    <div className="flex gap-2">
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="React, Frontend Developer, etc."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addKeyword();
                          }
                        }}
                      />
                      <Button type="button" onClick={addKeyword} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value?.map((keyword) => (
                        <Badge key={keyword} className="pl-2 pr-1 py-1">
                          {keyword}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="ml-1 h-5 w-5 p-0"
                            onClick={() => removeKeyword(keyword)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Locations</FormLabel>
                    <FormDescription>
                      Add locations where you're looking for jobs
                    </FormDescription>
                    <div className="flex gap-2">
                      <Input
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="London, Remote, United Kingdom, etc."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addLocation();
                          }
                        }}
                      />
                      <Button type="button" onClick={addLocation} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value?.map((location) => (
                        <Badge key={location} className="pl-2 pr-1 py-1">
                          {location}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="ml-1 h-5 w-5 p-0"
                            onClick={() => removeLocation(location)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="bg-jobmate-600 hover:bg-jobmate-700"
                disabled={loading}
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Preferences"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-start border-t bg-muted/50 p-6">
          <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">How it works</p>
            <p>
              1. Enter your WhatsApp number including country code (e.g., +1234567890)
            </p>
            <p>
              2. Configure your job search preferences (keywords, locations, salary)
            </p>
            <p>
              3. Choose how often you want to receive alerts
            </p>
            <p>
              4. We'll notify you on WhatsApp when we find matching jobs
            </p>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connect WhatsApp</CardTitle>
          <CardDescription>
            Follow these steps to complete the WhatsApp connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-medium">To receive alerts on WhatsApp:</p>
            <ol className="mt-2 space-y-2 text-sm text-muted-foreground pl-5 list-decimal">
              <li>Scan the QR code or click the button below to open WhatsApp</li>
              <li>Send the message "JOIN JOBMATE" to our WhatsApp number</li>
              <li>We'll confirm your subscription and start sending alerts</li>
            </ol>
          </div>
          <Button className="w-full sm:w-auto">
            <PhoneCall className="mr-2 h-4 w-4" />
            Connect WhatsApp
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            By connecting, you agree to receive job alerts via WhatsApp
          </p>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Having issues?{" "}
            <ExternalLink
              href="https://wa.me/12345678901?text=help%20jobmate"
              className="font-medium text-primary hover:underline"
            >
              Contact Support
            </ExternalLink>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WhatsAppAlerts;
