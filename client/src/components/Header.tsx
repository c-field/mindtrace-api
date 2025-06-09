import { Brain } from "lucide-react";

export default function Header() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 app-primary-bg rounded-full flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-serif font-semibold app-primary">MindTrace</h1>
      </div>
      <div className="app-text-secondary">
        <span className="text-sm">{currentDate}</span>
      </div>
    </header>
  );
}
