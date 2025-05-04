
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type TopNavigationProps = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

export const TopNavigation = ({ isSidebarOpen, toggleSidebar }: TopNavigationProps) => {
  const { user, signOut } = useAuth();

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center border-b bg-background px-4 md:px-6">
      <Button 
        variant="ghost" 
        size="icon" 
        className="mr-4"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      
      <div className="ml-auto flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8 border">
                <AvatarFallback className="bg-jobmate-600 text-white">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {user?.email && (
              <div className="px-2 py-1.5 text-sm">
                <div className="font-medium">{user.email}</div>
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/profile">My Profile</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/settings">Settings</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()} className="text-red-500 focus:text-red-500">
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
