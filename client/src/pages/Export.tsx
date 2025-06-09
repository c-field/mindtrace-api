import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV, shareData } from "@/lib/exportUtils";
import type { Thought } from "@shared/schema";

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
      return response.json() as Promise<Thought[]>;
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
          description: "PDF export feature coming soon!",
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
      <div className="app-surface rounded-2xl p-6 space-y-6">
        <h2 className="text-xl font-semibold app-text-primary">Export Your Data</h2>
        
        {/* Date Range Selection */}
        <div>
          <Label className="text-sm font-medium app-text-primary mb-3 block">
            Select Date Range
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date-from" className="text-xs app-text-secondary">From</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="app-surface-light border-slate-600 app-text-primary focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="date-to" className="text-xs app-text-secondary">To</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="app-surface-light border-slate-600 app-text-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Export Format */}
        <div>
          <Label className="text-sm font-medium app-text-primary mb-3 block">
            Export Format
          </Label>
          <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv" className="app-text-primary">CSV (Spreadsheet)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="app-text-primary">PDF (Document)</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Preview */}
        <div className="app-surface-light rounded-lg p-4">
          <h4 className="font-medium mb-2 app-text-primary">Export Preview</h4>
          <div className="text-sm app-text-secondary space-y-1">
            <div>• <span className="app-primary">{thoughts.length} thoughts</span> will be exported</div>
            <div>• Date range: <span className="app-primary">
              {format(new Date(dateFrom), "MMM d")} - {format(new Date(dateTo), "MMM d, yyyy")}
            </span></div>
            <div>• Includes: Date, Category, Intensity, Triggers, Thought Text</div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleExport}
            disabled={thoughts.length === 0}
            className="w-full app-primary-bg hover:app-primary-bg-hover text-white font-medium py-4 rounded-xl transition-colors duration-200"
          >
            Download Export
          </Button>
          <Button
            onClick={handleShare}
            disabled={thoughts.length === 0}
            variant="secondary"
            className="w-full app-surface-light hover:bg-slate-600 app-text-primary font-medium py-4 rounded-xl transition-colors duration-200"
          >
            Share via...
          </Button>
        </div>

        {thoughts.length === 0 && (
          <div className="text-center py-4 app-text-secondary text-sm">
            No thoughts found in the selected date range.
          </div>
        )}
      </div>
    </div>
  );
}
