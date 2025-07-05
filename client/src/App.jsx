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
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
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