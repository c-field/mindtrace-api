import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { User, Settings, Heart, BarChart3, Trash2, LogOut } from "lucide-react";

const profileUpdateSchema = z.object({
  name: z.string().optional(),
});

export default function Profile({ onLogout = () => {} }) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: "",
    },
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const response = await fetch("https://mindtrace-api-sigma.vercel.app/api/auth/me", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
    onSuccess: (userData) => {
      form.reset({
        name: userData.name || "",
      });
    },
  });

  const { data: thoughts = [] } = useQuery({
    queryKey: ["/api/thoughts"],
    queryFn: async () => {
      const response = await fetch("https://11d3d8eb-500f-47e4-982c-6840c979c26a-00-29fzi9wm5gkmr.riker.replit.dev/api/thoughts", {
        credentials: "include",
        cache: "no-cache",
      });
      if (!response.ok) throw new Error("Failed to fetch thoughts");
      return response.json();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("PATCH", "/api/auth/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteAllThoughtsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("https://mindtrace-api-sigma.vercel.app/api/thoughts", {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete thoughts");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/thoughts"] });
      toast({
        title: "Success",
        description: "All your thoughts have been deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete thoughts. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmitProfile = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleDeleteAllThoughts = () => {
    if (confirm("Are you sure you want to delete all your thoughts? This action cannot be undone.")) {
      deleteAllThoughtsMutation.mutate();
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("https://mindtrace-api-sigma.vercel.app/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      onLogout();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="from-primary/10 to-primary/20 rounded-2xl p-6 border border-primary/20 bg-[#1f2937]">
        <h2 className="text-2xl font-semibold mb-2 app-text-primary">Your Profile</h2>
        <p className="app-text-secondary text-sm">
          Manage your account settings and view your mental health journey summary.
        </p>
      </div>

      {/* Profile Information Card */}
      <div className="app-surface rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold app-text-primary">Account Information</h3>
            <p className="text-sm app-text-secondary">Your personal account details</p>
          </div>
        </div>

        {/* Account Fields */}
        <div className="space-y-4">
          {/* Email Address (Non-editable) */}
          <div className="space-y-2">
            <label className="text-sm font-medium app-text-primary">Email Address</label>
            <Input
              value={user?.username || ""}
              disabled
              className="app-surface-light border-slate-600 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Name Field (Editable) */}
          <div className="space-y-2">
            <label className="text-sm font-medium app-text-primary">Full Name</label>
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            className="app-surface-light border-slate-600 text-gray-700 placeholder:text-gray-500 focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      size="sm"
                      className="app-primary-bg hover:app-primary-bg-hover text-white"
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        form.reset({ name: user?.name || "" });
                      }}
                      className="border-primary/20 app-text-primary hover:bg-primary/5"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  value={user?.name || "Not set"}
                  disabled
                  className="app-surface-light border-slate-600 text-gray-700 cursor-not-allowed"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="border-primary/20 app-text-primary hover:bg-primary/5"
                >
                  Edit
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mental Health Summary */}
      {thoughts.length > 0 && (
        <div className="app-surface rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold app-text-primary">Your Journey Summary</h3>
              <p className="text-sm app-text-secondary">Key insights from your thought tracking</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 app-surface-light rounded-xl">
              <div className="text-2xl font-bold app-text-primary">
                {thoughts.length}
              </div>
              <div className="text-sm app-text-secondary">Total Thoughts</div>
            </div>
            <div className="text-center p-4 app-surface-light rounded-xl">
              <div className="text-2xl font-bold app-text-primary">
                {(thoughts.reduce((sum, t) => sum + t.intensity, 0) / thoughts.length).toFixed(1)}
              </div>
              <div className="text-sm app-text-secondary">Average Intensity</div>
            </div>
            <div className="text-center p-4 app-surface-light rounded-xl">
              <div className="text-2xl font-bold app-text-primary">
                {thoughts.length > 0 && thoughts[thoughts.length - 1].created_at ? 
                  format(new Date(thoughts[thoughts.length - 1].created_at), "MMM d") : "—"}
              </div>
              <div className="text-sm app-text-secondary">First Entry</div>
            </div>
            <div className="text-center p-4 app-surface-light rounded-xl">
              <div className="text-2xl font-bold app-text-primary">
                {thoughts.length > 0 && thoughts[0].created_at ? 
                  format(new Date(thoughts[0].created_at), "MMM d") : "—"}
              </div>
              <div className="text-sm app-text-secondary">Last Entry</div>
            </div>
          </div>
        </div>
      )}

      {/* Data Management */}
      <div className="app-surface rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold app-text-primary">Data Management</h3>
            <p className="text-sm app-text-secondary">Manage your stored thought records</p>
          </div>
        </div>

        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="h-4 w-4 text-red-600" />
            <h4 className="font-medium text-red-800 dark:text-red-200">Danger Zone</h4>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            Permanently delete all your thought records. This action cannot be undone.
          </p>
          <Button
            onClick={handleDeleteAllThoughts}
            disabled={deleteAllThoughtsMutation.isPending || thoughts.length === 0}
            variant="destructive"
            size="sm"
          >
            {deleteAllThoughtsMutation.isPending ? "Deleting..." : "Delete All Thoughts"}
          </Button>
        </div>
      </div>

      {/* Account Actions */}
      <div className="app-surface rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold app-text-primary">Account Actions</h3>
            <p className="text-sm app-text-secondary">Manage your session and account access</p>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          className="w-full bg-[#27c4b4] hover:bg-[#20a898] text-white font-medium py-3 rounded-xl transition-colors duration-200"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}