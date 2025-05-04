
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Book, BookOpen, Calendar } from "lucide-react";
import { ExternalLink } from "../ui/external-link";

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

interface LearningResourcesListProps {
  resources: LearningResource[];
  isLoading: boolean;
  onToggleCompleted: (id: string, completed: boolean) => void;
}

export function LearningResourcesList({ 
  resources, 
  isLoading, 
  onToggleCompleted 
}: LearningResourcesListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <Book className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No learning resources found</h3>
        <p className="text-muted-foreground">
          Add your first learning resource to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <Card key={resource.id} className={`
          overflow-hidden
          ${resource.completed ? 'bg-muted/50 border-dashed' : ''}
        `}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <Badge variant={getBadgeVariant(resource.level)}>
                {resource.level}
              </Badge>
              <Badge variant="outline">
                {resource.source}
              </Badge>
            </div>
            <CardTitle className="mt-2 line-clamp-2">{resource.title}</CardTitle>
            <CardDescription>
              <Badge variant="outline" className="mr-2">
                {resource.skill}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {resource.description && (
              <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                {resource.description}
              </p>
            )}
            {resource.duration && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 mr-1" />
                {resource.duration}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center">
              <span className="text-sm mr-2">Completed</span>
              <Switch
                checked={resource.completed}
                onCheckedChange={(checked) => onToggleCompleted(resource.id, checked)}
              />
            </div>
            <ExternalLink href={resource.url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Open
              </Button>
            </ExternalLink>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Helper function to determine badge variant based on level
function getBadgeVariant(level: string): "default" | "secondary" | "destructive" {
  switch (level.toLowerCase()) {
    case "beginner":
      return "default";
    case "intermediate":
      return "secondary";
    case "advanced":
      return "destructive";
    default:
      return "default";
  }
}
