import { Plus, BarChart3, Download, User } from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'track', label: 'Track', icon: Plus },
    { id: 'analyze', label: 'Analyze', icon: BarChart3 },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm app-surface border-t border-slate-700">
      <div className="flex justify-around py-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center py-2 px-4 text-xs transition-colors ${
              activeTab === id 
                ? 'app-primary' 
                : 'app-text-secondary hover:app-text-primary'
            }`}
          >
            <Icon size={24} className="mb-1" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
