"use client";

import type { Session } from "@/lib/types";
import { useState } from "react";
import { Button } from "../ui/button";
import { PlusCircle, CalendarDays, Download, Search } from "lucide-react";
import { Calendar } from "../ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { isSameDay, format, isSameMonth } from "date-fns";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { SessionForm } from "./session-form";
import { ScrollArea } from "../ui/scroll-area";
import { SessionDetailsDialog } from "./session-details";
import { Input } from "../ui/input";
import { AppHeader } from "../layout/app-header";

interface DashboardClientProps {
  sessions: Session[];
}

export function DashboardClient({ sessions }: DashboardClientProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [viewedSession, setViewedSession] = useState<Session | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessionsByDate = sessions.filter((session) =>
    date ? isSameDay(session.date, date) : true
  );

  const filteredSessions = filteredSessionsByDate.filter((session) => {
    const query = searchQuery.toLowerCase();
    return (
      session.programName.toLowerCase().includes(query) ||
      session.teacherName.toLowerCase().includes(query) ||
      (session.notes && session.notes.toLowerCase().includes(query))
    );
  });
  
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

  const handleDownloadReport = () => {
    const monthSessions = sessions.filter(session => date ? isSameMonth(session.date, date) : false);
    if (monthSessions.length === 0) {
      console.log("No sessions to report for the selected month.");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(monthSessions, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `session_report_${date ? format(date, 'yyyy-MM') : 'all'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <>
      <AppHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="flex items-center justify-between mt-6">
        <h3 className="text-xl font-semibold tracking-tight font-headline">
          {date ? format(date, "MMMM d, yyyy") : "All Sessions"}
        </h3>
        <div className="flex gap-2">
            <Button onClick={handleDownloadReport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Session
            </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-3"
                modifiers={{
                  hasSession: sessions.map((session) => session.date),
                }}
                modifiersStyles={{
                  hasSession: {
                    fontWeight: "bold",
                    textDecoration: 'underline',
                    textDecorationColor: 'hsl(var(--primary))',
                    textUnderlineOffset: '2px',
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Bookings for the day</CardTitle>
              <CardDescription>
                {filteredSessions.length > 0
                  ? `${filteredSessions.length} session(s) scheduled.`
                  : "No sessions scheduled for this day."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {filteredSessions.length > 0 ? (
                    filteredSessions.map((session) => {
                      return (
                        <div
                          key={session.id}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-secondary/50 cursor-pointer"
                          onClick={() => handleViewDetails(session)}
                        >
                          <div className="flex items-center gap-4">
                              <Avatar>
                                <AvatarFallback>{getInitials(session.teacherName)}</AvatarFallback>
                              </Avatar>
                            <div>
                              <p className="font-semibold">{session.programName}</p>
                              <p className="text-sm text-muted-foreground">
                                {session.teacherName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">{`${session.startTime} - ${session.endTime}`}</Badge>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(session);
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-10">
                      <CalendarDays className="h-12 w-12 mb-4" />
                      <p>Select a day to see bookings or add a new one.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
      <SessionForm 
        isOpen={isFormOpen} 
        setIsOpen={setIsFormOpen}
        session={selectedSession}
        sessions={sessions}
        key={selectedSession?.id || 'new'}
      />
      {viewedSession && (
        <SessionDetailsDialog
          isOpen={isDetailsOpen}
          setIsOpen={setIsDetailsOpen}
          session={viewedSession}
        />
      )}
    </>
  );
}
