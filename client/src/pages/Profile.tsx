import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { ExternalLink } from "lucide-react";

export default function Profile() {
  const [name, setName] = useState("Alex Chen");
  const [email, setEmail] = useState("alex.chen@email.com");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const clearDataMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/thoughts");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/thoughts"] });
      toast({
        title: "Data Cleared",
        description: "All your thoughts have been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const mentalHealthResources = [
    {
      title: "National Suicide Prevention Lifeline",
      description: "988 - 24/7 Crisis Support",
      url: "tel:988",
    },
    {
      title: "Crisis Text Line",
      description: "Text HOME to 741741",
      url: "sms:741741",
    },
    {
      title: "NAMI (National Alliance on Mental Illness)",
      description: "Educational resources and support",
      url: "https://nami.org",
    },
  ];

  return (
    <div className="space-y-6 pb-4">
      {/* Profile Info */}
      <div className="app-surface rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 app-text-primary">Profile Settings</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium app-text-primary mb-2 block">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="app-surface-light border-slate-600 app-text-primary focus:border-primary"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm font-medium app-text-primary mb-2 block">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="app-surface-light border-slate-600 app-text-primary focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="app-surface rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 app-text-primary">Data Management</h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
            >
              Clear All Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="app-surface border-slate-600">
            <AlertDialogHeader>
              <AlertDialogTitle className="app-text-primary">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="app-text-secondary">
                This action cannot be undone. This will permanently delete all your tracked thoughts
                and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="app-surface-light app-text-primary border-slate-600">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => clearDataMutation.mutate()}
                disabled={clearDataMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {clearDataMutation.isPending ? "Clearing..." : "Delete All Data"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p className="text-xs app-text-secondary mt-2">
          This action cannot be undone. All your tracked thoughts will be permanently deleted.
        </p>
      </div>

      {/* Mental Health Resources */}
      <div className="app-surface rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 app-text-primary">Mental Health Resources</h3>
        <div className="space-y-3">
          {mentalHealthResources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              className="block p-3 app-surface-light rounded-lg hover:bg-slate-600 transition-colors"
              target={resource.url.startsWith('http') ? '_blank' : undefined}
              rel={resource.url.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium app-text-primary">{resource.title}</div>
                  <div className="text-sm app-text-secondary">{resource.description}</div>
                </div>
                {resource.url.startsWith('http') && (
                  <ExternalLink className="w-4 h-4 app-text-secondary" />
                )}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* About Thought Journaling */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/20 rounded-2xl p-6 border border-primary/20">
        <h3 className="text-lg font-semibold mb-3 app-text-primary">Benefits of Thought Journaling</h3>
        <div className="text-sm app-text-secondary space-y-2">
          <p>• <strong className="app-text-primary">Increased Awareness:</strong> Recognize patterns in negative thinking</p>
          <p>• <strong className="app-text-primary">Emotional Regulation:</strong> Better understand and manage your emotions</p>
          <p>• <strong className="app-text-primary">Cognitive Restructuring:</strong> Challenge and reframe unhelpful thoughts</p>
          <p>• <strong className="app-text-primary">Therapeutic Support:</strong> Provide valuable data for therapy sessions</p>
        </div>
      </div>
    </div>
  );
}
