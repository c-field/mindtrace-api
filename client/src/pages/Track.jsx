import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cognitiveDistortions, getCognitiveDistortionById } from "@/lib/cognitiveDistortions";

const thoughtFormSchema = z.object({
  content: z.string().min(1, "Please enter your thought"),
  cognitiveDistortion: z.string().min(1, "Please select a cognitive distortion"),
  trigger: z.string().optional(),
  intensity: z.number().min(1).max(10),
});

export default function Track() {
  const [selectedDistortion, setSelectedDistortion] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(thoughtFormSchema),
    defaultValues: {
      content: "",
      cognitiveDistortion: "",
      trigger: "",
      intensity: 5,
    },
  });

  const createThoughtMutation = useMutation({
    mutationFn: async (data) => {
      try {
        // Debug logging for iOS
        console.log("=== DEBUG: Creating thought ===");
        console.log("Raw form data:", data);
        console.log("Data types:", {
          content: typeof data.content,
          cognitiveDistortion: typeof data.cognitiveDistortion,
          trigger: typeof data.trigger,
          intensity: typeof data.intensity
        });
        
        // Ensure proper data structure
        const payload = {
          content: String(data.content || ''),
          cognitiveDistortion: String(data.cognitiveDistortion || ''),
          trigger: data.trigger ? String(data.trigger) : undefined,
          intensity: parseInt(data.intensity, 10)
        };
        
        console.log("Sanitized payload:", payload);
        console.log("Payload types:", {
          content: typeof payload.content,
          cognitiveDistortion: typeof payload.cognitiveDistortion,
          trigger: typeof payload.trigger,
          intensity: typeof payload.intensity
        });
        console.log("JSON.stringify payload:", JSON.stringify(payload));
        
        const response = await apiRequest("POST", "/api/thoughts", payload);
        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          // Handle error responses with defensive parsing
          const contentType = response.headers.get('content-type');
          console.error("Error response content-type:", contentType);
          
          let errorMessage = `Server error: ${response.status}`;
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json();
              console.error("JSON error response:", errorData);
              errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
              console.error("Failed to parse JSON error response:", jsonError);
              const errorText = await response.text();
              console.error("Text error response:", errorText);
              errorMessage = `${errorMessage} - ${errorText}`;
            }
          } else {
            const errorText = await response.text();
            console.error("Non-JSON error response:", errorText);
            errorMessage = `${errorMessage} - ${errorText}`;
          }
          
          throw new Error(errorMessage);
        }
        
        // Handle success responses with defensive parsing
        const contentType = response.headers.get('content-type');
        console.log("Success response content-type:", contentType);
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const result = await response.json();
            console.log("Success response:", result);
            return result;
          } catch (jsonError) {
            console.error("Failed to parse JSON success response:", jsonError);
            throw new Error('Server returned invalid JSON response');
          }
        } else {
          const textResponse = await response.text();
          console.error("Non-JSON success response:", textResponse);
          throw new Error(`Server returned non-JSON response: ${contentType}`);
        }
      } catch (error) {
        console.error("=== DEBUG: Mutation error ===");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('No internet connection. Please check your connection and try again.');
        }
        if (error.name === 'SyntaxError') {
          console.error("SyntaxError detected - likely JSON parsing issue");
          throw new Error('Data format error. Please try again or contact support.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/thoughts"] });
      form.reset();
      setSelectedDistortion("");
      toast({
        title: "Thought Recorded!",
        description: "Your thought has been successfully logged and categorized.",
      });
    },
    onError: (error) => {
      console.error('Thought recording error:', error);
      const isNetworkError = error.message.includes('No internet connection');
      toast({
        title: isNetworkError ? "No Internet Connection" : "Error",
        description: isNetworkError ? error.message : "Failed to record thought. Please check your connection and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    createThoughtMutation.mutate(data);
  };

  const distortionDefinition = selectedDistortion ? getCognitiveDistortionById(selectedDistortion) : null;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="from-primary/10 to-primary/20 rounded-2xl p-6 border border-primary/20 bg-[#1f2937]">
        <h2 className="text-2xl font-semibold mb-2 app-text-primary">Track Your Thoughts</h2>
        <p className="app-text-secondary text-sm">
          Record and categorize negative thought patterns to gain insight into your mental health journey.
        </p>
      </div>
      {/* Thought Form */}
      <div className="app-surface rounded-2xl p-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Thought Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium app-text-primary">
                    Your Thought
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the negative thought you're experiencing..."
                      className="app-surface-light border-slate-600 text-gray-700 placeholder:text-gray-500 focus:border-primary resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cognitive Distortion Selection */}
            <FormField
              control={form.control}
              name="cognitiveDistortion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium app-text-primary">
                    Cognitive Distortion Pattern *
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedDistortion(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="app-surface-light border-slate-600 text-gray-700 focus:border-primary">
                        <SelectValue placeholder="Select a cognitive distortion..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="app-surface border-slate-600 max-h-60 overflow-auto">
                      {cognitiveDistortions.map((distortion) => (
                        <SelectItem
                          key={distortion.id}
                          value={distortion.id}
                          className="text-gray-700 hover:app-surface-light focus:text-gray-700 cursor-pointer"
                        >
                          {distortion.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Definition Display */}
            {distortionDefinition && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-2">
                <p className="text-sm app-text-secondary">
                  <strong className="app-text-primary">Definition:</strong> {distortionDefinition.description}
                </p>
                <p className="text-sm app-text-secondary">
                  <strong className="app-text-primary">Example:</strong> <em>{distortionDefinition.example}</em>
                </p>
              </div>
            )}

            {/* Trigger */}
            <FormField
              control={form.control}
              name="trigger"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium app-text-primary">
                    Trigger (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What triggered this thought?"
                      className="app-surface-light border-slate-600 text-gray-700 placeholder:text-gray-500 focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Intensity Slider */}
            <FormField
              control={form.control}
              name="intensity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium app-text-primary">
                    Intensity Level
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="intensity-slider"
                      />
                      <div className="flex justify-between text-xs app-text-secondary">
                        <span>1 - Mild</span>
                        <span className="app-primary font-medium">{field.value}</span>
                        <span>10 - Severe</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={createThoughtMutation.isPending}
              className="w-full app-primary-bg hover:app-primary-bg-hover text-white font-medium py-3 rounded-xl transition-colors duration-200"
            >
              {createThoughtMutation.isPending ? "Recording..." : "Record Thought"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}