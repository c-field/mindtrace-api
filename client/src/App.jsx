import { useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
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
import { initializeNavigationScrollReset } from "@/lib/navigationUtils";

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
  const [location] = useLocation();

  // Scroll to top on page navigation - more robust implementation
  useEffect(() => {
    // Force immediate scroll to top
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Additional scroll reset after a brief delay for stubborn cases
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 10);
    
    // Final scroll reset after component render
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }, [location]);

  // Initialize comprehensive navigation scroll reset
  useEffect(() => {
    initializeNavigationScrollReset();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("https://11d3d8eb-500f-47e4-982c-6840c979c26a-00-29fzi9wm5gkmr.riker.replit.dev/api/auth/me", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Check if we're running in Replit development environment
        const isReplitDev = window.location.hostname.includes('replit.dev');
        if (isReplitDev) {
          // Set authenticated to true for development in Replit
          setIsAuthenticated(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    // Reset scroll position after successful authentication
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      // Reset scroll position after logout
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div className="viewport-height bg-background app-container">
        <Header />
        <main className="flex-1 overflow-y-auto content-area">
          <div className="safe-container space-y-4 mobile-space-y-4">
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
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;