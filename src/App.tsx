
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CVBuilder from "./pages/CVBuilder";
import CoverLetterGenerator from "./pages/CoverLetterGenerator";
import Jobs from "./pages/Jobs";
import InterviewCoach from "./pages/InterviewCoach";
import SavedItems from "./pages/SavedItems";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import LearningResources from "./pages/LearningResources";
import WhatsAppAlerts from "./pages/WhatsAppAlerts";

// Layout
import DashboardLayout from "./components/layouts/DashboardLayout";

// Components
import { ChatAssistant } from "./components/chat/ChatAssistant";

// Auth Guard Component
import { useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  // If loading, show nothing (or a loading spinner)
  if (loading) {
    return null;
  }
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If logged in, render the children
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes with Dashboard layout */}
            <Route path="/" element={
              <AuthGuard>
                <DashboardLayout />
              </AuthGuard>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cv-builder" element={<CVBuilder />} />
              <Route path="/cover-letter" element={<CoverLetterGenerator />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/learning-resources" element={<LearningResources />} />
              <Route path="/interview-coach" element={<InterviewCoach />} />
              <Route path="/whatsapp-alerts" element={<WhatsAppAlerts />} />
              <Route path="/saved-items" element={<SavedItems />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        
        {/* Chat Assistant (available on all pages) */}
        <ChatAssistant />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
