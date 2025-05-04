
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Interview feedback generation edge function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobTitle, question, answer } = await req.json();
    
    if (!question || !answer) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required parameters",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // Generate feedback based on the answer
    // In a real implementation, this would use OpenAI or another AI service
    const feedback = generateFeedback(answer, question);
    
    // Generate score based on the answer
    const score = generateScore(answer);
    
    // Generate improvement points
    const improvements = generateImprovements(answer, jobTitle);
    
    // Generate strengths
    const strengths = generateStrengths(answer);
    
    return new Response(
      JSON.stringify({
        success: true,
        feedback,
        score,
        improvements,
        strengths,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

// Function to generate feedback based on the answer
function generateFeedback(answer: string, question: string): string {
  if (answer.length < 50) {
    return "Your answer was quite brief. Consider providing more details and examples to fully demonstrate your skills and experience.";
  }
  
  if (answer.includes("example") || answer.includes("instance") || answer.includes("case")) {
    return "Good job providing specific examples in your answer. This helps the interviewer understand your past experiences and achievements.";
  }
  
  if (answer.includes("challenge") || answer.includes("problem") || answer.includes("obstacle")) {
    return "Your answer effectively addresses challenges you've faced. Consider adding more details about the specific actions you took to overcome these challenges.";
  }
  
  if (answer.length > 300) {
    return "You provided a comprehensive answer with good details. Consider structuring your response using the STAR method (Situation, Task, Action, Result) for even greater clarity.";
  }
  
  return "Your answer is satisfactory. To strengthen it further, try to include specific examples, quantifiable achievements, and clear connections to the skills required for the position.";
}

// Function to generate a score based on the answer
function generateScore(answer: string): number {
  let score = 70; // Base score
  
  // Increase score for longer, more detailed answers (up to a point)
  if (answer.length > 100) score += 5;
  if (answer.length > 200) score += 5;
  if (answer.length > 400) score -= 5; // Too long becomes a negative
  
  // Increase score for specific keywords that indicate good structured responses
  if (answer.includes("example")) score += 5;
  if (answer.includes("result")) score += 5;
  if (answer.includes("learned")) score += 5;
  if (answer.includes("achieved")) score += 5;
  
  // Cap the score at 100
  return Math.min(100, score);
}

// Function to generate improvement suggestions
function generateImprovements(answer: string, jobTitle: string): string[] {
  const improvements = [];
  
  if (answer.length < 100) {
    improvements.push("Provide more detailed responses with specific examples");
  }
  
  if (!answer.includes("example") && !answer.includes("instance") && !answer.includes("case")) {
    improvements.push("Include concrete examples from your past experience");
  }
  
  if (!answer.includes("result") && !answer.includes("outcome") && !answer.includes("achievement")) {
    improvements.push("Emphasize the results and outcomes of your actions");
  }
  
  if (jobTitle && jobTitle.toLowerCase().includes("developer") || jobTitle && jobTitle.toLowerCase().includes("engineer")) {
    improvements.push("Highlight specific technical skills related to the position");
  }
  
  if (jobTitle && jobTitle.toLowerCase().includes("manager") || jobTitle && jobTitle.toLowerCase().includes("lead")) {
    improvements.push("Emphasize leadership examples and team management skills");
  }
  
  // Add general improvements if we don't have enough specific ones
  if (improvements.length < 3) {
    improvements.push("Use the STAR method (Situation, Task, Action, Result) to structure your answers");
    improvements.push("Quantify your achievements with specific metrics when possible");
    improvements.push("Practice concise delivery while maintaining comprehensive content");
  }
  
  return improvements.slice(0, 3); // Return max 3 improvements
}

// Function to generate strength observations
function generateStrengths(answer: string): string[] {
  const strengths = [];
  
  if (answer.length > 150) {
    strengths.push("Good level of detail in your responses");
  }
  
  if (answer.includes("example") || answer.includes("instance") || answer.includes("case")) {
    strengths.push("Effective use of specific examples to illustrate your points");
  }
  
  if (answer.includes("result") || answer.includes("outcome") || answer.includes("achievement")) {
    strengths.push("Strong focus on results and achievements");
  }
  
  if (answer.includes("team") || answer.includes("colleague") || answer.includes("collaboration")) {
    strengths.push("Demonstrated good teamwork and collaborative skills");
  }
  
  if (answer.includes("challenge") || answer.includes("problem") || answer.includes("solution")) {
    strengths.push("Showed problem-solving abilities and resilience");
  }
  
  // Add general strengths if we don't have enough specific ones
  if (strengths.length < 3) {
    strengths.push("Clear communication style");
    strengths.push("Relevant experience for the position");
    strengths.push("Good understanding of the role requirements");
  }
  
  return strengths.slice(0, 3); // Return max 3 strengths
}
