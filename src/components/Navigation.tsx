import { Button } from "@/components/ui/button";
import { Target, LayoutDashboard, BookOpen, Brain, BarChart3, Trophy, User, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/planner", icon: BookOpen, label: "Planner" },
    { href: "/simulados", icon: Trophy, label: "Simulados" },
    { href: "/review", icon: Brain, label: "Revisão" },
    { href: "/statistics", icon: BarChart3, label: "Estatísticas" }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gradient">ConcursoMax</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  asChild
                  className={cn(
                    "transition-smooth",
                    isActive && "shadow-glow"
                  )}
                >
                  <Link to={item.href}>
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sair">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex gap-2 mt-4 overflow-x-auto pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "outline"}
                size="sm"
                asChild
                className="flex-shrink-0"
              >
                <Link to={item.href}>
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};