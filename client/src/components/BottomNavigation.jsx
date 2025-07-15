import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { PenTool, BarChart3, Download, User } from "lucide-react";
import { forceScrollToTop } from "@/lib/navigationUtils";

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
    // Force scroll to top on navigation
    forceScrollToTop();
  };

  const isActive = (path) => location === path || (location === "/" && path === "/track");

  return (
    <nav
      className="app-surface compact-nav fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="bottom-navigation">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <div
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`nav-item ${active ? 'active' : ''}`}
              style={{
                color: active ? '#10B981' : '#94A3B8',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <Icon className="nav-icon" />
              <span className="nav-text">
                {tab.label}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}