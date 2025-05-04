
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This simulates the WhatsApp API integration
// In production, you would connect to an actual WhatsApp API service like Twilio, MessageBird, etc.
async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  console.log(`[MOCK] Sending WhatsApp message to ${phoneNumber}: ${message}`);
  // In a real implementation, you would use the WhatsApp Business API, Twilio, or another service
  // Example with Twilio:
  // await fetch('https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //   },
  //   body: new URLSearchParams({
  //     'From': `whatsapp:+1TWILIO_NUMBER`,
  //     'To': `whatsapp:${phoneNumber}`,
  //     'Body': message,
  //   }),
  // });
  
  return { success: true };
}

async function getRecentJobs(supabase: any, preferences: any) {
  let query = supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(5);
  
  // Apply filters based on user preferences
  if (preferences.job_search_keywords && preferences.job_search_keywords.length > 0) {
    const keywordFilters = preferences.job_search_keywords.map((keyword: string) => 
      `title.ilike.%${keyword}%`
    );
    query = query.or(keywordFilters.join(','));
  }
  
  if (preferences.location_preferences && preferences.location_preferences.length > 0) {
    query = query.in('location', preferences.location_preferences);
  }
  
  if (preferences.min_salary) {
    query = query.gt('salary_min', preferences.min_salary);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
  
  return data;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }
  
  try {
    // Get the request data
    const { userId, manual = false } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing user ID' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 400 
        }
      );
    }
    
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get user's WhatsApp alert preferences
    const { data: alertPrefs, error: alertError } = await supabaseAdmin
      .from('whatsapp_alerts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (alertError) {
      throw new Error(`Error fetching alert preferences: ${alertError.message}`);
    }
    
    if (!alertPrefs || !alertPrefs.is_enabled) {
      return new Response(
        JSON.stringify({ success: false, message: 'WhatsApp alerts not configured or disabled for this user' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 400 
        }
      );
    }
    
    // Check if we should send alerts based on frequency (unless it's a manual trigger)
    if (!manual) {
      const now = new Date();
      const lastSent = alertPrefs.last_sent_at ? new Date(alertPrefs.last_sent_at) : null;
      
      if (lastSent) {
        if (alertPrefs.frequency === 'daily' && 
            now.getTime() - lastSent.getTime() < 24 * 60 * 60 * 1000) {
          return new Response(
            JSON.stringify({ success: false, message: 'Daily alert already sent today' }),
            { 
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
              status: 200 
            }
          );
        } else if (alertPrefs.frequency === 'weekly' && 
                 now.getTime() - lastSent.getTime() < 7 * 24 * 60 * 60 * 1000) {
          return new Response(
            JSON.stringify({ success: false, message: 'Weekly alert already sent this week' }),
            { 
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
              status: 200 
            }
          );
        }
      }
    }
    
    // Get recent matching jobs based on user preferences
    const jobs = await getRecentJobs(supabaseAdmin, alertPrefs);
    
    if (jobs.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No matching jobs found' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 200 
        }
      );
    }
    
    // Format message
    const jobListText = jobs.map((job: any) => 
      `🔹 ${job.title} at ${job.company} (${job.location})${job.salary_range ? ` - ${job.salary_range}` : ''}`
    ).join('\n');
    
    const message = 
      `🔔 *JobMate: New Job Matches*\n\n` +
      `We found ${jobs.length} new job${jobs.length > 1 ? 's' : ''} matching your preferences:\n\n` +
      jobListText + `\n\n` +
      `View details at: jobmate.app/jobs`;
    
    // Send WhatsApp message
    await sendWhatsAppMessage(alertPrefs.whatsapp_number, message);
    
    // Update last_sent_at timestamp
    await supabaseAdmin
      .from('whatsapp_alerts')
      .update({ last_sent_at: new Date().toISOString() })
      .eq('user_id', userId);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `WhatsApp alert sent to ${alertPrefs.whatsapp_number}`,
        jobsFound: jobs.length
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in WhatsApp alerts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500
      }
    );
  }
});
