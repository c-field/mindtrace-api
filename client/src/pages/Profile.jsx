import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Profile({ onLogout = () => {} }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
  });

  const { data: thoughts = [] } = useQuery({
    queryKey: ["/api/thoughts"],
    queryFn: async () => {
      const response = await fetch("/api/thoughts", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch thoughts");
      return response.json();
    },
  });

  const deleteAllThoughtsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/thoughts", {
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

  const handleDeleteAllThoughts = () => {
    if (confirm("Are you sure you want to delete all your thoughts? This action cannot be undone.")) {
      deleteAllThoughtsMutation.mutate();
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
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
      {/* Account Information */}
      <Card className="app-surface border-slate-600">
        <CardHeader className="bg-[#1f2937]">
          <CardTitle className="app-text-primary">Account Information</CardTitle>
          <CardDescription className="app-text-secondary">
            Your account details and activity summary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium app-text-secondary">Email Address:</span>
              <span className="text-sm app-text-primary">{user?.username || "Loading..."}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium app-text-secondary">Total Thoughts:</span>
              <span className="text-sm app-text-primary">{thoughts.length}</span>
            </div>
            {thoughts.length > 0 && (
              <div className="flex justify-between">
                <span className="text-sm font-medium app-text-secondary">First Entry:</span>
                <span className="text-sm app-text-primary">
                  {format(new Date(thoughts[thoughts.length - 1].createdAt), "MMM d, yyyy")}
                </span>
              </div>
            )}
            {thoughts.length > 0 && (
              <div className="flex justify-between">
                <span className="text-sm font-medium app-text-secondary">Last Entry:</span>
                <span className="text-sm app-text-primary">
                  {format(new Date(thoughts[0].createdAt), "MMM d, yyyy")}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Mental Health Summary */}
      {thoughts.length > 0 && (
        <Card className="app-surface border-slate-600">
          <CardHeader>
            <CardTitle className="app-text-primary">Your Journey Summary</CardTitle>
            <CardDescription className="app-text-secondary">
              Key insights from your thought tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-[#1f2937]">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 app-surface-light rounded-lg">
                <div className="text-2xl font-bold app-text-primary">
                  {(thoughts.reduce((sum, t) => sum + t.intensity, 0) / thoughts.length).toFixed(1)}
                </div>
                <div className="text-sm app-text-secondary">Average Intensity</div>
              </div>
              <div className="text-center p-4 app-surface-light rounded-lg">
                <div className="text-2xl font-bold app-text-primary">
                  {Math.ceil(thoughts.length / 7)}
                </div>
                <div className="text-sm app-text-secondary">Entries per Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Data Management */}
      <Card className="app-surface border-slate-600">
        <CardHeader>
          <CardTitle className="app-text-primary">Data Management</CardTitle>
          <CardDescription className="app-text-secondary">
            Manage your stored thought records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Danger Zone</h4>
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
        </CardContent>
      </Card>
      {/* Account Actions */}
      <Card className="app-surface border-slate-600">
        <CardHeader>
          <CardTitle className="app-text-primary">Account Actions</CardTitle>
          <CardDescription className="app-text-secondary">
            Manage your session and account access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-primary/20 app-text-primary hover:bg-primary/5"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
      {/* App Information */}
      <Card className="app-surface border-slate-600">
        <CardHeader>
          <CardTitle className="app-text-primary">About MindTrace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm app-text-secondary">
            MindTrace is a mental health tracking app that helps you identify and understand
            negative thought patterns using cognitive behavioral therapy (CBT) principles.
          </p>
          <div className="text-xs app-text-secondary space-y-1">
            <div>Version: 1.0.0</div>
            <div>Built with React, Express, and PostgreSQL</div>
            <div>Optimized for mobile and desktop</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}