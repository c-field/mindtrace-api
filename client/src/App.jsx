import { useState, useEffect } from "react";
import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import Track from "@/pages/Track";
import Analyze from "@/pages/Analyze";
import Export from "@/pages/Export";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import ForgotUsername from "@/pages/ForgotUsername";
import NotFound from "@/pages/not-found";
import { useIsMobile } from "@/hooks/use-mobile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("track");
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔍 Checking authentication with Replit backend...");
        console.log("Request URL:", "https://11d3d8eb-500f-47e4-982c-6840c979c26a-00-29fzi9wm5gkmr.riker.replit.dev/api/auth/me");
        console.log("Current origin:", window.location.origin);
        
        const response = await fetch("https://11d3d8eb-500f-47e4-982c-6840c979c26a-00-29fzi9wm5gkmr.riker.replit.dev/api/auth/me", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          const userData = await response.json();
          console.log("✅ Authentication successful:", userData);
          setIsAuthenticated(true);
        } else {
          console.log("❌ Authentication failed - not logged in");
        }
      } catch (error) {
        console.error("💥 Auth check failed - Network or CORS error:");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Full error:", error);
        
        // Check if we're running in Replit development environment
        const isReplitDev = window.location.hostname.includes('replit.dev');
        if (isReplitDev) {
          console.log("🔧 Running in Replit development - skipping auth for now");
          console.log("💡 Note: CORS needs to be configured on Vercel for this domain");
          // Set authenticated to true for development in Replit
          setIsAuthenticated(true);
        } else {
          console.log("🔧 Continuing without authentication...");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsAuthenticated(false);
    }
  };

  if (isLoading) {
    return (
      <div className="viewport-height bg-background flex items-center justify-center safe-area-p">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="viewport-height bg-background safe-area-p">
          <Switch>
            <Route path="/forgot-password">
              <ForgotPassword />
            </Route>
            <Route path="/forgot-username">
              <ForgotUsername />
            </Route>
            <Route>
              <Auth onAuthSuccess={handleAuthSuccess} />
            </Route>
          </Switch>
          <Toaster />
        </div>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="viewport-height bg-background">
        <div className="flex flex-col h-full">
          <Header />
          <main className="flex-1 overflow-y-auto content-area">
            <div className="safe-container py-6">
              <Switch>
                <Route path="/" component={Track} />
                <Route path="/track" component={Track} />
                <Route path="/analyze" component={Analyze} />
                <Route path="/export" component={Export} />
                <Route path="/profile">
                  <Profile onLogout={handleLogout} />
                </Route>
                <Route component={NotFound} />
              </Switch>
            </div>
          </main>
          {isMobile && (
            <BottomNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}
        </div>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;