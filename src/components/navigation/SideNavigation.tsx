import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  MessageSquare, 
  BookmarkIcon, 
  Settings, 
  User
} from "lucide-react";

type SidebarNavItemProps = {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void;
};

const SidebarNavItem = ({ 
  icon: Icon, 
  label, 
  href, 
  isActive,
  onClick
}: SidebarNavItemProps) => {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:text-primary",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
};

type SideNavigationProps = {
  isOpen: boolean;
  closeSidebar: () => void;
};

export const SideNavigation = ({ isOpen, closeSidebar }: SideNavigationProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/profile",
      label: "My Profile",
      icon: User,
    },
    {
      href: "/cv-builder",
      label: "CV Builder",
      icon: FileText,
    },
    {
      href: "/jobs",
      label: "Find Jobs",
      icon: Briefcase,
    },
    {
      href: "/interview-coach",
      label: "Interview Coach",
      icon: MessageSquare,
    },
    {
      href: "/saved-items",
      label: "Saved Items",
      icon: BookmarkIcon,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
    {
      href: "/cover-letter",
      label: "Cover Letter",
      icon: FileText,
    },
  ];

  // Dynamic classes for sidebar visibility
  const sidebarClasses = cn(
    "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-background pt-16 transition-transform duration-300 md:translate-x-0",
    isOpen ? "translate-x-0" : "-translate-x-full"
  );

  // Backdrop for mobile
  const backdropClasses = cn(
    "fixed inset-0 z-10 bg-black/50 transition-opacity md:hidden",
    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
  );

  return (
    <>
      {/* Mobile backdrop */}
      <div className={backdropClasses} onClick={closeSidebar} />
      
      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div className="p-4">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">JobMate AI</h2>
        </div>
        
        <div className="flex-1 overflow-auto py-2 px-4">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <SidebarNavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={currentPath === item.href}
                onClick={closeSidebar}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};
