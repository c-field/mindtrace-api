import { useState, useEffect } from "react";
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
import Auth from "@/pages/Auth";

function App() {
  const [activeTab, setActiveTab] = useState("track");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        setIsAuthenticated(response.ok);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case "track":
        return <Track />;
      case "analyze":
        return <Analyze />;
      case "export":
        return <Export />;
      case "profile":
        return <Profile onLogout={() => setIsAuthenticated(false)} />;
      default:
        return <Track />;
    }
  };

  if (isLoading) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen app-container flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 app-primary-bg rounded-full flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 rounded-full bg-white opacity-20"></div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-serif font-bold app-primary">MindTrace</h1>
                <p className="text-sm app-text-secondary">Loading your mental health companion...</p>
              </div>
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Auth onAuthSuccess={() => setIsAuthenticated(true)} />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

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
