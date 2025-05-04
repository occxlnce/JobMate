
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProfileData = {
  id?: string;
  full_name: string | null;
  email: string | null;
  location: string | null;
  phone_number: string | null;
  linkedin_url: string | null;
  professional_summary: string | null;
  skills: string[] | null;
  experience: any[] | null;
  education: any[] | null;
  projects: any[] | null;
  certifications: any | null;
  languages: any | null;
  interests: string[] | null;
};

// Define the expected database profile format
type DatabaseProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  location: string | null;
  phone_number: string | null;
  linkedin_url: string | null;
  professional_summary: string | null;
  skills: string[] | null;
  experience: any[] | null;
  education: any[] | null;
  projects: any[] | null;
  certifications: any | null;
  languages: any | null;
  interests: string[] | null;
  created_at: string;
  updated_at: string;
};

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProfileData>({
    full_name: "",
    email: "",
    location: "",
    phone_number: "",
    linkedin_url: "",
    professional_summary: "",
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: null,
    languages: null,
    interests: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          toast({
            title: "Error",
            description: "Failed to load your profile. Please try again.",
            variant: "destructive",
          });
        } else if (data) {
          // Cast data to our expected database format
          const dbProfile = data as DatabaseProfile;
          
          // Create profile data from database record
          const profileData: ProfileData = {
            ...dbProfile,
          };
          setFormData(profileData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const skillsString = e.target.value;
    // Handle the case where skills might be null, undefined, or not a string
    const skillsArray = skillsString ? skillsString.split(',').map(skill => skill.trim()) : [];
    setFormData(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };
  
  const handleInterestsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const interestsString = e.target.value;
    const interestsArray = interestsString ? interestsString.split(',').map(interest => interest.trim()) : [];
    setFormData(prev => ({
      ...prev,
      interests: interestsArray
    }));
  };

  // Helper functions to handle experience and education as text areas
  const handleExperienceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const experienceText = e.target.value;
      // Store as JSON string in the array format
      const experienceArray = experienceText ? 
        experienceText.split('\n\n').map(exp => {
          const [title, company, period, description] = exp.split('\n');
          return { title, company, period, description };
        }) : [];
      
      setFormData(prev => ({
        ...prev,
        experience: experienceArray
      }));
    } catch (error) {
      console.error("Error parsing experience:", error);
    }
  };

  const handleEducationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const educationText = e.target.value;
      // Store as JSON string in the array format
      const educationArray = educationText ? 
        educationText.split('\n\n').map(edu => {
          const [degree, institution, year, details] = edu.split('\n');
          return { degree, institution, year, details };
        }) : [];
      
      setFormData(prev => ({
        ...prev,
        education: educationArray
      }));
    } catch (error) {
      console.error("Error parsing education:", error);
    }
  };

  const handleProjectsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const projectsText = e.target.value;
      // Store as JSON string in the array format
      const projectsArray = projectsText ? 
        projectsText.split('\n\n').map(proj => {
          const [name, description, technologies, link] = proj.split('\n');
          return { name, description, technologies, link };
        }) : [];
      
      setFormData(prev => ({
        ...prev,
        projects: projectsArray
      }));
    } catch (error) {
      console.error("Error parsing projects:", error);
    }
  };

  // Format experience, education, and projects for display in textarea
  const formatExperienceForTextArea = () => {
    if (!formData.experience || !Array.isArray(formData.experience) || formData.experience.length === 0) {
      return "";
    }
    
    return formData.experience.map(exp => {
      return `${exp.title || ''}\n${exp.company || ''}\n${exp.period || ''}\n${exp.description || ''}`;
    }).join('\n\n');
  };

  const formatEducationForTextArea = () => {
    if (!formData.education || !Array.isArray(formData.education) || formData.education.length === 0) {
      return "";
    }
    
    return formData.education.map(edu => {
      return `${edu.degree || ''}\n${edu.institution || ''}\n${edu.year || ''}\n${edu.details || ''}`;
    }).join('\n\n');
  };

  const formatProjectsForTextArea = () => {
    if (!formData.projects || !Array.isArray(formData.projects) || formData.projects.length === 0) {
      return "";
    }
    
    return formData.projects.map(proj => {
      return `${proj.name || ''}\n${proj.description || ''}\n${proj.technologies || ''}\n${proj.link || ''}`;
    }).join('\n\n');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Fix the TypeScript error by ensuring skills is a string before calling split
      const skillsToSave = Array.isArray(formData.skills) 
        ? formData.skills 
        : [];

      const interestsToSave = Array.isArray(formData.interests)
        ? formData.interests
        : [];

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          full_name: formData.full_name,
          email: formData.email,
          location: formData.location,
          phone_number: formData.phone_number,
          linkedin_url: formData.linkedin_url,
          professional_summary: formData.professional_summary,
          skills: skillsToSave,
          experience: formData.experience,
          education: formData.education,
          projects: formData.projects,
          certifications: formData.certifications,
          languages: formData.languages,
          interests: interestsToSave,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
          <CardDescription>Update your professional profile information here. This information will be used for your CV and job applications.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-jobmate-600" />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="basic">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="additional">Additional</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name || ""}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      type="text"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number || ""}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location || ""}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                    <Input
                      type="url"
                      id="linkedin_url"
                      name="linkedin_url"
                      value={formData.linkedin_url || ""}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="professional_summary">Professional Summary</Label>
                    <Textarea
                      id="professional_summary"
                      name="professional_summary"
                      value={formData.professional_summary || ""}
                      onChange={handleChange}
                      placeholder="A brief summary of your professional background and goals"
                      className="mt-1 min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="skills">Skills</Label>
                    <Textarea
                      id="skills"
                      name="skills"
                      value={Array.isArray(formData.skills) ? formData.skills.join(', ') : ''}
                      onChange={handleSkillsChange}
                      placeholder="Enter your skills, separated by commas"
                      className="mt-1"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="experience" className="space-y-4">
                  <div>
                    <Label htmlFor="experience">Work Experience</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Format: Job Title, Company, Period, Description. Separate each position with a blank line.
                    </p>
                    <Textarea
                      id="experience"
                      name="experience"
                      value={formatExperienceForTextArea()}
                      onChange={handleExperienceChange}
                      placeholder="Software Developer
Acme Inc.
2020-2022
Developed web applications using React and Node.js"
                      className="mt-1 min-h-[300px]"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="education" className="space-y-4">
                  <div>
                    <Label htmlFor="education">Education</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Format: Degree, Institution, Year, Details. Separate each education with a blank line.
                    </p>
                    <Textarea
                      id="education"
                      name="education"
                      value={formatEducationForTextArea()}
                      onChange={handleEducationChange}
                      placeholder="Bachelor of Science in Computer Science
University of Example
2015-2019
Graduated with honors, GPA 3.8/4.0"
                      className="mt-1 min-h-[300px]"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="additional" className="space-y-4">
                  <div>
                    <Label htmlFor="projects">Projects</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Format: Project Name, Description, Technologies, Link. Separate each project with a blank line.
                    </p>
                    <Textarea
                      id="projects"
                      name="projects"
                      value={formatProjectsForTextArea()}
                      onChange={handleProjectsChange}
                      placeholder="Personal Website
A responsive portfolio website
React, Tailwind CSS, Next.js
https://mywebsite.com"
                      className="mt-1 min-h-[200px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="interests">Interests</Label>
                    <Textarea
                      id="interests"
                      name="interests"
                      value={Array.isArray(formData.interests) ? formData.interests.join(', ') : ''}
                      onChange={handleInterestsChange}
                      placeholder="Enter your interests, separated by commas"
                      className="mt-1"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button disabled={isLoading} className="w-full bg-jobmate-600 hover:bg-jobmate-700 mt-6">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
