
# JobMate AI - Career Platform

JobMate AI is a comprehensive AI-powered career platform designed to help job seekers prepare for their job search, create professional documents, and improve their skills.

## Features

### AI Chat Assistant
- 24/7 text-based assistant using GROQ API
- Answers questions about CVs, careers, interviews, learning paths
- Maintains session memory with conversation history

### CV Builder
- Generate professional CVs tailored to specific job positions
- Multiple template styles (Professional, Creative, Minimal, Modern)
- CV scanning with OCR technology to extract information from existing CVs
- Download generated CVs as HTML/PDF
- Save and manage multiple CVs

### Cover Letter Generator
- AI-powered cover letter creation based on job descriptions
- Auto-fill fields using saved profile data
- Three tone options: Formal, Enthusiastic, Direct
- Preview and download generated cover letters
- Clean, professional formatting with proper business letter structure

### Learning Resources Integration - Skill Roadmap
- Browse and track learning resources based on your skills
- Resources organized by difficulty: Beginner, Intermediate, Advanced
- Track your learning progress with visual indicators
- Add custom learning resources for any skill
- Progress tracking and learning statistics dashboard

### Interview Coach
- AI-powered interview preparation tool with voice capabilities
- Text and voice-based question answering options
- Listen to interview questions with text-to-speech
- Record voice responses for a more realistic interview experience
- Job-specific questions divided into categories (Technical, Behavioral, Situational)
- Practice mock interview sessions with real-time AI feedback
- Detailed performance analysis with scores and improvement suggestions
- Interview history tracking with comprehensive session review
- Strength and weakness identification for targeted improvement

### WhatsApp Job Alerts
- Receive personalized job alerts directly on WhatsApp
- Customizable alert preferences (keywords, locations, salary)
- Configure alert frequency (daily, weekly, immediate)
- Seamless setup with QR code scanning for WhatsApp connection
- Filter job notifications based on user preferences

### Profile Management
- Comprehensive user profile with personal information, skills, education, and experience
- Information used to enhance CV and cover letter generation

### Job Search
- Browse and save job listings
- Track application progress

## Getting Started

### Prerequisites
- Node.js (v16+)
- Supabase account for database and authentication
- GROQ API key for AI functionality

### Environment Setup
Ensure you have the following environment variables set up in your Supabase project:
- `GROQ_API_KEY`: API key for GROQ AI services

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Usage

### Authentication
1. Register for an account or sign in
2. Complete your profile information for better AI-generated content

### Creating a CV
1. Navigate to the CV Builder
2. Enter job details or scan an existing CV
3. Generate and customize your CV
4. Download or save for later

### Creating a Cover Letter
1. Navigate to Cover Letter Generator
2. Enter job title and paste job description
3. Select desired tone
4. Generate your personalized cover letter
5. Preview, edit, and download

### Using the Learning Resources
1. Go to the Learning Resources page
2. Browse resources by skill or difficulty level
3. Mark resources as completed as you learn
4. Track your progress with visual indicators
5. Add custom learning resources for your skills

### Interview Practice
1. Go to the Interview Coach page
2. Choose the "Practice Interview" tab
3. Enter the job title you're preparing for
4. Enable voice features if you want to use voice input or listen to questions 
5. Answer the series of job-specific questions (by typing or using voice input)
6. Receive detailed AI feedback on your responses
7. Review your scores and suggested improvements
8. Track your progress in the "Interview History" tab

### WhatsApp Job Alerts
1. Go to the WhatsApp Alerts page
2. Enter your WhatsApp number and set job preferences
3. Choose notification frequency (daily, weekly, immediate)
4. Connect WhatsApp by scanning the QR code
5. Receive personalized job alerts directly on WhatsApp

### Using the AI Assistant
1. Click the chat icon visible on all pages
2. Ask questions related to your career search
3. Receive AI-powered guidance and advice

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase Edge Functions
- **AI**: GROQ API (for AI assistance, CV and cover letter generation)
- **OCR**: Tesseract.js (for CV scanning)
- **Voice Features**: Web Speech API (for text-to-speech and speech-to-text)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth

## Roadmap

- Enhanced Voice Features for Interview Coach
- Mobile App Development
- Integration with More Job Boards
- Advanced Analytics Dashboard
