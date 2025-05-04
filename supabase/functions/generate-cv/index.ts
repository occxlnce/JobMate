
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const requestData = await req.json();
    console.log("Received request data:", JSON.stringify(requestData).substring(0, 200) + "...");
    
    const { profileData, jobTitle, templateStyle, focusOnRecent, includeProjects } = requestData;
    
    // Validate that profileData exists
    if (!profileData) {
      console.error('Missing profileData in request');
      return new Response(JSON.stringify({ 
        error: 'Profile data is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Create a prompt based on whether a job title was provided
    let prompt = `You are a professional CV writer. Generate a South African-style CV for this user based on the following profile data:\n\n`;
    
    if (jobTitle) {
      prompt += `Please customize this CV specifically for a ${jobTitle} position, emphasizing relevant skills and experience.\n\n`;
    }
    
    // Format the profile data for the prompt
    prompt += `Full Name: ${profileData.full_name || 'Not provided'}\n`;
    prompt += `Email: ${profileData.email || 'Not provided'}\n`;
    prompt += `Location: ${profileData.location || 'Not provided'}\n\n`;
    
    prompt += `Skills: ${Array.isArray(profileData.skills) ? profileData.skills.join(', ') : (profileData.skills || 'None provided')}\n\n`;
    
    // Add education section
    prompt += `Education:\n`;
    if (Array.isArray(profileData.education) && profileData.education.length > 0) {
      profileData.education.forEach((edu: any) => {
        prompt += `- ${edu.degree || ''} in ${edu.field || ''} from ${edu.institution || ''} (${edu.start_date || ''} to ${edu.end_date || ''})\n`;
      });
    } else {
      prompt += `None provided\n`;
    }
    
    // Add experience section
    prompt += `\nWork Experience:\n`;
    if (Array.isArray(profileData.experience) && profileData.experience.length > 0) {
      profileData.experience.forEach((exp: any) => {
        prompt += `- ${exp.position || ''} at ${exp.company || ''} (${exp.start_date || ''} to ${exp.end_date || 'Present'})\n`;
        prompt += `  ${exp.description || ''}\n`;
      });
    } else {
      prompt += `None provided\n`;
    }
    
    // Add projects section if requested
    if (includeProjects !== false) {
      prompt += `\nProjects:\n`;
      if (Array.isArray(profileData.projects) && profileData.projects.length > 0) {
        profileData.projects.forEach((proj: any) => {
          prompt += `- ${proj.title || ''}: ${proj.description || ''} ${proj.url ? `(${proj.url})` : ''}\n`;
        });
      } else {
        prompt += `None provided\n`;
      }
    }
    
    // Add template style preference if provided
    if (templateStyle) {
      prompt += `\nUse a ${templateStyle} style for the CV formatting.\n`;
    }
    
    // Add focus preference if provided
    if (focusOnRecent === true) {
      prompt += `\nPlease focus on highlighting the most recent experience and achievements.\n`;
    }
    
    prompt += `\nPlease format the CV professionally with sections for Personal Information, Skills, Education, Work Experience, and Projects. Use appropriate styling for a South African professional CV standard.`;

    console.log("Sending prompt to OpenAI:", prompt.substring(0, 200) + "...");

    // Call OpenAI API to generate the CV
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional CV writer specializing in South African CV standards.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API error:', data.error);
      throw new Error(data.error.message || 'Error generating CV');
    }
    
    const generatedCV = data.choices[0].message.content;
    console.log("CV generated successfully, length:", generatedCV.length);

    return new Response(JSON.stringify({ 
      cv: generatedCV,
      jobTitle: jobTitle || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-cv function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
