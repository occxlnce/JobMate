
import { useState } from "react";
import { SavedCVs } from "@/components/SavedCVs";
import { SavedJobs } from "@/components/SavedJobs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SavedCoverLetters } from "@/components/cover-letter/SavedCoverLetters";

const SavedItems = () => {
  const [activeTab, setActiveTab] = useState("cvs");

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-4">Saved Items</h1>

      <Tabs defaultValue="cvs" className="w-full">
        <TabsList>
          <TabsTrigger value="cvs" onClick={() => setActiveTab("cvs")}>Saved CVs</TabsTrigger>
          <TabsTrigger value="coverLetters" onClick={() => setActiveTab("coverLetters")}>Cover Letters</TabsTrigger>
          <TabsTrigger value="jobs" onClick={() => setActiveTab("jobs")}>Saved Jobs</TabsTrigger>
        </TabsList>
        <TabsContent value="cvs">
          <SavedCVs />
        </TabsContent>
        <TabsContent value="coverLetters">
          <SavedCoverLetters />
        </TabsContent>
        <TabsContent value="jobs">
          <SavedJobs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SavedItems;
