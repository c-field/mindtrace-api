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
    <nav className="app-surface border-t border-slate-600 compact-nav">
      <div className="safe-container">
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
                className={`touch-target flex flex-col items-center space-y-0.5 px-2 py-2 h-auto transition-colors duration-200 ${
                  active
                    ? "app-primary text-white bg-primary/20"
                    : "app-text-secondary hover:app-text-primary hover:bg-primary/5"
                }`}
                style={{
                  // Reduce constraint conflicts by avoiding explicit dimensions
                  minHeight: '44px',
                  WebkitAppearance: 'none',
                  border: 'none',
                  outline: 'none'
                }}
              >
                <Icon className={`w-4 h-4 ${active ? "text-primary" : ""}`} />
                <span style={{ fontSize: 'var(--text-xs)' }} className={`font-medium ${active ? "text-primary" : ""}`}>
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