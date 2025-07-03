import { Brain } from "lucide-react";

export default function Header() {
  return (
    <header className="app-surface border-b border-slate-600 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold app-text-primary">MindTrace</h1>
          </div>
        </div>
      </div>
    </header>
  );
}