"use client";

import type { Session } from "@/lib/types";
import { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { PlusCircle, Download, LayoutDashboard, Megaphone, Wrench, PenTool, Sparkles, User, ShieldCheck, Crown } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { isSameDay, format, isSameMonth, setHours, setMinutes, isAfter } from "date-fns";
import { Badge } from "../ui/badge";
import { SessionForm } from "./session-form";
import { SessionDetailsDialog } from "./session-details";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { AnnouncementsTab } from "./announcements-tab";
import { FileConverterTab } from "./file-converter-tab";
import { StickyNotes } from "./sticky-notes";
import { SessionList } from "./session-list";
import { SessionCalendar } from "./session-calendar";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { getSessions, saveSession, deleteSession } from "@/app/actions";
import { AppHeader } from "../layout/app-header";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

interface DashboardClientProps {
  initialSessions: Session[];
}

function DashboardContent({ initialSessions }: DashboardClientProps) {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [sessions, setSessions] = useState<Session[]>(() => {
    return (initialSessions || []).map((s: any) => {
        try {
            return {
                ...s,
                date: s.date ? new Date(s.date) : new Date(),
                createdAt: s.createdAt ? new Date(s.createdAt) : undefined,
            };
        } catch (e) {
            console.error("Date parse error", e);
            return { ...s, date: new Date() };
        }
    });
  });
  
  const [activeTab, setActiveTab] = useState("sessions");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [viewedSession, setViewedSession] = useState<Session | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = role === 'admin';

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && tab !== activeTab) {
        setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  useEffect(() => {
    // Polling removed to prevent server exhaustion and resolve ChunkLoadErrors.
    // The system now relies on initial data load and optimistic UI updates for responsiveness.
  }, []);

  const sessionsForSelectedDate = useMemo(() => sessions.filter((session) =>
    date ? isSameDay(session.date, date) : true
  ), [sessions, date]);

  const searchedSessions = useMemo(() => sessions.filter((session) => {
    const query = searchQuery.toLowerCase();
    if (!query) return false;
    return (
      session.programName.toLowerCase().includes(query) ||
      session.teacherName.toLowerCase().includes(query) ||
      (session.notes && session.notes.toLowerCase().includes(query))
    );
  }), [sessions, searchQuery]);

  const displayedSessions = useMemo(() => 
    searchQuery ? searchedSessions : sessionsForSelectedDate
  , [searchQuery, searchedSessions, sessionsForSelectedDate]);
  
  const handleEdit = (session: Session) => {
    setSelectedSession(session);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedSession(null);
    setIsFormOpen(true);
  }

  const handleViewDetails = (session: Session) => {
    setViewedSession(session);
    setIsDetailsOpen(true);
  };

  const onSaveSession = async (sessionData: Session) => {
    const sessionWithAuthor = {
        ...sessionData,
        authorId: (sessionData as any).authorId || user?.personalId,
        date: sessionData.date.toISOString(),
    };

    setSessions(prev => {
        const index = prev.findIndex(s => s.id === sessionData.id);
        if (index > -1) {
            const updated = [...prev];
            updated[index] = { ...sessionData, authorId: (sessionData as any).authorId || user?.personalId } as any;
            return updated;
        }
        return [{ ...sessionData, authorId: user?.personalId } as any, ...prev];
    });

    await saveSession(sessionWithAuthor);
  };

  const onDeleteSession = async (id: string) => {
    if (!window.confirm("Delete this session?")) return;
    setSessions(prev => prev.filter(s => s.id !== id));
    await deleteSession(id);
  };

  const handleDownloadReport = () => {
    const monthSessions = sessions.filter(session => date ? isSameMonth(session.date, date) : false);
    if (monthSessions.length === 0) return;

    const doc = new jsPDF();
    const monthName = date ? format(date, 'MMMM yyyy') : 'All Time';
    doc.text(`Session Report for ${monthName}`, 14, 16);
    
    autoTable(doc, {
      startY: 22,
      head: [['Date', 'Time', 'Program', 'Teacher', 'Notes']],
      body: monthSessions.map(s => [
        format(s.date, 'PPP'),
        `${s.startTime} - ${s.endTime}`,
        s.programName,
        s.teacherName,
        s.notes || ''
      ]),
      headStyles: { fillColor: [34, 65, 124] },
      styles: { cellPadding: 3, fontSize: 10 },
    });

    doc.save(`session_report_${date ? format(date, 'yyyy-MM') : 'all'}.pdf`);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/dashboard?tab=${value}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between border-b pb-0 gap-4">
            <TabsList className="bg-transparent h-12 p-0 gap-6">
              <TabsTrigger 
                value="sessions" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-12 px-1 text-base font-bold transition-all"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" /> Bookings
              </TabsTrigger>
              
              {!isAdmin && (
                  <>
                    <TabsTrigger 
                        value="announcements" 
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-12 px-1 text-base font-bold transition-all"
                    >
                        <Megaphone className="mr-2 h-4 w-4" /> Bulletins
                    </TabsTrigger>
                    <TabsTrigger 
                        value="workspace" 
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-12 px-1 text-base font-bold transition-all"
                    >
                        <PenTool className="mr-2 h-4 w-4" /> Workspace
                    </TabsTrigger>
                  </>
              )}

              <TabsTrigger 
                value="tools" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-12 px-1 text-base font-bold transition-all"
              >
                <Wrench className="mr-2 h-4 w-4" /> {isAdmin ? "Admin Console" : "Tools"}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 mb-2">
               <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary font-medium">
                 <Sparkles className="mr-1.5 h-3 w-3" /> System Synchronized
               </Badge>
            </div>
          </div>

          <TabsContent value="sessions" className="space-y-6 outline-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {searchQuery
                    ? `Search: "${searchQuery}"`
                    : date
                    ? format(date, "MMMM d, yyyy")
                    : "Operational Overview"}
                </h1>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleDownloadReport} variant="outline" className="h-10 px-4 font-semibold">
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
                <Button onClick={handleAddNew} className="h-10 px-4 bg-primary hover:bg-primary/90 font-bold shadow-sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Entry
                </Button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="w-full lg:w-[320px] shrink-0">
                <SessionCalendar
                  date={date}
                  setDate={setDate}
                  setSearchQuery={setSearchQuery}
                  sessions={sessions}
                />
              </div>

              <div className="flex-1 min-w-0 w-full">
                <Card className="border shadow-sm h-full bg-card">
                  <CardHeader className="border-b bg-muted/5 py-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold">
                        {searchQuery
                          ? `Found ${displayedSessions.length} records`
                          : `Schedule for ${date ? format(date, "EEEE") : "Selected Day"}`}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <SessionList
                      sessions={displayedSessions}
                      searchQuery={searchQuery}
                      date={date}
                      onViewDetails={handleViewDetails}
                      onEdit={handleEdit}
                      onDelete={onDeleteSession}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {!isAdmin && (
              <>
                <TabsContent value="announcements" className="outline-none">
                    <AnnouncementsTab />
                </TabsContent>

                <TabsContent value="workspace" className="outline-none">
                    <StickyNotes />
                </TabsContent>
              </>
          )}

          <TabsContent value="tools" className="outline-none">
            <FileConverterTab />
          </TabsContent>
        </Tabs>
        
        <SessionForm 
          isOpen={isFormOpen} 
          setIsOpen={setIsFormOpen}
          session={selectedSession}
          sessions={sessions}
          onSave={onSaveSession}
          key={selectedSession?.id || 'new'}
        />
        
        {viewedSession && (
          <SessionDetailsDialog
            isOpen={isDetailsOpen}
            setIsOpen={setIsDetailsOpen}
            session={viewedSession}
          />
        )}
      </div>
    </div>
  );
}

export function DashboardClient(props: DashboardClientProps) {
    return (
        <Suspense fallback={
            <div className="flex flex-1 items-center justify-center p-20">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <DashboardContent {...props} />
        </Suspense>
    );
}
