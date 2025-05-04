
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      SUPABASE_URL || "",
      SUPABASE_SERVICE_ROLE_KEY || ""
    );

    const { userId, message, sessionId, contextMessages } = await req.json();

    // Validate required parameters
    if (!userId || !message) {
      throw new Error("Missing required parameters: userId and message are required");
    }

    // Create a new session if sessionId is not provided
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: userId,
          messages_json: [],
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (sessionError) {
        throw new Error(`Failed to create chat session: ${sessionError.message}`);
      }

      currentSessionId = newSession.id;
    }

    // Prepare the history for the AI model
    let history = contextMessages || [];
    
    // If no context messages, retrieve them from the database
    if (!contextMessages || contextMessages.length === 0) {
      const { data: sessionData, error: sessionError } = await supabase
        .from("chat_sessions")
        .select("messages_json")
        .eq("id", currentSessionId)
        .single();

      if (!sessionError && sessionData) {
        history = sessionData.messages_json || [];
      }
    }

    // Add the user message to history
    const userMessage = { role: "user", content: message };
    history.push(userMessage);

    // Make API request to Groq
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: `You are JobMate AI, an AI assistant specialized in career advice, job searching, resume building, and interview preparation. 
            You help users with: career guidance, CV improvements, interview tips, job application strategies, and using the JobMate platform.
            Keep responses helpful, concise (under 150 words), and focused on career development. 
            When appropriate, guide users to relevant features of the JobMate platform like CV Builder, Cover Letter Generator, Interview Coach, and Learning Resources.
            Avoid discussing topics unrelated to careers and job searching.`
          },
          ...history
        ],
        temperature: 0.7,
        max_tokens: 800,
      })
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json();
      throw new Error(`Groq API error: ${JSON.stringify(errorData)}`);
    }

    const data = await groqResponse.json();
    const assistantMessage = data.choices[0].message;
    
    // Add assistant response to history
    history.push(assistantMessage);

    // Update the chat session in the database
    const { error: updateError } = await supabase
      .from("chat_sessions")
      .update({
        messages_json: history,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentSessionId);

    if (updateError) {
      console.error("Error updating chat session:", updateError);
    }

    return new Response(
      JSON.stringify({
        message: assistantMessage.content,
        sessionId: currentSessionId,
        history,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in jobmate-assistant function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
