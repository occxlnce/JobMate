
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { CoverLetterPreviewModal } from "./CoverLetterPreviewModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type CoverLetter = {
  id: string;
  job_title: string;
  tone: string;
  created_at: string;
  generated_text: string;
};

export function SavedCoverLetters() {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<CoverLetter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCoverLetters();
  }, [user]);

  async function fetchCoverLetters() {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("cover_letters")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoverLetters(data || []);
    } catch (error) {
      console.error("Error fetching cover letters:", error);
      toast({
        title: "Failed to load cover letters",
        description: "There was an error loading your saved cover letters.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleViewCoverLetter = (coverLetter: CoverLetter) => {
    setSelectedCoverLetter(coverLetter);
    setIsModalOpen(true);
  };

  const handleDeleteCoverLetter = async (id: string) => {
    try {
      const { error } = await supabase.from("cover_letters").delete().eq("id", id);
      
      if (error) throw error;
      
      setCoverLetters((prev) => prev.filter((cl) => cl.id !== id));
      
      toast({
        title: "Cover letter deleted",
        description: "The cover letter has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting cover letter:", error);
      toast({
        title: "Deletion failed",
        description: "Failed to delete the cover letter.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (coverLetters.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-card">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No cover letters found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You haven't created any cover letters yet.
        </p>
        <Button className="mt-4" variant="outline" onClick={() => window.location.href = "/cover-letter"}>
          Create a Cover Letter
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {coverLetters.map((coverLetter) => (
          <Card key={coverLetter.id}>
            <CardHeader>
              <CardTitle className="line-clamp-2">{coverLetter.job_title}</CardTitle>
              <CardDescription>
                {format(new Date(coverLetter.created_at), "MMM d, yyyy")} - {coverLetter.tone}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm line-clamp-3 text-muted-foreground">
                {coverLetter.generated_text.substring(0, 150)}...
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleViewCoverLetter(coverLetter)}>
                View
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Cover Letter</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this cover letter? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteCoverLetter(coverLetter.id)}
                      className="bg-destructive text-destructive-foreground"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedCoverLetter && (
        <CoverLetterPreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          coverLetterText={selectedCoverLetter.generated_text}
          jobTitle={selectedCoverLetter.job_title}
        />
      )}
    </div>
  );
}
