
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Job API configuration
// Using RapidAPI's JSearch API as an example
const JSEARCH_API_KEY = Deno.env.get("JSEARCH_API_KEY") || ""; 
const JSEARCH_API_HOST = "jsearch.p.rapidapi.com";

// We'll use a free alternative if JSearch API key isn't available
const USE_ALTERNATIVE_API = !JSEARCH_API_KEY;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔄 Starting job fetch process...");
    
    const supabase = createClient(
      SUPABASE_URL || "",
      SUPABASE_SERVICE_ROLE_KEY || ""
    );
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }

    let jobsData;
    let apiSource;
    
    if (USE_ALTERNATIVE_API) {
      // Using the free Github Jobs API alternative
      console.log("Using alternative API for job data...");
      apiSource = "RemoteOK API";
      
      const response = await fetch("https://remoteok.io/api", {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; JobBoardFetcher/1.0;)",
        },
      });
      
      if (!response.ok) {
        throw new Error(`RemoteOK API error: ${response.status}`);
      }
      
      const rawData = await response.json();
      // Filter out the first item which is usually metadata
      const data = Array.isArray(rawData) ? rawData.filter((_, index) => index > 0) : [];
      
      // Transform the data to match our jobs table schema
      jobsData = data.map((job: any) => ({
        title: job.position || "Unknown Position",
        company: job.company || "Unknown Company",
        location: job.location || "Remote",
        description: job.description || "",
        url: job.url || `https://remoteok.io/l/${job.id}`,
        is_remote: true,
        posted_date: job.date ? new Date(job.date).toISOString() : new Date().toISOString(),
        requirements: job.tags || [],
      }));
    } else {
      // Using RapidAPI's JSearch
      console.log("Using JSearch API for job data...");
      apiSource = "JSearch API";
      
      const params = new URLSearchParams({
        query: "software developer",
        page: "1",
        num_pages: "1",
      });
      
      const response = await fetch(`https://${JSEARCH_API_HOST}/search?${params}`, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": JSEARCH_API_KEY,
          "X-RapidAPI-Host": JSEARCH_API_HOST,
        },
      });
      
      if (!response.ok) {
        throw new Error(`JSearch API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the data to match our jobs table schema
      jobsData = data.data.map((job: any) => ({
        title: job.job_title || "Unknown Position",
        company: job.employer_name || "Unknown Company",
        location: job.job_city ? `${job.job_city}, ${job.job_country}` : "Remote",
        description: job.job_description || "",
        url: job.job_apply_link || "",
        is_remote: job.job_is_remote || false,
        posted_date: job.job_posted_at_datetime_utc || new Date().toISOString(),
        requirements: job.job_required_skills || [],
        salary_min: job.job_min_salary || null,
        salary_max: job.job_max_salary || null,
      }));
    }
    
    console.log(`Fetched ${jobsData.length} jobs from ${apiSource}`);
    
    // Insert jobs into the database
    const { data: insertedJobs, error: insertError } = await supabase
      .from("jobs")
      .upsert(
        jobsData.map((job: any) => ({
          ...job,
          // Generate a unique string using title and company for upsert
          // to avoid duplicate jobs
          id: crypto.randomUUID()
        })),
        { onConflict: "title,company" } // Avoid duplicates based on title and company
      );
      
    if (insertError) {
      console.error("Error inserting jobs:", insertError);
      throw insertError;
    }
    
    console.log(`✅ Successfully inserted ${jobsData.length} jobs into the database`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully fetched and inserted ${jobsData.length} jobs from ${apiSource}`,
        source: apiSource,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
    
  } catch (error) {
    console.error("Error in fetch-jobs function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
