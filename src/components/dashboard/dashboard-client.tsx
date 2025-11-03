"use client";

import type { Session, User } from "@/lib/types";
import { useState } from "react";
import { Button } from "../ui/button";
import { PlusCircle, CalendarDays } from "lucide-react";
import { Calendar } from "../ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { isSameDay, format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "../ui/badge";
import { SessionForm } from "./session-form";
import { ScrollArea } from "../ui/scroll-area";
import { useUser } from "@/firebase";

interface DashboardClientProps {
  sessions: Session[];
  users: User[];
}

export function DashboardClient({ sessions, users }: DashboardClientProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const { user: currentUser } = useUser();

  const getTeacher = (teacherId: string) =>
    users.find((user) => user.id === teacherId);

  const filteredSessions = sessions.filter((session) =>
    date ? isSameDay(session.date, date) : true
  );

  const handleEdit = (session: Session) => {
    setSelectedSession(session);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedSession(null);
    setIsFormOpen(true);
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }

  const canEdit = (session: Session) => {
    if (!currentUser) return false;
    const userRole = users.find(u => u.id === currentUser.uid)?.role;
    if (userRole === 'admin') return true;
    if (userRole === 'teacher' && session.teacherId === currentUser.uid) return true;
    return false;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight font-headline">
          {date ? format(date, "MMMM d, yyyy") : "All Sessions"}
        </h3>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Session
        </Button>
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
                      const teacher = getTeacher(session.teacherId);
                      const avatar = PlaceHolderImages.find(p => p.id === teacher?.avatarId);
                      return (
                        <div
                          key={session.id}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-secondary/50"
                        >
                          <div className="flex items-center gap-4">
                            {teacher && (
                               <Avatar>
                                <AvatarImage src={avatar?.imageUrl} data-ai-hint={avatar?.imageHint} />
                                <AvatarFallback>{getInitials(teacher.name)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <p className="font-semibold">{session.programName}</p>
                              <p className="text-sm text-muted-foreground">
                                {teacher?.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">{`${session.startTime} - ${session.endTime}`}</Badge>
                            {canEdit(session) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(session)}
                              >
                                Edit
                              </Button>
                            )}
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
        users={users}
        key={selectedSession?.id || 'new'}
      />
    </>
  );
}
