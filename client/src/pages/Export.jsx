import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV, shareData } from "@/lib/exportUtils";
import { jsPDF } from "jspdf";

export default function Export() {
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [exportFormat, setExportFormat] = useState("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const { toast } = useToast();

  // Detect iOS device
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  const { data: thoughts = [] } = useQuery({
    queryKey: ["/api/thoughts", dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams({
        dateFrom: dateFrom + "T00:00:00.000Z",
        dateTo: dateTo + "T23:59:59.999Z",
      });
      const response = await fetch(`https://11d3d8eb-500f-47e4-982c-6840c979c26a-00-29fzi9wm5gkmr.riker.replit.dev/api/thoughts?${params}`, {
        credentials: "include",
        cache: "no-cache",
      });
      if (!response.ok) throw new Error("Failed to fetch thoughts");
      return response.json();
    },
  });

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportStatus("");

      if (exportFormat === "csv") {
        setExportStatus("Preparing CSV export...");
        
        const params = new URLSearchParams({
          dateFrom: dateFrom + "T00:00:00.000Z",
          dateTo: dateTo + "T23:59:59.999Z",
        });
        
        const response = await fetch(`https://11d3d8eb-500f-47e4-982c-6840c979c26a-00-29fzi9wm5gkmr.riker.replit.dev/api/export/csv?${params}`, {
          credentials: "include",
        });
        
        if (!response.ok) throw new Error("Export failed");
        
        const csvContent = await response.text();
        downloadCSV(csvContent);
        
        setExportStatus("CSV export completed successfully!");
        toast({
          title: "Export Complete",
          description: "Your thoughts have been exported successfully.",
        });
      } else if (exportFormat === "pdf") {
        setExportStatus("Preparing PDF export...");
        
        // Get the filtered thoughts for PDF export
        const filteredThoughts = thoughts.filter(thought => {
          const thoughtDate = new Date(thought.created_at);
          const fromDate = new Date(dateFrom);
          const toDate = new Date(dateTo);
          return thoughtDate >= fromDate && thoughtDate <= toDate;
        });

        if (filteredThoughts.length === 0) {
          throw new Error("No thoughts found in the selected date range");
        }

        // Create PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const maxWidth = pageWidth - 2 * margin;
        
        // Add title
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("MindTrace - Thought Records Export", margin, 30);
        
        // Add export date
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Export Date: ${format(new Date(), 'PPP')}`, margin, 40);
        doc.text(`Date Range: ${format(new Date(dateFrom), 'PPP')} - ${format(new Date(dateTo), 'PPP')}`, margin, 50);
        doc.text(`Total Thoughts: ${filteredThoughts.length}`, margin, 60);
        
        let yPosition = 80;
        
        filteredThoughts.forEach((thought, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = 30;
          }
          
          // Thought header
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(`Thought ${index + 1}`, margin, yPosition);
          yPosition += 10;
          
          // Date
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          try {
            const thoughtDate = new Date(thought.created_at);
            doc.text(`Date: ${format(thoughtDate, 'PPP p')}`, margin, yPosition);
          } catch (error) {
            doc.text(`Date: ${thought.created_at}`, margin, yPosition);
          }
          yPosition += 10;
          
          // Content
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");
          const contentLines = doc.splitTextToSize(`Content: ${thought.content}`, maxWidth);
          doc.text(contentLines, margin, yPosition);
          yPosition += contentLines.length * 6;
          
          // Intensity
          doc.text(`Intensity: ${thought.intensity}/10`, margin, yPosition);
          yPosition += 10;
          
          // Cognitive Distortion
          const distortionText = thought.cognitive_distortion 
            ? thought.cognitive_distortion.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            : 'None';
          doc.text(`Cognitive Distortion: ${distortionText}`, margin, yPosition);
          yPosition += 10;
          
          // Trigger if exists
          if (thought.trigger) {
            const triggerLines = doc.splitTextToSize(`Trigger: ${thought.trigger}`, maxWidth);
            doc.text(triggerLines, margin, yPosition);
            yPosition += triggerLines.length * 6;
          }
          
          // Add separator line
          yPosition += 5;
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 15;
        });
        
        // Create filename
        const filename = `mindtrace_thoughts_${format(new Date(dateFrom), 'yyyy-MM-dd')}_to_${format(new Date(dateTo), 'yyyy-MM-dd')}.pdf`;
        
        // iOS-compatible PDF export
        if (isIOS) {
          // Method 1: Try Web Share API first (iOS 14+)
          try {
            const pdfBlob = doc.output('blob');
            const file = new File([pdfBlob], filename, { type: 'application/pdf' });
            
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: 'MindTrace Thought Records Export',
                text: 'Your exported thought records from MindTrace',
                files: [file]
              });
              setExportStatus("PDF shared successfully! You can save it to Files app.");
              toast({
                title: "PDF Shared",
                description: "PDF has been shared. You can save it to Files app.",
              });
              return;
            }
          } catch (shareError) {
            console.log('Web Share API not supported, trying alternative method');
          }
          
          // Method 2: Open PDF in new tab (iOS fallback)
          const pdfDataUri = doc.output('datauristring');
          const newWindow = window.open(pdfDataUri, '_blank');
          
          if (newWindow) {
            setExportStatus("PDF opened in new tab. Use Share button to save to Files app.");
            toast({
              title: "PDF Opened",
              description: "PDF opened in new tab. Tap Share > Save to Files to download.",
            });
          } else {
            // Method 3: Force download with data URI (last resort)
            const link = document.createElement('a');
            link.href = pdfDataUri;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setExportStatus("PDF download initiated. Check your Downloads folder.");
            toast({
              title: "PDF Download",
              description: "PDF download initiated. Check your Downloads folder.",
            });
          }
        } else {
          // Standard download for non-iOS devices
          doc.save(filename);
          setExportStatus("PDF export completed successfully!");
          toast({
            title: "PDF Export Complete",
            description: `Your thoughts have been exported as ${filename}`,
          });
        }
      }
    } catch (error) {
      console.error("Export failed:", error);
      setExportStatus(`Export failed: ${error.message}`);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export your thoughts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus(""), 5000);
    }
  };

  const handleShare = async () => {
    try {
      const params = new URLSearchParams({
        dateFrom: dateFrom + "T00:00:00.000Z",
        dateTo: dateTo + "T23:59:59.999Z",
      });
      
      const response = await fetch(`https://11d3d8eb-500f-47e4-982c-6840c979c26a-00-29fzi9wm5gkmr.riker.replit.dev/api/export/csv?${params}`, {
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

        {/* iOS-specific instructions */}
        {isIOS && exportFormat === "pdf" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 font-medium text-sm">📱 iOS Instructions:</div>
            </div>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• PDF will open in a new tab or sharing dialog</p>
              <p>• Tap the Share button (📤) at the bottom of the screen</p>
              <p>• Select "Save to Files" to download to your device</p>
              <p>• Or choose "Copy to [App]" to save in another app</p>
            </div>
          </div>
        )}

        {/* Data Preview */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium app-text-primary mb-3">
            Data Preview ({thoughts.length} thoughts)
          </h4>
          {thoughts.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {thoughts.slice(0, 5).map((thought) => {
                // Safe date formatting with validation
                const formatSafeDate = (dateValue) => {
                  if (!dateValue) return 'Date unavailable';
                  try {
                    const date = new Date(dateValue);
                    return isNaN(date.getTime()) ? 'Invalid date' : format(date, "MMM d, yyyy");
                  } catch (error) {
                    console.warn('Date formatting error:', error, dateValue);
                    return 'Date error';
                  }
                };

                return (
                  <div key={thought.id} className="app-surface-light rounded-lg p-3 text-xs">
                    <div className="flex justify-between items-start mb-1">
                      <span className="app-text-secondary">
                        {formatSafeDate(thought.created_at)}
                      </span>
                      <span className="app-text-secondary">
                        Intensity: {thought.intensity}/10
                      </span>
                    </div>
                    <div className="app-text-primary truncate">
                      {thought.content}
                    </div>
                  </div>
                );
              })}
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
          disabled={thoughts.length === 0 || isExporting}
          className="w-full app-primary-bg hover:app-primary-bg-hover text-white font-medium py-3 rounded-xl transition-colors duration-200"
        >
          {isExporting ? "Exporting..." : "Download Export"}
        </Button>
        
        <Button
          onClick={handleShare}
          disabled={thoughts.length === 0 || isExporting}
          variant="outline"
          className="w-full bg-[#27c4b4] border-primary/20 app-text-primary hover:bg-primary/5 font-medium py-3 rounded-xl transition-colors duration-200 text-[#ffffff]"
        >
          Share Data
        </Button>
      </div>

      {/* Export Status */}
      {(isExporting || exportStatus) && (
        <div className="app-surface rounded-2xl p-4">
          <div className="flex items-center gap-2">
            {isExporting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            )}
            <span className={`text-sm font-medium ${
              exportStatus.includes('failed') || exportStatus.includes('error') 
                ? 'text-red-600' 
                : exportStatus.includes('completed') || exportStatus.includes('success')
                  ? 'text-green-600'
                  : 'app-text-primary'
            }`}>
              {exportStatus}
            </span>
          </div>
          {isExporting && (
            <Button
              onClick={() => setIsExporting(false)}
              variant="outline"
              size="sm"
              className="mt-2 text-xs"
            >
              Cancel
            </Button>
          )}
        </div>
      )}
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