import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import mindtraceLogoPath from "@assets/Screenshot 2025-06-09 at 22.02.36_1750939481522.png";

const authSchema = z.object({
  username: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const authMutation = useMutation({
    mutationFn: async (data: AuthFormData) => {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const response = await apiRequest("POST", endpoint, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: isLogin ? "Welcome back!" : "Account created!",
        description: isLogin 
          ? "You've successfully logged in." 
          : "Your account has been created and you're now logged in.",
      });
      onAuthSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Authentication failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AuthFormData) => {
    authMutation.mutate(data);
  };

  return (
    <div className="min-h-screen app-container flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo and Welcome */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-1">
              <img src={mindtraceLogoPath} alt="MindTrace Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold app-primary">MindTrace</h1>
            <p className="text-sm app-text-secondary mt-2">
              Track and analyze your thought patterns
            </p>
          </div>
        </div>

        {/* Auth Form */}
        <div className="app-surface rounded-2xl p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold app-text-primary">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-sm app-text-secondary mt-1">
              {isLogin 
                ? "Sign in to continue your mental health journey" 
                : "Start your mental health tracking journey"
              }
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium app-text-primary">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        className="app-surface-light border-slate-600 text-gray-700 placeholder:text-gray-500 focus:border-primary"
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
                    <FormLabel className="text-sm font-medium app-text-primary">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        className="app-surface-light border-slate-600 text-gray-700 placeholder:text-gray-500 focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={authMutation.isPending}
                className="w-full app-primary-bg hover:app-primary-bg-hover text-white font-medium py-3 rounded-xl transition-colors duration-200"
              >
                {authMutation.isPending 
                  ? (isLogin ? "Signing in..." : "Creating account...") 
                  : (isLogin ? "Sign in" : "Create account")
                }
              </Button>
            </form>
          </Form>

          {/* Forgot Links - Only show on login */}
          {isLogin && (
            <div className="text-center space-y-2">
              <div className="flex justify-center space-x-4 text-sm">
                <Link href="/forgot-password">
                  <Button variant="link" className="app-primary hover:app-primary text-sm font-medium p-0 h-auto">
                    Forgot password?
                  </Button>
                </Link>
                <span className="app-text-secondary">•</span>
                <Link href="/forgot-username">
                  <Button variant="link" className="app-primary hover:app-primary text-sm font-medium p-0 h-auto">
                    Forgot username?
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Toggle Auth Mode */}
          <div className="text-center pt-4 border-t border-slate-700">
            <p className="text-sm app-text-secondary">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                form.reset();
              }}
              className="app-primary hover:app-primary text-sm font-medium p-0 h-auto mt-1"
            >
              {isLogin ? "Create one here" : "Sign in here"}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs app-text-secondary">
            Your mental health data is private and secure
          </p>
        </div>
      </div>
    </div>
  );
}