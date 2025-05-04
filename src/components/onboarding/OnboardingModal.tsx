
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Briefcase, FileText, MessageSquare } from "lucide-react";

type Step = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const steps: Step[] = [
  {
    title: "Welcome to JobMate AI",
    description: "Your AI-powered career assistant that helps you land your dream job. Let's start by exploring the key features.",
    icon: <Briefcase className="h-10 w-10 text-jobmate-600" />,
  },
  {
    title: "Build Your Professional CV",
    description: "Use our AI-powered CV builder to create professional CVs tailored to specific job roles in just minutes.",
    icon: <FileText className="h-10 w-10 text-jobmate-600" />,
  },
  {
    title: "Find Matching Jobs",
    description: "Discover job opportunities that match your skills and experience with our AI job matching system.",
    icon: <Briefcase className="h-10 w-10 text-jobmate-600" />,
  },
  {
    title: "Practice Interviews",
    description: "Prepare for interviews with our AI interview coach that provides personalized feedback on your responses.",
    icon: <MessageSquare className="h-10 w-10 text-jobmate-600" />,
  },
];

type OnboardingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const OnboardingModal = ({ open, onOpenChange }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      // Save to local storage that onboarding is complete
      localStorage.setItem("onboarding_completed", "true");
      onOpenChange(false);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {steps[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {steps[currentStep].icon}
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <p className="text-center text-muted-foreground">
            {steps[currentStep].description}
          </p>
        </div>
        <div className="flex justify-center mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-12 rounded-full mx-1 ${
                index === currentStep ? "bg-jobmate-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground"
          >
            Skip
          </Button>
          <Button onClick={handleNext} className="bg-jobmate-600 hover:bg-jobmate-700">
            {isLastStep ? (
              <>
                Get Started <Check className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
