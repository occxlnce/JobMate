
import { FileText } from "lucide-react";

export const EmptyStateCV = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
      <div className="h-12 w-12 rounded-full bg-jobmate-100 flex items-center justify-center">
        <FileText className="h-6 w-6 text-jobmate-600" />
      </div>
      <h2 className="text-xl font-semibold">Create Your Professional CV</h2>
      <p className="text-muted-foreground max-w-md">
        Fill in the details on the left and click "Generate with AI" to create a professional CV tailored to your profile and job preferences.
      </p>
    </div>
  );
};
