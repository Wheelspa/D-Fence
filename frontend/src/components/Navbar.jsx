import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  FileText,
  Plus,
  User,
  LogOut,
  Menu,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/warranties", label: "Warranties", icon: FileText },
    { path: "/warranties/new", label: "Create", icon: Plus },
  ];

  return (
    <nav className="bg-[#0A0A0A] border-b border-[#27272A] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_d-fence-wheelspa/artifacts/4frllqka_D-FENCE%20Logo_page-0001.jpg"
              alt="D-Fence Logo"
              className="w-12 h-12 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="font-['Chivo'] text-xl font-black text-[#E53935] tracking-tight uppercase leading-none">
                D-Fence
              </h1>
              <p className="text-[#52525B] text-[10px] tracking-widest uppercase">
                Warranty System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={`h-10 px-4 rounded-none transition-all duration-200 ${
                    isActive(item.path)
                      ? "text-[#E53935] bg-[#E53935]/10"
                      : "text-[#A1A1AA] hover:text-white hover:bg-[#121212]"
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#A1A1AA] hover:text-white hover:bg-[#121212]"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#0A0A0A] border-[#27272A] w-48"
              >
                {navItems.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`${
                      isActive(item.path) ? "text-[#E53935]" : "text-white"
                    } hover:bg-[#121212] cursor-pointer`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  data-testid="user-menu-btn"
                  className="h-10 px-3 rounded-none text-[#A1A1AA] hover:text-white hover:bg-[#121212]"
                >
                  <div className="w-8 h-8 bg-[#121212] border border-[#27272A] flex items-center justify-center mr-2">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden sm:inline">{user?.name || "User"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#0A0A0A] border-[#27272A] w-48"
              >
                <div className="px-2 py-2 border-b border-[#27272A]">
                  <p className="text-white text-sm font-medium">{user?.name}</p>
                  <p className="text-[#A1A1AA] text-xs">{user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-[#27272A]" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  data-testid="logout-btn"
                  className="text-[#EF4444] hover:bg-[#EF4444]/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
