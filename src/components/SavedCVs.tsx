
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SavedCV {
  id: string;
  title: string;
  content: string;
  created_at: string;
  job_title?: string;
}

export function SavedCVs() {
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSavedCVs() {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('saved_cvs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setSavedCVs(data || []);
      } catch (error: any) {
        console.error("Error fetching saved CVs:", error.message);
        toast({
          title: "Error fetching saved CVs",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchSavedCVs();
  }, [user, toast]);

  const handleDownload = (cv: SavedCV) => {
    // Create a styled HTML version of the CV
    const styledHTML = `
      <html>
        <head>
          <title>${cv.title || "My CV"}</title>
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
            ${cv.content}
          </div>
        </body>
      </html>
    `;
    
    // Convert HTML to a downloadable blob
    const blob = new Blob([styledHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cv.title || 'my-cv'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "CV Downloaded",
      description: "Your CV has been downloaded. Open it in a browser and use the print option to save as PDF.",
    });
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('saved_cvs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setSavedCVs(savedCVs.filter(cv => cv.id !== id));
      
      toast({
        title: "CV Deleted",
        description: "Your CV has been permanently deleted.",
      });
    } catch (error: any) {
      console.error("Error deleting CV:", error.message);
      toast({
        title: "Error deleting CV",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (savedCVs.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No CVs saved yet</h3>
        <p className="text-muted-foreground mb-4">
          Generate your first CV in the CV Builder section
        </p>
        <Button asChild>
          <a href="/cv-builder">
            <FileText className="mr-2 h-4 w-4" />
            Create CV
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {savedCVs.map((cv) => (
        <Card key={cv.id}>
          <CardHeader>
            <CardTitle className="line-clamp-1">
              {cv.title || "Untitled CV"}
            </CardTitle>
            <CardDescription>
              {cv.job_title && `For: ${cv.job_title}`}
              {cv.created_at && (
                <div className="text-xs text-muted-foreground mt-1">
                  Created on {new Date(cv.created_at).toLocaleDateString()}
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none h-28 overflow-hidden text-ellipsis"
              dangerouslySetInnerHTML={{ __html: cv.content.substring(0, 200) + "..." }}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDownload(cv)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-500 hover:text-red-500"
              onClick={() => handleDelete(cv.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
