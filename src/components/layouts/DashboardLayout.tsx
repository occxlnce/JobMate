
import { Outlet } from "react-router-dom";
import { SideNavigation } from "@/components/navigation/SideNavigation";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  // Close sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopNavigation 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <SideNavigation 
          isOpen={isSidebarOpen} 
          closeSidebar={() => isMobile && setIsSidebarOpen(false)} 
        />
        
        <main className={`flex-1 overflow-auto p-4 md:p-6 transition-all ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
          <div className="container mx-auto max-w-6xl animate-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
