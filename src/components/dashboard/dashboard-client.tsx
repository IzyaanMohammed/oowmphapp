"use client";

import type { Session } from "@/lib/types";
import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { Button } from "../ui/button";
import { PlusCircle, Download, LayoutDashboard, Megaphone, Wrench, PenTool, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { isSameDay, format, isSameMonth } from "date-fns";
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
import { saveSession, deleteSession } from "@/app/actions";
import { AppHeader } from "../layout/app-header";
import { useAuth } from "@/context/auth-context";
import { useSearchParams, useRouter } from "next/navigation";
import { Logo } from "@/components/icons";

interface DashboardClientProps {
  initialSessions: Session[];
}

function DashboardContent({ initialSessions }: DashboardClientProps) {
  const { user, role } = useAuth();
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

  // Default active tab from searchParams if present
  const [activeTab, setActiveTab] = useState<string>(() => {
    const tabParam = searchParams?.get('tab');
    return tabParam || "sessions";
  });

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [viewedSession, setViewedSession] = useState<Session | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = role === 'admin';

  // Instant tab change handler without blocking page router transitions
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', value);
      window.history.replaceState(null, '', url.toString());
    }
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
  };

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

    const saved = await saveSession(sessionWithAuthor);
    if (saved && saved.id) {
      setSessions(prev => prev.map(s => s.id === sessionData.id ? { ...saved, date: new Date(saved.date) } as any : s));
    }
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
      headStyles: { fillColor: [17, 17, 17] },
      styles: { cellPadding: 3, fontSize: 10 },
    });

    doc.save(`session_report_${date ? format(date, 'yyyy-MM') : 'all'}.pdf`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfc] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <AppHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-between">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          {/* Cal.com nav-pill-group layout */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-4">
            <TabsList className="bg-zinc-100/90 dark:bg-zinc-800/80 p-1.5 rounded-full inline-flex items-center gap-1 border border-zinc-200/60 dark:border-zinc-700/60 h-auto">
              <TabsTrigger 
                value="sessions" 
                className="rounded-full px-4 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all duration-200 flex items-center gap-1.5"
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> Bookings
              </TabsTrigger>
              
              {!isAdmin && (
                <>
                  <TabsTrigger 
                    value="announcements" 
                    className="rounded-full px-4 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all duration-200 flex items-center gap-1.5"
                  >
                    <Megaphone className="h-3.5 w-3.5" /> Bulletins
                  </TabsTrigger>
                  <TabsTrigger 
                    value="workspace" 
                    className="rounded-full px-4 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all duration-200 flex items-center gap-1.5"
                  >
                    <PenTool className="h-3.5 w-3.5" /> Workspace
                  </TabsTrigger>
                </>
              )}

              <TabsTrigger 
                value="tools" 
                className="rounded-full px-4 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all duration-200 flex items-center gap-1.5"
              >
                <Wrench className="h-3.5 w-3.5" /> {isAdmin ? "Admin Console" : "Tools"}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full px-3 py-1 text-[11px] font-semibold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> System Synchronized
              </Badge>
            </div>
          </div>

          <TabsContent value="sessions" className="space-y-6 outline-none transition-opacity duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {searchQuery
                    ? `Search: "${searchQuery}"`
                    : date
                    ? format(date, "MMMM d, yyyy")
                    : "Operational Overview"}
                </h1>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Manage instructional schedules and hall reservations.
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleDownloadReport} variant="outline" className="h-9 px-4 text-xs font-semibold border-zinc-200 hover:bg-zinc-100 rounded-md">
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Generate Report
                </Button>
                <Button onClick={handleAddNew} className="h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-md shadow-xs transition-all active:scale-[0.98]">
                  <PlusCircle className="mr-2 h-3.5 w-3.5" />
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
                <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-xs rounded-xl bg-white dark:bg-zinc-900">
                  <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 py-3.5 px-5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
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
              <TabsContent value="announcements" className="outline-none transition-opacity duration-150">
                <AnnouncementsTab />
              </TabsContent>

              <TabsContent value="workspace" className="outline-none transition-opacity duration-150">
                <StickyNotes />
              </TabsContent>
            </>
          )}

          <TabsContent value="tools" className="outline-none transition-opacity duration-150">
            <FileConverterTab />
          </TabsContent>
        </Tabs>

        {/* Cal.com Dark Footer (surface-dark: #101010) visually closes the page */}
        <footer className="mt-16 bg-[#101010] text-zinc-400 rounded-2xl p-6 sm:p-8 border border-zinc-800/80 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white border border-zinc-700">
              <Logo className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">MPH Central</div>
              <div className="text-xs text-zinc-500 font-medium">Multi-Tier Portal System · v4.2</div>
            </div>
          </div>

          {/* Subtle Attribution: "Made by Mohammed Izyaan" */}
          <div className="text-xs text-zinc-500 font-medium tracking-wide flex items-center gap-1.5">
            Made by Mohammed Izyaan
          </div>
        </footer>

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
        <div className="h-8 w-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent {...props} />
    </Suspense>
  );
}
