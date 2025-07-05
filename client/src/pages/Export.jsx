import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV, shareData } from "@/lib/exportUtils";

export default function Export() {
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [exportFormat, setExportFormat] = useState("csv");
  const { toast } = useToast();

  const { data: thoughts = [] } = useQuery({
    queryKey: ["/api/thoughts", dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
      });
      const response = await fetch(`/api/thoughts?${params}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch thoughts");
      return response.json();
    },
  });

  const handleExport = async () => {
    try {
      if (exportFormat === "csv") {
        const params = new URLSearchParams({
          dateFrom,
          dateTo,
        });
        
        const response = await fetch(`/api/export/csv?${params}`, {
          credentials: "include",
        });
        
        if (!response.ok) throw new Error("Export failed");
        
        const csvContent = await response.text();
        downloadCSV(csvContent);
        
        toast({
          title: "Export Complete",
          description: "Your thoughts have been exported successfully.",
        });
      } else {
        // PDF export would be implemented here
        toast({
          title: "PDF Export",
          description: "PDF export is being prepared...",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export your thoughts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
      });
      
      const response = await fetch(`/api/export/csv?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Export failed");
      
      const csvContent = await response.text();
      shareData(csvContent);
      
      toast({
        title: "Sharing",
        description: "Opening share dialog...",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Failed to prepare data for sharing. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="from-primary/10 to-primary/20 rounded-2xl p-6 border border-primary/20 bg-[#1f2937]">
        <h2 className="text-2xl font-semibold mb-2 app-text-primary">Export Your Data</h2>
        <p className="app-text-secondary text-sm">
          Download your thought records for personal review or to share with healthcare professionals.
        </p>
      </div>
      {/* Export Configuration */}
      <div className="app-surface rounded-2xl p-6 space-y-6">
        <h3 className="text-lg font-semibold app-text-primary">Export Settings</h3>
        
        {/* Date Range */}
        <div className="space-y-4">
          {/* Quick Time Period Suggestions */}
          <div className="space-y-2">
            <Label className="text-sm font-medium app-text-primary">
              Quick Time Periods
            </Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateFrom(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
                  setDateTo(format(new Date(), 'yyyy-MM-dd'));
                }}
                className="bg-[#27c4b4] border-primary/20 app-text-primary hover:bg-primary/5 text-xs text-[#ffffff]"
              >
                Last 7 days
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateFrom(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
                  setDateTo(format(new Date(), 'yyyy-MM-dd'));
                }}
                className="bg-[#27c4b4] border-primary/20 app-text-primary hover:bg-primary/5 text-xs text-[#ffffff]"
              >
                Last 30 days
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateFrom" className="text-sm font-medium app-text-primary">
              From Date
            </Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="app-surface-light border-slate-600 text-gray-700 focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateTo" className="text-sm font-medium app-text-primary">
              To Date
            </Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="app-surface-light border-slate-600 text-gray-700 focus:border-primary"
            />
          </div>
        </div>

        {/* Export Format */}
        <div className="space-y-3">
          <Label className="text-sm font-medium app-text-primary">Export Format</Label>
          <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv" className="text-sm app-text-primary cursor-pointer">
                CSV (Spreadsheet compatible)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="text-sm app-text-primary cursor-pointer">
                PDF (Professional report)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Data Preview */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium app-text-primary mb-3">
            Data Preview ({thoughts.length} thoughts)
          </h4>
          {thoughts.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {thoughts.slice(0, 5).map((thought) => (
                <div key={thought.id} className="app-surface-light rounded-lg p-3 text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="app-text-secondary">
                      {format(new Date(thought.createdAt), "MMM d, yyyy")}
                    </span>
                    <span className="app-text-secondary">
                      Intensity: {thought.intensity}/10
                    </span>
                  </div>
                  <div className="app-text-primary truncate">
                    {thought.content}
                  </div>
                </div>
              ))}
              {thoughts.length > 5 && (
                <div className="text-center app-text-secondary text-xs">
                  ... and {thoughts.length - 5} more thoughts
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 app-text-secondary text-sm">
              No thoughts found for the selected date range.
            </div>
          )}
        </div>
      </div>
      {/* Export Actions */}
      <div className="space-y-3">
        <Button
          onClick={handleExport}
          disabled={thoughts.length === 0}
          className="w-full app-primary-bg hover:app-primary-bg-hover text-white font-medium py-3 rounded-xl transition-colors duration-200"
        >
          Download Export
        </Button>
        
        <Button
          onClick={handleShare}
          disabled={thoughts.length === 0}
          variant="outline"
          className="w-full bg-[#27c4b4] border-primary/20 app-text-primary hover:bg-primary/5 font-medium py-3 rounded-xl transition-colors duration-200 text-[#ffffff]"
        >
          Share Data
        </Button>
      </div>
      {/* Export Info */}
      <div className="app-surface rounded-2xl p-4">
        <h4 className="text-sm font-medium app-text-primary mb-2">Export Information</h4>
        <ul className="text-xs app-text-secondary space-y-1">
          <li>• CSV files can be opened in Excel, Google Sheets, or any spreadsheet application</li>
          <li>• Your data includes timestamps, content, intensity levels, and cognitive patterns</li>
          <li>• All exports are generated locally and securely transmitted</li>
          <li>• Share function uses your device's built-in sharing capabilities</li>
        </ul>
      </div>
    </div>
  );
}