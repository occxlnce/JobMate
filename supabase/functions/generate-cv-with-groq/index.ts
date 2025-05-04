
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
    const supabase = createClient(
      SUPABASE_URL ?? "",
      SUPABASE_SERVICE_ROLE_KEY ?? ""
    );

    const { 
      jobTitle,
      skills,
      workExperience,
      education,
      additionalInfo,
      templateStyle,
      userId
    } = await req.json();

    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GROQ API key is not configured.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user profile data to include in CV
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
    }

    // Create prompt with full personal information
    const prompt = `
    Create a professional CV for a ${jobTitle} position using the ${templateStyle} style template.

    ${profileData ? `
    # Personal Information
    Full Name: ${profileData.full_name || 'Full Name'}
    Email: ${profileData.email || 'Email'}
    Phone: ${profileData.phone_number || 'Phone Number'}
    Location: ${profileData.location || 'Location'}
    LinkedIn: ${profileData.linkedin_url || 'LinkedIn URL'}
    ` : '# Personal Information\nInclude a section for personal contact information (name, email, phone, location, LinkedIn)'}

    # Professional Summary
    ${profileData?.professional_summary || additionalInfo || 'Create a professional summary based on the skills and experience provided.'}

    # Skills
    ${Array.isArray(skills) ? skills.join(', ') : skills || (profileData?.skills ? profileData.skills.join(', ') : 'List of skills TBD')}

    # Work Experience
    ${workExperience || (profileData?.experience ? JSON.stringify(profileData.experience) : 'Work experience details TBD')}

    # Education
    ${education || (profileData?.education ? JSON.stringify(profileData.education) : 'Education details TBD')}

    ${profileData?.projects ? `
    # Projects
    ${JSON.stringify(profileData.projects)}
    ` : ''}

    ${profileData?.certifications ? `
    # Certifications
    ${JSON.stringify(profileData.certifications)}
    ` : ''}
    
    # References
    ${profileData?.references ? JSON.stringify(profileData.references) : 'Include a "References available upon request" section'}
    
    # Additional Information
    ${additionalInfo || ''}

    # Template Instructions
    Use a ${templateStyle} style for the CV, making it clean, professional, and well-formatted with proper HTML structure.
    Include all sections with appropriate headers.
    Format the CV using HTML only (no CSS) so it can be directly rendered in a web application.
    Make sure to include the full name, email, phone number, location, and LinkedIn URL in the header section.
    If references are provided, include them. Otherwise, add "References available upon request".
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
            content: "You are a professional CV writer. Create a well-structured, professional CV in HTML format that can be directly rendered in a web application."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Error from Groq API:", data);
      throw new Error(`Groq API error: ${data.error?.message || JSON.stringify(data)}`);
    }

    const cvContent = data.choices[0].message.content;

    // Save CV to database
    try {
      const { error: insertError } = await supabase
        .from("generated_cvs")
        .insert({
          user_id: userId,
          cv_content: cvContent,
          job_title: jobTitle
        });

      if (insertError) {
        console.error("Failed to save CV to Supabase", insertError);
      }
    } catch (dbError) {
      console.error("Error saving CV to Supabase", dbError);
    }

    return new Response(
      JSON.stringify({ cvContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in generate-cv-with-groq function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
