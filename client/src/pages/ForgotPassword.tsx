import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Brain, ArrowLeft, Mail } from "lucide-react";
import { Link } from "wouter";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitted(true);
    setIsLoading(false);
    
    toast({
      title: "Reset email sent!",
      description: "Check your inbox for password reset instructions.",
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen app-container flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-8">
          {/* Success State */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold app-text-primary">Check your email</h1>
              <p className="text-sm app-text-secondary mt-2">
                We've sent password reset instructions to {form.getValues('email')}
              </p>
            </div>
          </div>

          <div className="app-surface rounded-2xl p-6 space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm app-text-secondary">
                Didn't receive an email? Check your spam folder or try again with a different email address.
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    form.reset();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try different email
                </Button>
                
                <Link href="/auth">
                  <Button variant="link" className="w-full app-primary hover:app-primary text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to sign in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-container flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 app-primary-bg rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold app-text-primary">Forgot your password?</h1>
            <p className="text-sm app-text-secondary mt-2">
              Enter your email and we'll send you reset instructions
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="app-surface rounded-2xl p-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full app-primary-bg hover:app-primary-bg-hover text-white font-medium py-3 rounded-xl transition-colors duration-200"
              >
                {isLoading ? "Sending reset email..." : "Send reset email"}
              </Button>
            </form>
          </Form>

          <div className="text-center pt-4 border-t border-slate-700">
            <Link href="/auth">
              <Button variant="link" className="app-primary hover:app-primary text-sm font-medium p-0 h-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to sign in
              </Button>
            </Link>
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