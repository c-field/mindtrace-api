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
  category: z.string().min(1, "Please select a category"),
  trigger: z.string().optional(),
  intensity: z.number().min(1).max(10),
});

type ThoughtFormData = z.infer<typeof thoughtFormSchema>;

export default function Track() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ThoughtFormData>({
    resolver: zodResolver(thoughtFormSchema),
    defaultValues: {
      content: "",
      category: "",
      trigger: "",
      intensity: 5,
    },
  });

  const createThoughtMutation = useMutation({
    mutationFn: async (data: ThoughtFormData) => {
      const response = await apiRequest("POST", "/api/thoughts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/thoughts"] });
      form.reset();
      setSelectedCategory("");
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

  const onSubmit = (data: ThoughtFormData) => {
    createThoughtMutation.mutate(data);
  };

  const selectedDistortion = getCognitiveDistortionById(selectedCategory);

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/20 rounded-2xl p-6 border border-primary/20">
        <h2 className="text-2xl font-semibold mb-2 app-text-primary">Track Your Thoughts</h2>
        <p className="app-text-secondary text-sm">
          Record and categorize negative thought patterns to gain insight into your mental health journey.
        </p>
      </div>
      {/* Thought Input Form */}
      <div className="app-surface rounded-2xl p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-[#333333]">
            {/* Thought Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium app-text-primary">
                    What's on your mind?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your negative thought or worry here..."
                      className="h-32 app-surface-light border-slate-600 text-gray-800 placeholder:text-gray-500 focus:border-primary resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Selection */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium app-text-primary">
                    Cognitive Distortion Category
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCategory(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="app-surface-light border-slate-600 app-text-primary focus:border-primary">
                        <SelectValue placeholder="Select a category..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="app-surface border-slate-600">
                      {cognitiveDistortions.map((distortion) => (
                        <SelectItem
                          key={distortion.id}
                          value={distortion.id}
                          className="app-text-primary hover:app-surface-light"
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
            {selectedDistortion && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                <p className="text-sm app-text-secondary">
                  {selectedDistortion.definition}
                </p>
              </div>
            )}

            {/* Potential Triggers */}
            <FormField
              control={form.control}
              name="trigger"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium app-text-primary">
                    Potential Triggers{" "}
                    <span className="app-text-secondary text-xs">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What might have triggered this thought?"
                      className="app-surface-light border-slate-600 text-gray-800 placeholder:text-gray-500 focus:border-primary"
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
              className="w-full app-primary-bg hover:app-primary-bg-hover text-white font-medium py-4 rounded-xl transition-colors duration-200"
            >
              {createThoughtMutation.isPending ? "Recording..." : "Record Thought"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
