
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: {
    role: string;
    content: string;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[85%] text-sm",
          isUser
            ? "bg-jobmate-600 text-white"
            : "bg-muted text-foreground"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
