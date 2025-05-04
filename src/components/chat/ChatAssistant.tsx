
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { ChatMessage } from "./ChatMessage";

// Define types for chat messages and sessions
type Message = {
  role: string;
  content: string;
};

type ChatSession = {
  id: string;
  user_id: string;
  messages_json: Message[];
  created_at: string;
  updated_at: string;
};

export const ChatAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Hi there! I'm JobMate AI, your career assistant. How can I help you today with your job search, resume, interviews, or career questions?" 
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Load previous chat session if available
  useEffect(() => {
    const loadPreviousSession = async () => {
      if (!user) return;
      
      try {
        // Using type casting to work with the chat_sessions table
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('id, messages_json')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          console.log("No previous chat session found");
          return;
        }
        
        if (data && data.messages_json && Array.isArray(data.messages_json) && data.messages_json.length > 0) {
          setSessionId(data.id);
          setMessages(data.messages_json as Message[]);
        }
      } catch (error) {
        console.error("Error loading previous chat session:", error);
      }
    };

    loadPreviousSession();
  }, [user]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;
    
    try {
      setIsLoading(true);
      
      // Add user message to the chat
      const updatedMessages = [...messages, { role: "user", content: message }];
      setMessages(updatedMessages);
      setMessage("");

      // Call the Supabase Edge Function
      const response = await fetch("https://evjkscfkqutxguurpmpd.supabase.co/functions/v1/jobmate-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          message: message.trim(),
          sessionId,
          contextMessages: updatedMessages
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get a response from the assistant");
      }

      const data = await response.json();
      
      // Update state with AI response
      setMessages([...updatedMessages, { role: "assistant", content: data.message }]);
      setSessionId(data.sessionId);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive"
      });
      
      // Add error message to chat
      setMessages([
        ...messages, 
        { role: "user", content: message },
        { role: "assistant", content: "Sorry, I'm having trouble responding right now. Please try again later." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!user) return;
    
    const initialMessage = { 
      role: "assistant", 
      content: "Hi there! I'm JobMate AI, your career assistant. How can I help you today?" 
    };
    
    setMessages([initialMessage]);
    setSessionId(null);
    
    try {
      // Using type casting to work with the chat_sessions table
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          messages_json: [initialMessage],
        })
        .select('id')
        .single();
        
      if (error) {
        console.error("Error creating new chat session:", error);
        return;
      }
      
      setSessionId(data.id);
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-jobmate-600 hover:bg-jobmate-700 shadow-lg p-0"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageSquare className="h-6 w-6" />
          )}
        </Button>
      </div>
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 right-4 z-50 w-80 md:w-96"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="shadow-xl border border-jobmate-100">
              <CardHeader className="bg-jobmate-50 border-b border-jobmate-100 p-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-jobmate-600" />
                    JobMate Assistant
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearChat}
                    className="h-8 w-8 p-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    <span className="sr-only">Clear chat</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-80 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              <CardFooter className="p-3 border-t border-jobmate-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex w-full gap-2"
                >
                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!message.trim() || isLoading}
                    className="bg-jobmate-600 hover:bg-jobmate-700"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
