import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router, Route, Switch } from "wouter";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import Track from "@/pages/Track";
import Analyze from "@/pages/Analyze";
import Export from "@/pages/Export";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import ForgotUsername from "@/pages/ForgotUsername";
import mindtraceLogoPath from "@assets/Screenshot 2025-06-09 at 22.02.36_1750939481522.png";

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
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center animate-pulse p-2">
                <img src={mindtraceLogoPath} alt="MindTrace Logo" className="w-full h-full object-contain" />
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
          <Router>
            <Switch>
              <Route path="/forgot-password">
                <ForgotPassword />
              </Route>
              <Route path="/forgot-username">
                <ForgotUsername />
              </Route>
              <Route>
                <Auth onAuthSuccess={() => setIsAuthenticated(true)} />
              </Route>
            </Switch>
          </Router>
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
