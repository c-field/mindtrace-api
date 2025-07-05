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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cognitiveDistortions, getCognitiveDistortionById } from "@/lib/cognitiveDistortions";
import { Info } from "lucide-react";

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
      const response = await apiRequest("POST", "/api/thoughts", data);
      return response.json();
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record thought. Please try again.",
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
                  <FormLabel className="text-sm font-medium app-text-primary flex items-center gap-2">
                    Cognitive Distortion Pattern *
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-primary/70 hover:text-primary" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>Select the thinking pattern that best matches your negative thought. Each pattern represents a common way our minds can distort reality.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
                        <TooltipProvider key={distortion.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <SelectItem
                                value={distortion.id}
                                className="text-gray-700 hover:app-surface-light focus:text-gray-700 cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{distortion.name}</span>
                                  <Info className="h-3 w-3 text-primary/50" />
                                </div>
                              </SelectItem>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm" side="left">
                              <div className="space-y-1">
                                <p className="font-medium">{distortion.name}</p>
                                <p className="text-sm text-muted-foreground">{distortion.description}</p>
                                <p className="text-sm italic text-muted-foreground">Example: {distortion.example}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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