
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Book, BookCheck, ChartBar } from "lucide-react";
import { LearningResourcesList } from "@/components/learning/LearningResourcesList";
import { AddResourceForm } from "@/components/learning/AddResourceForm";
import { SkillProgress } from "@/components/learning/SkillProgress";

type LearningResource = {
  id: string;
  skill: string;
  source: string;
  title: string;
  url: string;
  description: string | null;
  duration: string | null;
  level: string;
  completed: boolean;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function LearningResources() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user) {
      fetchLearningResources();
    }
  }, [user]);

  const fetchLearningResources = async () => {
    try {
      setIsLoading(true);

      // First call the function to add default resources if this is the first time
      await supabase.rpc('add_default_learning_resources', {
        p_user_id: user?.id
      });

      // Then fetch all resources for the user
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .order('skill', { ascending: true });

      if (error) {
        throw error;
      }

      setResources(data || []);
    } catch (error) {
      console.error("Error fetching learning resources:", error);
      toast({
        title: "Failed to load learning resources",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompleted = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('learning_resources')
        .update({ completed })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setResources(resources.map(resource => 
        resource.id === id ? { ...resource, completed } : resource
      ));

      toast({
        title: completed ? "Resource marked as completed" : "Resource marked as incomplete",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating resource:", error);
      toast({
        title: "Failed to update resource",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Calculate completion statistics
  const totalResources = resources.length;
  const completedResources = resources.filter(r => r.completed).length;
  const completionRate = totalResources > 0 
    ? Math.round((completedResources / totalResources) * 100) 
    : 0;

  // Prepare data for the pie chart
  const resourcesByLevel = [
    { name: "Beginner", value: resources.filter(r => r.level === "Beginner").length },
    { name: "Intermediate", value: resources.filter(r => r.level === "Intermediate").length },
    { name: "Advanced", value: resources.filter(r => r.level === "Advanced").length }
  ].filter(item => item.value > 0);

  // Group resources by skill
  const skillsMap = resources.reduce((acc, resource) => {
    if (!acc[resource.skill]) {
      acc[resource.skill] = [];
    }
    acc[resource.skill].push(resource);
    return acc;
  }, {} as Record<string, LearningResource[]>);

  const skills = Object.keys(skillsMap).sort();

  // Filter resources based on active tab
  const filteredResources = activeTab === "all" 
    ? resources 
    : resources.filter(r => r.level === activeTab);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Learning Resources & Skill Roadmap</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Book className="mr-2" /> Learning Progress
          </h2>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <div className="text-3xl font-bold">{completionRate}%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-primary rounded-full h-2" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completed</span>
              <span>{completedResources} of {totalResources}</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BookCheck className="mr-2" /> Learning by Level
          </h2>
          {resourcesByLevel.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={resourcesByLevel}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {resourcesByLevel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Resources"]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              No resources available yet
            </div>
          )}
          <div className="mt-4">
            {resourcesByLevel.map((level, index) => (
              <div key={level.name} className="flex items-center text-sm mb-1">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span>{level.name}</span>
                <span className="ml-auto">{level.value}</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ChartBar className="mr-2" /> Skills Overview
          </h2>
          <div className="space-y-4 max-h-[220px] overflow-y-auto">
            {skills.map(skill => (
              <SkillProgress 
                key={skill}
                skill={skill}
                resources={skillsMap[skill]}
              />
            ))}
            {skills.length === 0 && (
              <div className="text-center text-muted-foreground">
                No skills available yet
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="Beginner">Beginner</TabsTrigger>
            <TabsTrigger value="Intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="Advanced">Advanced</TabsTrigger>
          </TabsList>
          <AddResourceForm 
            onResourceAdded={fetchLearningResources}
            skills={skills}
          />
        </div>
        
        <TabsContent value={activeTab}>
          <LearningResourcesList 
            resources={filteredResources} 
            isLoading={isLoading} 
            onToggleCompleted={toggleCompleted}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
