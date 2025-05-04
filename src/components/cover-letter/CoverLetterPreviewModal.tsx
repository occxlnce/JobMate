
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Edit, Loader2 } from "lucide-react";
import html2pdf from 'html-to-pdf-js';
import { format } from 'date-fns';

type CoverLetterPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  coverLetterText: string;
  jobTitle: string;
};

export function CoverLetterPreviewModal({
  isOpen,
  onClose,
  coverLetterText,
  jobTitle,
}: CoverLetterPreviewModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(coverLetterText);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? editedText : coverLetterText);
    toast({
      title: "Copied to clipboard",
      description: "The cover letter has been copied to your clipboard.",
    });
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Create PDF element
      const element = document.createElement("div");
      element.innerHTML = `
        <div style="padding: 40px; font-family: 'Arial', sans-serif; line-height: 1.6;">
          <h2 style="text-align: center; margin-bottom: 30px;">Cover Letter for ${jobTitle}</h2>
          <div style="white-space: pre-line;">
            ${isEditing ? editedText : coverLetterText}
          </div>
          <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
            Generated with JobMate AI on ${format(new Date(), 'MMMM d, yyyy')}
          </div>
        </div>
      `;
      
      document.body.appendChild(element);
      
      // Generate and download PDF
      const pdf = await html2pdf()
        .set({
          margin: [15, 15],
          filename: `Cover_Letter_${jobTitle.replace(/\s+/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(element)
        .save();
      
      document.body.removeChild(element);
      
      toast({
        title: "PDF downloaded",
        description: "Your cover letter has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the cover letter as PDF.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cover Letter for {jobTitle}</DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="min-h-[60vh] font-mono"
          />
        ) : (
          <div className="border rounded-md p-4 min-h-[60vh] whitespace-pre-line">
            {coverLetterText}
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {isEditing ? (
            <Button variant="default" onClick={handleSaveEdit} className="w-full sm:w-auto">
              Save Changes
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
          <Button variant="outline" onClick={handleCopy} className="w-full sm:w-auto">
            <Copy className="mr-2 h-4 w-4" /> Copy
          </Button>
          <Button 
            variant="default" 
            onClick={handleDownloadPDF} 
            disabled={isDownloading}
            className="w-full sm:w-auto"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
