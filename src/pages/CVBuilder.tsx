
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, User, Upload } from "lucide-react";
import { EmptyStateCV } from "@/components/cv/EmptyStateCV";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalInfoForm from "@/components/cv/PersonalInfoForm";

// Define the form schema
const formSchema = z.object({
  jobTitle: z.string().min(2, { message: "Job title must be at least 2 characters." }),
  skills: z.string().optional(),
  workExperience: z.string().optional(),
  education: z.string().optional(),
  additionalInfo: z.string().optional(),
  templateStyle: z.string().default("professional")
});

type FormValues = z.infer<typeof formSchema>;

// Example CV templates
const cvTemplates = [
  { id: "professional", name: "Professional" },
  { id: "creative", name: "Creative" },
  { id: "minimal", name: "Minimal" },
  { id: "modern", name: "Modern" }
];

const CVBuilder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [generatedCV, setGeneratedCV] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [personalInfoComplete, setPersonalInfoComplete] = useState(false);
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [activeTab, setActiveTab] = useState("cvBuilder");
  const [profileData, setProfileData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: "",
      skills: "",
      workExperience: "",
      education: "",
      additionalInfo: "",
      templateStyle: "professional"
    },
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setProfileData(data);
        console.log("Fetched profile data:", data);
        
        // Check if essential profile fields are filled
        const hasEssentialInfo = data.full_name && data.email && data.phone_number;
        setPersonalInfoComplete(!!hasEssentialInfo);
        setShowProfileAlert(!hasEssentialInfo);
      } else {
        setShowProfileAlert(true);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setShowProfileAlert(true);
    }
  };

  const handlePersonalInfoSubmit = async (values: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...values,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your personal information has been saved.",
      });
      
      setPersonalInfoComplete(true);
      setShowProfileAlert(false);
      fetchUserProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update personal information",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to generate a CV",
        variant: "destructive",
      });
      return;
    }

    if (!personalInfoComplete) {
      toast({
        title: "Personal Information Required",
        description: "Please complete your personal information before generating a CV.",
        variant: "destructive",
      });
      setActiveTab("personalInfo");
      return;
    }

    setIsLoading(true);
    setGeneratedCV(null);

    try {
      // Prepare skills array - safely handle null/undefined values
      const skillsArray = values.skills 
        ? values.skills.split(",").map(skill => skill.trim()) 
        : [];

      const { data, error } = await supabase.functions.invoke('generate-cv-with-groq', {
        body: { 
          jobTitle: values.jobTitle,
          skills: skillsArray,
          workExperience: values.workExperience || "",
          education: values.education || "",
          additionalInfo: values.additionalInfo || "",
          templateStyle: values.templateStyle,
          userId: user.id
        }
      });

      if (error) {
        throw error;
      }

      // Set the generated CV content
      setGeneratedCV(data.cvContent);

      // Save the generated CV
      try {
        const { error: saveError } = await supabase
          .from('saved_cvs')
          .insert({
            user_id: user.id,
            title: `${values.jobTitle} CV - ${new Date().toLocaleDateString()}`,
            content: data.cvContent,
            job_title: values.jobTitle,
            skills: skillsArray,
          });
          
        if (saveError) {
          console.error("Error saving CV:", saveError);
        }
      } catch (saveErr) {
        console.error("Error in CV save operation:", saveErr);
      }

      toast({
        title: "CV Generated",
        description: "Your CV has been generated successfully.",
      });
    } catch (error: any) {
      console.error("Error generating CV:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCvFile(event.target.files[0]);
    }
  };

  const scanCV = async () => {
    if (!cvFile || !user) return;
    
    setIsScanning(true);
    
    try {
      const formData = new FormData();
      formData.append('file', cvFile);
      
      // Create object URL for the uploaded file
      const fileObjectUrl = URL.createObjectURL(cvFile);
      
      // Call the edge function to scan the CV
      const { data: ocrData, error: ocrError } = await supabase.functions.invoke('scan-cv', {
        body: {
          userId: user.id, 
          fileUrl: fileObjectUrl
        }
      });

      if (ocrError) throw ocrError;
      
      if (ocrData && ocrData.extractedText) {
        // Populate form with extracted data
        const { extractedData } = ocrData;
        
        if (extractedData) {
          form.setValue('jobTitle', extractedData.jobTitle || '');
          form.setValue('skills', extractedData.skills ? extractedData.skills.join(', ') : '');
          form.setValue('workExperience', extractedData.experience || '');
          form.setValue('education', extractedData.education || '');
        }
        
        toast({
          title: "CV Scanned Successfully",
          description: "Data has been extracted and prefilled in the form.",
        });
      } else {
        throw new Error("No text extracted from the image");
      }
    } catch (error: any) {
      console.error("Error scanning CV:", error);
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to scan CV. Please try again or enter details manually.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const downloadAsPDF = async () => {
    if (!generatedCV) return;
    
    setIsPdfGenerating(true);
    
    try {
      // Create a styled HTML version of the CV
      const styledHTML = `
        <html>
          <head>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 40px;
                color: #333;
              }
              .cv-container {
                max-width: 800px;
                margin: 0 auto;
              }
              h1, h2, h3 {
                color: #2563eb;
                margin-top: 20px;
              }
              h1 {
                font-size: 26px;
                border-bottom: 2px solid #2563eb;
                padding-bottom: 10px;
              }
              h2 {
                font-size: 20px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
              }
              h3 {
                font-size: 18px;
              }
              p {
                margin-bottom: 15px;
              }
              .section {
                margin-bottom: 25px;
              }
              ul {
                padding-left: 20px;
              }
              li {
                margin-bottom: 5px;
              }
            </style>
          </head>
          <body>
            <div class="cv-container">
              ${generatedCV}
            </div>
          </body>
        </html>
      `;
      
      // Convert HTML to PDF
      const blob = new Blob([styledHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-cv.html'; // Will be opened in browser and can be printed to PDF
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "CV Downloaded",
        description: "Your CV has been downloaded. Open it in a browser and use the print option to save as PDF.",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CV Builder</h1>
        <p className="text-muted-foreground mt-2">
          Generate a professional CV tailored to your target job.
        </p>
      </div>

      {showProfileAlert && (
        <Alert className="bg-amber-50 border-amber-300">
          <User className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Complete your personal information to ensure your CV includes your contact details.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="personalInfo">Personal Information</TabsTrigger>
          <TabsTrigger value="cvBuilder">CV Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="personalInfo">
          <Card>
            <CardHeader>
              <CardTitle>Your Personal Information</CardTitle>
              <CardDescription>
                This information will be included in your generated CV.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PersonalInfoForm 
                defaultValues={profileData || {}}
                onSubmit={handlePersonalInfoSubmit}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cvBuilder">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Build Your CV</CardTitle>
                <CardDescription>
                  Fill in the details below to generate a customized CV for your job application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 border border-dashed border-gray-300 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Scan Existing CV</h3>
                  <div className="flex flex-col space-y-2">
                    <Input 
                      type="file" 
                      accept="image/*,.pdf" 
                      onChange={handleFileUpload}
                      className="mb-2"
                    />
                    <Button 
                      onClick={scanCV} 
                      disabled={!cvFile || isScanning} 
                      variant="outline" 
                      className="w-full"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Scan CV
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Frontend Developer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Skills</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. React, TypeScript, CSS (comma separated)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Experience</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your relevant work experience" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List your educational background" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="additionalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Information</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional information you'd like to include" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="templateStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CV Template Style</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a template style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cvTemplates.map(template => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-jobmate-600 hover:bg-jobmate-700" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating CV...
                        </>
                      ) : (
                        "Generate CV"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="flex flex-col h-full">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>CV Preview</CardTitle>
                  <CardDescription>
                    Your generated CV will appear here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[500px] overflow-auto">
                  {generatedCV ? (
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: generatedCV }}
                    />
                  ) : (
                    <EmptyStateCV />
                  )}
                </CardContent>
              </Card>
              
              {generatedCV && (
                <Button 
                  onClick={downloadAsPDF} 
                  className="mt-4 bg-jobmate-600 hover:bg-jobmate-700"
                  disabled={isPdfGenerating}
                >
                  {isPdfGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing Download...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Download as PDF
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CVBuilder;
