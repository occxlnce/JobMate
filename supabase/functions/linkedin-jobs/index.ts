
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const LINKEDIN_API_URL = "https://api.linkedin.com/v2/jobSearch";
const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID");
const LINKEDIN_CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET");

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("query") || "";
    const location = url.searchParams.get("location") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const experience = url.searchParams.get("experience") || "";
    
    let accessToken;
    
    try {
      // Get LinkedIn access token
      const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: LINKEDIN_CLIENT_ID || "",
          client_secret: LINKEDIN_CLIENT_SECRET || "",
        }),
      });
      
      if (!tokenResponse.ok) {
        throw new Error(`LinkedIn API error: ${tokenResponse.status}`);
      }
      
      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;
    } catch (error) {
      console.error("Error getting LinkedIn access token:", error);
      
      // Fallback to mock data if API connection fails
      const mockJobs = generateMockJobs(query, location, experience, page, limit);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: mockJobs,
          pagination: {
            page,
            limit,
            total: 100,
            hasMore: page * limit < 100,
          },
          source: "mock", // Indicate that we're using mock data
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // Build search query parameters
    const searchParams = new URLSearchParams();
    if (query) searchParams.append("keywords", query);
    if (location) searchParams.append("location", location);
    searchParams.append("start", ((page - 1) * limit).toString());
    searchParams.append("count", limit.toString());
    
    if (experience) {
      // Map experience levels to LinkedIn's format
      let experienceFilter;
      if (experience === "0-2") {
        experienceFilter = "1,2";
      } else if (experience === "3-5") {
        experienceFilter = "3,4";
      } else if (experience === "6+") {
        experienceFilter = "5,6";
      }
      if (experienceFilter) {
        searchParams.append("experienceLevel", experienceFilter);
      }
    }
    
    // Make the API request to LinkedIn
    const jobsResponse = await fetch(`${LINKEDIN_API_URL}?${searchParams.toString()}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });
    
    if (!jobsResponse.ok) {
      console.error(`LinkedIn API error: ${jobsResponse.status}`);
      throw new Error(`LinkedIn API error: ${jobsResponse.status}`);
    }
    
    const jobsData = await jobsResponse.json();
    
    // Transform LinkedIn API response to our application format
    const jobs = jobsData.elements.map((job: any) => ({
      id: job.jobPosting.id,
      title: job.jobPosting.title,
      company: job.jobPosting.companyName,
      location: job.jobPosting.formattedLocation || "Location not specified",
      is_remote: job.jobPosting.formattedLocation?.toLowerCase().includes("remote") || false,
      posted_date: job.jobPosting.listedAt,
      description: job.jobPosting.description?.text || "",
      requirements: job.jobPosting.jobFunctions?.map((func: any) => func.name) || [],
      experience_level: job.jobPosting.seniorityLevel?.name || "Not specified",
      salary_min: job.jobPosting.salary?.min || null,
      salary_max: job.jobPosting.salary?.max || null,
      apply_link: job.jobPosting.applyMethod?.companyApplyUrl || `https://linkedin.com/jobs/view/${job.jobPosting.id}`,
    }));
    
    return new Response(
      JSON.stringify({
        success: true,
        data: jobs,
        pagination: {
          page,
          limit,
          total: jobsData.paging?.total || jobs.length,
          hasMore: jobsData.paging?.total > page * limit,
        },
        source: "linkedin", // Indicate that we're using real LinkedIn data
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
    
    // Fallback to mock data in case of any error
    const url = new URL(req.url);
    const query = url.searchParams.get("query") || "";
    const location = url.searchParams.get("location") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const experience = url.searchParams.get("experience") || "";
    
    const mockJobs = generateMockJobs(query, location, experience, page, limit);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: mockJobs,
        pagination: {
          page,
          limit,
          total: 100,
          hasMore: page * limit < 100,
        },
        source: "mock", // Indicate that we're using mock data
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

// Function to generate mock jobs based on search criteria
function generateMockJobs(query: string, location: string, experience: string, page: number, limit: number): any[] {
  // Companies that might be returned based on query
  const companies = [
    "Google", "Microsoft", "Amazon", "Apple", "Facebook", "Netflix", "Tesla", 
    "IBM", "Oracle", "Adobe", "Salesforce", "Twitter", "Uber", "Airbnb"
  ];

  const skills = [
    "JavaScript", "TypeScript", "React", "Angular", "Vue.js", "Node.js", "Python", 
    "Java", "C#", ".NET", "SQL", "MongoDB", "AWS", "Azure", "Docker", "Kubernetes"
  ];

  const locations = location 
    ? [location] 
    : ["New York", "San Francisco", "Seattle", "Boston", "Austin", "Remote"];

  const experienceLevels = [
    "Entry Level",
    "Associate",
    "Mid-Senior Level",
    "Director",
    "Executive"
  ];

  let filteredExperienceLevels = experienceLevels;
  if (experience === "0-2") {
    filteredExperienceLevels = ["Entry Level", "Associate"];
  } else if (experience === "3-5") {
    filteredExperienceLevels = ["Associate", "Mid-Senior Level"];
  } else if (experience === "6+") {
    filteredExperienceLevels = ["Mid-Senior Level", "Director", "Executive"];
  }

  const offset = (page - 1) * limit;
  const jobs = [];

  for (let i = 0; i < limit; i++) {
    const jobId = `job-${offset + i}-${Date.now()}`;
    const isRemote = Math.random() > 0.5;
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomExperience = filteredExperienceLevels[Math.floor(Math.random() * filteredExperienceLevels.length)];
    
    let jobTitle = "";
    if (query) {
      jobTitle = `${query.charAt(0).toUpperCase() + query.slice(1)} Specialist`;
    } else {
      const titles = ["Software Engineer", "Data Scientist", "Product Manager", "UX Designer", "DevOps Engineer"];
      jobTitle = titles[Math.floor(Math.random() * titles.length)];
    }
    
    const requirementCount = 3 + Math.floor(Math.random() * 3);
    const requirements = [];
    for (let j = 0; j < requirementCount; j++) {
      let requirement = "";
      if (j === 0) {
        requirement = `${Math.floor(Math.random() * 5) + 1}+ years of experience in ${jobTitle.toLowerCase()}`;
      } else {
        requirement = `Proficiency in ${skills[Math.floor(Math.random() * skills.length)]}`;
      }
      requirements.push(requirement);
    }
    
    const baseSalary = 70000 + Math.floor(Math.random() * 80000);
    const salaryMax = baseSalary + 20000 + Math.floor(Math.random() * 30000);
    
    const description = `
We are looking for a talented ${jobTitle} to join our team at ${randomCompany}. 

As a ${jobTitle}, you will be responsible for designing, developing, and maintaining our products. You will work closely with our cross-functional team to deliver high-quality solutions.

This is a ${isRemote ? 'remote' : `${randomLocation}-based`} position with competitive compensation and benefits.
    `;
    
    jobs.push({
      id: jobId,
      title: jobTitle,
      company: randomCompany,
      location: randomLocation,
      is_remote: isRemote,
      posted_date: new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)).toISOString(),
      description: description,
      requirements: requirements,
      experience_level: randomExperience,
      salary_min: baseSalary,
      salary_max: salaryMax,
      apply_link: `https://linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobTitle + " " + randomCompany)}`,
    });
  }
  
  return jobs;
}
