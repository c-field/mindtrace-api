import { useState, useEffect } from "react";
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
import { forceScrollToTop } from "@/lib/navigationUtils";

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

  // Ensure page starts at top when mounted
  useEffect(() => {
    forceScrollToTop();
  }, []);

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
        // Ensure proper data structure
        const payload = {
          content: String(data.content || ''),
          cognitiveDistortion: String(data.cognitiveDistortion || ''),
          trigger: data.trigger ? String(data.trigger) : undefined,
          intensity: parseInt(data.intensity, 10)
        };
        
        const response = await apiRequest("POST", "/api/thoughts", payload);
        
        if (!response.ok) {
          // Handle error responses with defensive parsing
          const contentType = response.headers.get('content-type');
          let errorMessage = `Server error: ${response.status}`;
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
              const errorText = await response.text();
              errorMessage = `${errorMessage} - ${errorText}`;
            }
          } else {
            const errorText = await response.text();
            errorMessage = `${errorMessage} - ${errorText}`;
          }
          
          throw new Error(errorMessage);
        }
        
        // Handle success responses with defensive parsing
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const result = await response.json();
            return result;
          } catch (jsonError) {
            throw new Error('Server returned invalid JSON response');
          }
        } else {
          throw new Error(`Server returned non-JSON response: ${contentType}`);
        }
      } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('No internet connection. Please check your connection and try again.');
        }
        if (error.name === 'SyntaxError') {
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
  <div className="h-screen flex flex-col">
    {/* Header */}
    <div className="shrink-0">
      <div className="from-primary/10 to-primary/20 rounded-2xl pt-0 pb-4 px-4 border border-primary/20 bg-[#1f2937]">
        <h2 className="text-2xl font-semibold mb-2 app-text-primary">Track Your Thoughts</h2>
        <p className="app-text-secondary text-sm">
          Record and categorize negative thought patterns to gain insight into your mental health journey.
        </p>
      </div>
    </div>

    {/* Scrollable main content */}
  </main className="flex-1 overflow-y-auto space-y-6 px-4 pb-24">
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
                        className="app-surface-light border-slate-600 focus:border-primary resize-none min-h-[100px]"
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
                        <SelectTrigger className="app-surface-light border-slate-600 focus:border-primary">
                          <SelectValue placeholder="Select a cognitive distortion..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="app-surface border-slate-600 max-h-60 overflow-auto">
                        {cognitiveDistortions.map((distortion) => (
                          <SelectItem
                            key={distortion.id}
                            value={distortion.id}
                            className="hover:app-surface-light cursor-pointer"
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
                        className="app-surface-light border-slate-600 focus:border-primary"
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
                      <div className="intensity-slider-container">
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                          className="intensity-slider"
                        />
                        <div className="intensity-labels">
                          <span>1 - Mild</span>
                          <span className="current-value">{field.value}</span>
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
    </div>
  );
}