
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Mic,
  Bookmark,
  Settings,
  FileEdit,
  Book,
  Bell,
} from "lucide-react";

export const sideNavigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "CV Builder",
    href: "/cv-builder",
    icon: FileText,
  },
  {
    name: "Cover Letter",
    href: "/cover-letter",
    icon: FileEdit,
  },
  {
    name: "Jobs",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    name: "Learning Resources",
    href: "/learning-resources",
    icon: Book,
  },
  {
    name: "Interview Coach",
    href: "/interview-coach",
    icon: Mic,
  },
  {
    name: "WhatsApp Alerts",
    href: "/whatsapp-alerts",
    icon: Bell,
  },
  {
    name: "Saved Items",
    href: "/saved-items",
    icon: Bookmark,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
