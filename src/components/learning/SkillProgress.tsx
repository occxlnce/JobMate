
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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

interface SkillProgressProps {
  skill: string;
  resources: LearningResource[];
}

export function SkillProgress({ skill, resources }: SkillProgressProps) {
  const totalResources = resources.length;
  const completedResources = resources.filter(r => r.completed).length;
  const progressPercentage = totalResources > 0 
    ? Math.round((completedResources / totalResources) * 100) 
    : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <span className="font-medium mr-2">{skill}</span>
          <Badge variant="outline" className="text-xs">
            {totalResources} {totalResources === 1 ? 'resource' : 'resources'}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {completedResources} / {totalResources}
        </span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
}
