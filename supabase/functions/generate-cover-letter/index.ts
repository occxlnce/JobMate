
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      jobTitle, 
      jobDescription, 
      tone, 
      userName,
      userSkills,
      userExperience
    } = await req.json();

    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GROQ API key is not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create the prompt for the AI
    const prompt = `
    Write a professional cover letter for a ${jobTitle} position with the following details:

    # Job Description
    ${jobDescription}

    # Applicant Information
    Name: ${userName || 'Applicant'}
    Skills: ${userSkills || 'Adaptable to the job requirements'}
    Experience: ${userExperience || 'Relevant experience in the field'}

    # Tone Guidelines
    Use a ${tone.toLowerCase()} tone in the letter.
    ${tone === 'Formal' ? 'Write in a professional business style with formal language.' : ''}
    ${tone === 'Enthusiastic' ? 'Express passion and excitement for the role and company.' : ''}
    ${tone === 'Direct' ? 'Be concise and straightforward, focusing on key qualifications and fit.' : ''}

    # Cover Letter Structure
    1. Professional greeting and introduction that mentions the specific job
    2. A paragraph demonstrating understanding of the company/role
    3. A paragraph highlighting relevant skills and how they match the job
    4. A paragraph about relevant experience and accomplishments
    5. A conclusion with a call to action and contact information
    6. Professional sign-off

    # Important Instructions
    - Format as a standard business letter with proper spacing
    - DO NOT use any markdown formatting like asterisks (*) or other special characters
    - DO NOT include any notes or metadata at the end of the letter
    - DO NOT explain what you've done in the letter
    - DO NOT include a "Note:" section or any comments about the letter structure
    - Do not include any information that wasn't provided (like email or phone number)
    - Keep paragraphs concise and focused
    
    Produce a clean, professional cover letter without any additional text that is not part of the cover letter itself.
    `;

    // Call the Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
            content: "You are a professional cover letter writer. Create well-structured, persuasive cover letters tailored to specific job descriptions without any explanatory notes or metadata."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    let coverLetter = data.choices[0].message.content;
    
    // Clean up the response to remove any markdown or additional notes
    coverLetter = coverLetter.replace(/\*\*/g, ''); // Remove any bold formatting
    coverLetter = coverLetter.replace(/\*/g, '');   // Remove any italic formatting
    
    // Remove any notes or instructions sections
    if (coverLetter.toLowerCase().includes('note:')) {
      coverLetter = coverLetter.substring(0, coverLetter.toLowerCase().indexOf('note:'));
    }
    
    // Save to Supabase if configured
    if (req.headers.get('authorization') && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const token = req.headers.get('authorization')?.replace('Bearer ', '');
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Verify the user token
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        // Store the generated cover letter
        await supabase
          .from('cover_letters')
          .insert({
            user_id: user.id,
            job_title: jobTitle,
            job_description: jobDescription,
            tone: tone,
            generated_text: coverLetter
          });
      }
    }

    return new Response(
      JSON.stringify({ coverLetter }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in generate-cover-letter function:", error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
