import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import Track from "@/pages/Track";
import Analyze from "@/pages/Analyze";
import Export from "@/pages/Export";
import Profile from "@/pages/Profile";

function App() {
  const [activeTab, setActiveTab] = useState("track");

  const renderPage = () => {
    switch (activeTab) {
      case "track":
        return <Track />;
      case "analyze":
        return <Analyze />;
      case "export":
        return <Export />;
      case "profile":
        return <Profile />;
      default:
        return <Track />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="app-container max-w-sm mx-auto min-h-screen relative pb-20">
          <Header />
          <main className="px-6 space-y-6">
            {renderPage()}
          </main>
          <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
