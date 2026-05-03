import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FileDown, FileUp, RefreshCcw, Mail, ArrowRightLeft, Sparkles, CheckCircle2, ShieldAlert, BarChart3, Database, ShieldCheck, AlertTriangle, FileText, Info } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { clearDatabase } from "@/app/actions";

export function FileConverterTab() {
  const { toast } = useToast();
  const { role } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<"csv" | "xlsx" | "docx" | "txt" | "">("");
  const [isConverting, setIsConverting] = useState(false);
  const [isSendingSummary, setIsSendingSummary] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [lastDispatchInfo, setLastDispatchInfo] = useState<any>(null);

  const isAdmin = role === 'admin';

  const handleConvert = async () => {
    if (!file) {
      toast({ variant: "destructive", title: "Missing File", description: "Please upload a source document." });
      return;
    }
    if (!outputFormat) {
      toast({ variant: "destructive", title: "Select Format", description: "Specify the desired output blueprint." });
      return;
    }

    setIsConverting(true);
    try {
      let jsonData: any[] = [];
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'json') {
          const text = await file.text();
          jsonData = JSON.parse(text);
          if (!Array.isArray(jsonData)) jsonData = [jsonData];
      } else if (extension === 'txt') {
          const text = await file.text();
          jsonData = text.split('\n').map(line => ({ content: line }));
      } else {
          const arrayBuffer = await file.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
      }
      
      let output: any;
      let mimeType: string;
      let outExt: string;

      switch (outputFormat) {
        case "xlsx":
          const newWb = XLSX.utils.book_new();
          const newWs = XLSX.utils.json_to_sheet(jsonData);
          XLSX.utils.book_append_sheet(newWb, newWs, "Data");
          output = XLSX.write(newWb, { type: "array", bookType: "xlsx" });
          mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          outExt = "xlsx";
          break;
        case "docx":
          // Dynamic import to prevent SSR 'clientModules' manifest issues
          const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell } = await import("docx");
          
          const doc = new Document({
            sections: [{
              properties: {},
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Institutional Data Export", bold: true, size: 32 })],
                  spacing: { after: 400 }
                }),
                new Table({
                  rows: [
                    new TableRow({
                      children: Object.keys(jsonData[0] || {}).map(key => new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: key, bold: true })] })],
                        shading: { fill: "f3f4f6" }
                      }))
                    }),
                    ...jsonData.map(row => new TableRow({
                      children: Object.values(row).map(val => new TableCell({
                        children: [new Paragraph(String(val))]
                      }))
                    }))
                  ]
                })
              ]
            }]
          });
          output = await Packer.toBlob(doc);
          mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          outExt = "docx";
          break;
        case "txt":
          output = jsonData.map(row => Object.values(row).join('\t')).join('\n');
          mimeType = "text/plain";
          outExt = "txt";
          break;
        default: // csv
          const csvWs = XLSX.utils.json_to_sheet(jsonData);
          output = XLSX.utils.sheet_to_csv(csvWs);
          mimeType = "text/csv;charset=utf-8;";
          outExt = "csv";
      }

      const blob = output instanceof Blob ? output : new Blob([output], { type: mimeType });
      const fileName = file.name.replace(/\.[^/.]+$/, "") + "." + outExt;
      saveAs(blob, fileName);

      toast({ title: "Conversion Successful", description: "File processed: " + fileName });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Process Error", description: "Failed to convert the document." });
    } finally {
      setIsConverting(false);
    }
  };

  const sendSummary = async () => {
    setIsSendingSummary(true);
    setLastDispatchInfo(null);
    try {
      const res = await fetch("/api/send-session-summary", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Communication error");
      }
      
      setLastDispatchInfo(data.debug);
      toast({ 
        title: "Dispatch Successful", 
        description: `Briefing sent. Records found: ${data.debug?.sessionsFound || 0}` 
      });
    } catch (e) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : "Request failed";
      
      toast({ 
        variant: "destructive", 
        title: "Dispatch Failure", 
        description: errorMsg.includes("onboarding") 
          ? "Resend Restriction: You can only send to your own email address with this API key until a domain is verified."
          : errorMsg
      });
    } finally {
      setIsSendingSummary(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("CRITICAL: This will permanently wipe all sessions, bulletins, and notes. Proceed?")) return;
    setIsResetting(true);
    try {
        await clearDatabase();
        toast({ title: "System Reset", description: "Database has been completely purged." });
        window.location.reload();
    } catch (err) {
        toast({ variant: "destructive", title: "Reset Failed", description: "Could not purge database." });
    } finally {
        setIsResetting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-6 duration-700">
      {isAdmin ? (
        <>
          <Card className="group relative overflow-hidden border-none shadow-2xl bg-card/40 backdrop-blur-md glass transition-all hover:shadow-orange-500/5">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
              <Mail size={160} />
            </div>
            <CardHeader className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-orange-500/5 text-orange-600 border-orange-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">COMMUNICATION HUB</Badge>
              </div>
              <CardTitle className="text-3xl font-black flex items-center gap-4 tracking-tighter">
                <div className="bg-orange-500/10 p-2.5 rounded-2xl">
                  <Mail className="h-7 w-7 text-orange-600" />
                </div>
                Email Dispatch
              </CardTitle>
              <CardDescription className="text-lg font-medium text-muted-foreground/80 mt-2">Send an institutional briefing to all faculty members.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="p-6 rounded-[2rem] bg-orange-500/5 border-2 border-orange-500/10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-black text-orange-900 uppercase tracking-widest">Admin Control</p>
                    </div>
                    {lastDispatchInfo && (
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 font-bold text-[10px]">
                            {lastDispatchInfo.sessionsFound} Records Sync'd
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-orange-800/70 leading-relaxed font-medium">
                    This manually triggers the 5:00 AM briefing immediately. 
                    <span className="block mt-1 text-[11px] font-bold text-orange-900/60 uppercase italic">
                        Note: Resend 'onboarding' keys only deliver to the account owner.
                    </span>
                </p>
              </div>
              
              <Button 
                onClick={sendSummary} 
                disabled={isSendingSummary}
                className="w-full h-16 bg-orange-600 hover:bg-orange-700 rounded-2xl font-black text-xl shadow-2xl shadow-orange-500/30 text-white transition-all hover:scale-[1.01]"
              >
                {isSendingSummary ? <RefreshCcw className="mr-3 h-6 w-6 animate-spin" /> : <Mail className="mr-3 h-6 w-6" />}
                {isSendingSummary ? "DISPATCHING..." : "DISPATCH NOW"}
              </Button>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-none shadow-2xl bg-card/40 backdrop-blur-md glass transition-all hover:shadow-amber-500/5">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
              <Database size={160} />
            </div>
            <CardHeader className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">SYSTEM MANAGEMENT</Badge>
              </div>
              <CardTitle className="text-3xl font-black flex items-center gap-4 tracking-tighter">
                <div className="bg-amber-500/10 p-2.5 rounded-2xl">
                  <Database className="h-7 w-7 text-amber-600" />
                </div>
                Storage Control
              </CardTitle>
              <CardDescription className="text-lg font-medium text-muted-foreground/80 mt-2">Manage the institutional database and system health.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 rounded-2xl bg-amber-500/5 border border-amber-500/10 p-4 flex flex-col justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Status</span>
                        <span className="text-xl font-bold text-amber-700 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> SECURE
                        </span>
                    </div>
                    <div className="h-24 rounded-2xl bg-amber-500/5 border border-amber-500/10 p-4 flex flex-col justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Storage Engine</span>
                        <span className="text-xl font-bold text-amber-700">JSON-V3</span>
                    </div>
                </div>
                <Button 
                    onClick={handleReset}
                    disabled={isResetting}
                    className="w-full h-14 bg-destructive/10 hover:bg-destructive/20 text-destructive border-2 border-destructive/20 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    {isResetting ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                    {isResetting ? "PURGING..." : "PURGE ENTIRE DATABASE"}
                </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card className="group relative overflow-hidden border-none shadow-2xl bg-card/40 backdrop-blur-md glass transition-all hover:shadow-primary/5">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
              <FileText size={160} />
            </div>
            <CardHeader className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">UTILITY ENGINE</Badge>
              </div>
              <CardTitle className="text-3xl font-black flex items-center gap-4 tracking-tighter">
                <div className="bg-primary/10 p-2.5 rounded-2xl">
                  <RefreshCcw className="h-7 w-7 text-primary" />
                </div>
                Document Converter
              </CardTitle>
              <CardDescription className="text-lg font-medium text-muted-foreground/80 mt-2">Multi-format processing: Convert Excel, CSV, JSON, or Text.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="space-y-3 group">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <FileUp className="h-3.5 w-3.5" /> Source Document
                </label>
                <Input 
                  type="file" 
                  accept=".csv,.xls,.xlsx,.json,.txt" 
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="h-14 px-4 py-3 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <FileDown className="h-3.5 w-3.5" /> Output Blueprint
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['csv', 'xlsx', 'docx', 'txt'].map((id) => (
                    <Button 
                        key={id}
                        variant={outputFormat === id ? 'default' : 'outline'}
                        onClick={() => setOutputFormat(id as any)}
                        className={cn(
                        "h-12 rounded-xl font-black",
                        outputFormat === id ? "bg-primary shadow-lg" : "border-2"
                        )}
                    >
                        {id.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleConvert} 
                disabled={isConverting || !file} 
                className="w-full h-16 rounded-2xl font-black text-xl shadow-2xl bg-primary hover:bg-primary/90"
              >
                {isConverting ? <RefreshCcw className="mr-3 h-6 w-6 animate-spin" /> : <Sparkles className="mr-3 h-6 w-6" />}
                {isConverting ? "CONVERTING..." : "GENERATE DOCUMENT"}
              </Button>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-none shadow-2xl bg-card/40 backdrop-blur-md glass transition-all opacity-60">
            <CardHeader className="p-8">
                <Badge variant="outline" className="w-fit mb-4">RESTRICTED</Badge>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                    Admin Management
                </CardTitle>
                <CardDescription>System controls are restricted to administrative accounts.</CardDescription>
            </CardHeader>
          </Card>
        </>
      )}
    </div>
  );
}
