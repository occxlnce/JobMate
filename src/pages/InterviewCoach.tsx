
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InterviewHistory from '@/components/interview/InterviewHistory';

// Import the existing InterviewPractice component (assuming it exists)
// If you need to create this component, let me know
import InterviewPractice from '@/components/interview/InterviewPractice';

const InterviewCoach = () => {
  const [activeTab, setActiveTab] = useState('practice');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Interview Coach</h1>
        <p className="text-muted-foreground mt-2">
          Practice interview questions and review your past sessions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="practice">Practice Interview</TabsTrigger>
          <TabsTrigger value="history">Interview History</TabsTrigger>
        </TabsList>

        <TabsContent value="practice">
          <InterviewPractice />
        </TabsContent>

        <TabsContent value="history">
          <InterviewHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewCoach;
