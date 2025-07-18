import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
// No import needed if using public folder

const authSchema = z.object({
  username: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const authMutation = useMutation({
    mutationFn: async (data) => {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      
      // Enhanced logging for TestFlight debugging
      const isTestFlight = window.location.protocol === 'capacitor:' || 
                          navigator.userAgent.includes('iPhone') || 
                          navigator.userAgent.includes('iPad');
      
      if (isTestFlight) {
        console.log('TestFlight auth mutation starting:', { endpoint, isLogin });
      }
      
      try {
        const response = await apiRequest("POST", endpoint, data);
        
        if (isTestFlight) {
          console.log('TestFlight auth response received:', {
            status: response.status,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
          });
        }
        
        // Enhanced response parsing with validation
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response format: Expected JSON');
        }
        
        const responseData = await response.json();
        
        if (isTestFlight) {
          console.log('TestFlight auth data parsed:', responseData);
        }
        
        return responseData;
      } catch (error) {
        if (isTestFlight) {
          console.log('TestFlight auth mutation error:', error.message);
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      const isTestFlight = window.location.protocol === 'capacitor:' || 
                          navigator.userAgent.includes('iPhone') || 
                          navigator.userAgent.includes('iPad');
      
      if (isTestFlight) {
        console.log('TestFlight auth success:', data);
      }
      
      toast({
        title: "Success!",
        description: isLogin ? "Welcome back!" : "Account created successfully!",
      });
      // Reset scroll position after successful authentication
      window.scrollTo({ top: 0, behavior: 'smooth' });
      onAuthSuccess();
    },
    onError: (error) => {
      const isTestFlight = window.location.protocol === 'capacitor:' || 
                          navigator.userAgent.includes('iPhone') || 
                          navigator.userAgent.includes('iPad');
      
      if (isTestFlight) {
        console.log('TestFlight auth error:', error.message);
      }
      
      toast({
        title: "Error",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    authMutation.mutate(data);
  };

  return (
      <div className="viewport-height flex flex-col items-center justify-center bg-background safe-container py-6">
        <img 
          src="/mindtrace-logo.png" 
          alt="MindTrace logo" 
          className="h-12 mb-6"
        />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? "Enter your credentials to access your account"
              : "Create a new account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={authMutation.isPending}
              >
                {authMutation.isPending 
                  ? "Please wait..." 
                  : (isLogin ? "Sign In" : "Create Account")}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center space-y-2">
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                // Reset scroll position when switching between login/signup
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-sm"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </Button>
            
            {isLogin && (
              <div className="space-y-1">
                <Link href="/forgot-password">
                  <Button variant="link" className="text-sm p-0">
                    Forgot your password?
                  </Button>
                </Link>
                <br />
                <Link href="/forgot-username">
                  <Button variant="link" className="text-sm p-0">
                    Forgot your username?
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}