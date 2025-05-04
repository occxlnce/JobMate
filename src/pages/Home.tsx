
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Mic, ListChecks } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Home = () => {
  const { user } = useAuth();
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annually">("monthly");

  // Redirect to dashboard if user is already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-jobmate-600">JobMate AI</h1>
          </div>
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-700 hover:text-jobmate-600">Home</Link>
            <a href="#features" className="text-gray-700 hover:text-jobmate-600">Features</a>
            <a href="#pricing" className="text-gray-700 hover:text-jobmate-600">Pricing</a>
            <a href="#testimonials" className="text-gray-700 hover:text-jobmate-600">Testimonials</a>
            <a href="#contact" className="text-gray-700 hover:text-jobmate-600">Contact</a>
          </div>
          <div className="flex space-x-4">
            <Link to="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-jobmate-600 hover:bg-jobmate-700">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
              Empowering Your Career with AI
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Leverage artificial intelligence to create professional CVs, prepare for interviews, 
              and track your job applications - all in one platform.
            </p>
            <Link to="/register">
              <Button className="bg-jobmate-600 hover:bg-jobmate-700 text-lg py-6 px-8">
                Get Started
              </Button>
            </Link>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.pexels.com/photos/5673502/pexels-photo-5673502.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="JobMate AI Platform Preview" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Powerful Features</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-jobmate-100 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-jobmate-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Generate Professional CVs</h3>
              <p className="text-gray-600">
                Create tailored, professional CVs in seconds with our AI-powered generator.
                Perfect for any job application.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-jobmate-100 rounded-full flex items-center justify-center">
                  <Mic className="w-8 h-8 text-jobmate-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Practice Interview Questions</h3>
              <p className="text-gray-600">
                Prepare for your interviews with our AI interview coach. Get personalized feedback and improve your skills.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-jobmate-100 rounded-full flex items-center justify-center">
                  <ListChecks className="w-8 h-8 text-jobmate-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Track Applications</h3>
              <p className="text-gray-600">
                Keep all your job applications organized in one place. Track status, deadlines,
                and follow-ups effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Choose the plan that's right for you and start your career journey today.
          </p>
          
          <div className="flex justify-center mb-8">
            <Tabs defaultValue="monthly" className="w-[400px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="monthly" 
                  onClick={() => setBillingInterval("monthly")}
                >
                  Monthly
                </TabsTrigger>
                <TabsTrigger 
                  value="annually" 
                  onClick={() => setBillingInterval("annually")}
                >
                  Annually (Save 58%)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <PricingPlans billingInterval={billingInterval} />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Our Users Say</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-sm text-gray-500">Software Developer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "JobMate AI helped me create a professional CV that highlighted my skills perfectly.
                I received interview calls from 4 companies within a week!"
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Michael Chen</h4>
                  <p className="text-sm text-gray-500">Marketing Specialist</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The interview practice feature was a game-changer for me. I felt much more confident
                during my interviews and landed my dream job."
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Emily Roberts</h4>
                  <p className="text-sm text-gray-500">Project Manager</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Being able to track all my job applications in one place has made my job search
                so much more organized and effective."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-jobmate-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Advance Your Career?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who have found success with JobMate AI's intelligent tools.
          </p>
          <Link to="/register">
            <Button className="bg-white text-jobmate-600 hover:bg-gray-100 text-lg py-6 px-8">
              Get Started For Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">JobMate AI</h3>
              <p className="text-gray-300">
                Your AI-powered career assistant, helping you find and secure your dream job.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
                <li><a href="#features" className="text-gray-300 hover:text-white">Features</a></li>
                <li><a href="#testimonials" className="text-gray-300 hover:text-white">Testimonials</a></li>
                <li><Link to="/register" className="text-gray-300 hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
              <p className="text-gray-300 mb-2">hello@jobmate.ai</p>
              <p className="text-gray-300">123 Innovation Street, Tech City</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 mt-8 text-center">
            <p className="text-gray-400">© {new Date().getFullYear()} JobMate AI. All rights reserved.</p>
            <div className="flex justify-center space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white">About Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
