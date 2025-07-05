import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { PenTool, BarChart3, Download, User } from "lucide-react";

export default function BottomNavigation({ activeTab, onTabChange }) {
  const [location, setLocation] = useLocation();

  const tabs = [
    { id: "track", label: "Track", icon: PenTool, path: "/track" },
    { id: "analyze", label: "Analyze", icon: BarChart3, path: "/analyze" },
    { id: "export", label: "Export", icon: Download, path: "/export" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  const handleTabClick = (tab) => {
    onTabChange(tab.id);
    setLocation(tab.path);
  };

  const isActive = (path) => location === path || (location === "/" && path === "/track");

  return (
    <nav className="fixed bottom-0 left-0 right-0 app-surface border-t border-slate-600 safe-bottom-nav z-50">
      <div className="safe-container py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => handleTabClick(tab)}
                className={`touch-target flex flex-col items-center space-y-1 px-2 py-3 h-auto transition-colors duration-200 ${
                  active
                    ? "app-primary text-white bg-primary/20"
                    : "app-text-secondary hover:app-text-primary hover:bg-primary/5"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
                <span className={`text-xs font-medium ${active ? "text-primary" : ""}`}>
                  {tab.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}