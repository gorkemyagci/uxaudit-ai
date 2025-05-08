"use client"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import Image from "next/image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Loader2, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const formSchema = z.object({
  url: z.string().url("Please enter a valid URL").min(1, "URL is required"),
});

interface ElementAnalysis {
  type: string;
  text: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  styles: {
    backgroundColor: string;
    color: string;
    fontSize: string;
    fontFamily: string;
  };
}

interface UXScore {
  contrastScore: number;
  clickableSpacingScore: number;
  underlinedLinksScore: number;
  fontSizeScore: number;
  mobileResponsiveScore: number;
  totalScore: number;
  issues: string[];
  contrastNotes: string[];
  fontSizeNotes: string[];
}

export const URLForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    elements: ElementAnalysis[];
    scores: UXScore;
    screenshots: {
      desktop: string;
      mobile: string;
    };
    meta: {
      title: string;
      description: string;
    };
    elementCount: number;
  } | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: values.url }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data);
      } else {
        throw new Error(data.error);
      }
      
    } catch {} 
    finally {
      setIsLoading(false);
    }
  };

  // Group issues by type
  const groupIssues = (issues: string[]) => {
    const groups: Record<string, string[]> = {};
    issues.forEach(issue => {
      let key = "Other";
      if (issue.toLowerCase().includes("contrast")) key = "Contrast Issues";
      else if (issue.toLowerCase().includes("font size")) key = "Font Size Issues";
      else if (issue.toLowerCase().includes("link not underlined")) key = "Link Issues";
      else if (issue.toLowerCase().includes("clickable elements too close")) key = "Spacing Issues";
      if (!groups[key]) groups[key] = [];
      groups[key].push(issue);
    });
    return groups;
  };

  const groupedIssues = useMemo(() => analysis ? groupIssues(analysis.scores.issues) : {}, [analysis]);

  // PDF export function
  const handleExportPDF = async () => {
    if (!analysis) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    let y = 40;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(18);
    doc.text(`${analysis.meta.title || "Website"} UX Score: ${analysis.scores.totalScore}%`, 40, y);
    y += 30;
    doc.setFontSize(12);
    doc.text(`URL: ${form.getValues().url}`, 40, y);
    y += 20;
    if (analysis.meta.description) {
      const descLines = doc.splitTextToSize(`Description: ${analysis.meta.description}`, 500);
      doc.text(descLines, 40, y);
      y += descLines.length * 14;
    }
    doc.text(`Total Elements: ${analysis.elementCount}`, 40, y);
    y += 30;

    // Scores
    doc.setFont("helvetica", "bold");
    doc.text("Scores", 40, y);
    doc.setFont("helvetica", "normal");
    y += 20;
    const scoreList = [
      ["Contrast", analysis.scores.contrastScore],
      ["Clickable Spacing", analysis.scores.clickableSpacingScore],
      ["Link Underlines", analysis.scores.underlinedLinksScore],
      ["Font Sizes", analysis.scores.fontSizeScore],
      ["Mobile Responsive", analysis.scores.mobileResponsiveScore],
    ];
    scoreList.forEach(([label, value]) => {
      doc.text(`${label}: ${Math.round(Number(value))}%`, 50, y);
      y += 16;
    });
    y += 10;

    // Issues grouped
    doc.setFont("helvetica", "bold");
    doc.text("Issues Found", 40, y);
    doc.setFont("helvetica", "normal");
    y += 20;

    Object.entries(groupedIssues).forEach(([group, items]) => {
      doc.setFont("helvetica", "bold");
      doc.text(group, 50, y);
      doc.setFont("helvetica", "normal");
      y += 18;
      const maxIssues = 30;
      items.slice(0, maxIssues).forEach((issue) => {
        const lines = doc.splitTextToSize(`- ${issue}`, 480);
        if (y + lines.length * 14 > pageHeight - 40) {
          doc.addPage();
          y = 40;
        }
        doc.text(lines, 60, y);
        y += lines.length * 14;
      });
      if (items.length > maxIssues) {
        doc.text(`...and ${items.length - maxIssues} more`, 60, y);
        y += 14;
      }
      y += 8;
    });

    // Design notes
    if (analysis.scores.contrastNotes.length || analysis.scores.fontSizeNotes.length) {
      doc.setFont("helvetica", "bold");
      doc.text("Design Notes", 40, y);
      doc.setFont("helvetica", "normal");
      y += 20;
      [...analysis.scores.contrastNotes, ...analysis.scores.fontSizeNotes].forEach(note => {
        const lines = doc.splitTextToSize(`- ${note}`, 480);
        if (y + lines.length * 14 > pageHeight - 40) {
          doc.addPage();
          y = 40;
        }
        doc.text(lines, 60, y);
        y += lines.length * 14;
      });
      y += 8;
    }

    // Screenshots
    doc.setFont("helvetica", "bold");
    doc.text("Screenshots", 40, y);
    doc.setFont("helvetica", "normal");
    y += 20;
    const desktopImg = new (window.Image as { new (): HTMLImageElement })();
    desktopImg.src = `data:image/png;base64,${analysis.screenshots.desktop}`;
    await new Promise(res => { desktopImg.onload = res; });
    if (y + 120 > pageHeight - 40) {
      doc.addPage();
      y = 40;
    }
    doc.addImage(desktopImg, "PNG", 40, y, 180, 110);
    y += 120;
    const mobileImg = new (window.Image as { new (): HTMLImageElement })();
    mobileImg.src = `data:image/png;base64,${analysis.screenshots.mobile}`;
    await new Promise(res => { mobileImg.onload = res; });
    doc.addImage(mobileImg, "PNG", 240, y - 120, 60, 110);

    doc.save("ux-audit.pdf");
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-indigo-50/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-sm text-indigo-600">
            <span className="mr-2">🔍</span>
            Start Your UX Audit
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Enter Your Website URL
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Get instant, comprehensive UX analysis of your website
          </p>
          <Button
            variant="ghost"
            className="mt-6 text-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 bg-indigo-50 transition-all duration-300 hover:scale-105"
            onClick={() => setShowThankYou(true)}
          >
            <Heart className="w-4 h-4 mr-2" />
            Like it
          </Button>
        </div>
        <div className="mt-10 mx-auto max-w-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end justify-center flex-col gap-4 w-full">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input 
                        placeholder="https://example.com" 
                        className="h-12 text-lg"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full h-12 text-base bg-gray-900 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Analyzing..." : "Start Free Audit"}
              </Button>
            </form>
          </Form>
        </div>

        {isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-[spin_1s_linear_infinite]" />
              <p className="text-gray-600 font-medium">Analyzing your website...</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="mt-16">
            <div className="bg-white rounded-xl p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-900">UX Analysis Results</h3>
                  <div className="mt-2 text-lg text-gray-600 font-medium truncate">{analysis.meta.title}</div>
                  <div className="text-xs text-gray-400 truncate">{form.getValues().url}</div>
                </div>
                <div className="flex flex-col items-center md:items-end gap-2">
                  <div className="text-4xl font-bold text-indigo-600">{analysis.scores.totalScore}%</div>
                  <button onClick={handleExportPDF} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium shadow hover:bg-indigo-700 transition">Download PDF</button>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
                {/* Scores & Issues */}
                <div className="flex-1 min-w-[320px] mb-8">
                  <h4 className="text-lg font-semibold mb-4">Scores</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Contrast</span>
                        <span className="text-sm font-medium">{Math.round(analysis.scores.contrastScore)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${analysis.scores.contrastScore}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Clickable Spacing</span>
                        <span className="text-sm font-medium">{Math.round(analysis.scores.clickableSpacingScore)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${analysis.scores.clickableSpacingScore}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Link Underlines</span>
                        <span className="text-sm font-medium">{Math.round(analysis.scores.underlinedLinksScore)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${analysis.scores.underlinedLinksScore}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Font Sizes</span>
                        <span className="text-sm font-medium">{Math.round(analysis.scores.fontSizeScore)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${analysis.scores.fontSizeScore}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Mobile Responsive</span>
                        <span className="text-sm font-medium">{Math.round(analysis.scores.mobileResponsiveScore)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${analysis.scores.mobileResponsiveScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Grouped Issues */}
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold mb-4">Issues Found</h4>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                      {Object.entries(groupedIssues).map(([group, items]) => (
                        <div key={group}>
                          <div className="flex items-center gap-2 mb-1">
                            {group === 'Contrast Issues' && <span className="text-yellow-500">⚠️</span>}
                            {group === 'Font Size Issues' && <span className="text-pink-500">🔡</span>}
                            {group === 'Link Issues' && <span className="text-blue-500">🔗</span>}
                            {group === 'Spacing Issues' && <span className="text-green-500">↔️</span>}
                            {group === 'Other' && <span className="text-gray-400">•</span>}
                            <span className="font-semibold text-gray-800 text-sm">{group}</span>
                          </div>
                          <ul className="ml-4 list-disc text-xs text-gray-600 space-y-1">
                            {items.map((issue, idx) => (
                              <li key={idx}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Design Notes */}
                  {(analysis.scores.contrastNotes.length > 0 || analysis.scores.fontSizeNotes.length > 0) && (
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold mb-4">Design Notes</h4>
                      <ul className="space-y-2 text-xs text-gray-500">
                        {analysis.scores.contrastNotes.map((note, i) => (
                          <li key={"contrast-"+i} className="flex items-start"><span className="text-yellow-500 mr-2">⚠️</span>{note}</li>
                        ))}
                        {analysis.scores.fontSizeNotes.map((note, i) => (
                          <li key={"font-"+i} className="flex items-start"><span className="text-pink-500 mr-2">🔡</span>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thank You Dialog */}
        <Dialog open={showThankYou} onOpenChange={setShowThankYou}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-indigo-600">Thank You!</DialogTitle>
              <DialogDescription className="text-center text-gray-600 mt-2">
                Your feedback means a lot to us. We're glad you like our UX Audit tool!
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => setShowThankYou(false)}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Zoom Modal */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
            {selectedImage && (
              <div className="relative w-full h-full">
                <Image
                  src={`data:image/png;base64,${selectedImage}`}
                  alt="Zoomed Screenshot"
                  width={1920}
                  height={1080}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}; 