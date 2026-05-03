"use client";

import type { Session } from "@/lib/types";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { PenTool, Trash2, CalendarDays, Lock, Crown } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

interface SessionListProps {
  sessions: Session[];
  searchQuery: string;
  date: Date | undefined;
  onViewDetails: (session: Session) => void;
  onEdit: (session: Session) => void;
  onDelete: (id: string) => void;
}

export function SessionList({
  sessions,
  searchQuery,
  date,
  onViewDetails,
  onEdit,
  onDelete,
}: SessionListProps) {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {sessions.length > 0 ? (
          sessions.map((session) => {
            const isOwner = !(session as any).authorId || (session as any).authorId === user?.personalId;
            const canModify = isAdmin || isOwner;

            return (
                <div
                  key={session.id}
                  className={cn(
                    "group flex items-center justify-between border-b last:border-0 p-4 hover:bg-muted/30 transition-colors cursor-pointer",
                    !canModify && "opacity-75"
                  )}
                  onClick={() => onViewDetails(session)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border shadow-sm">
                      <AvatarFallback className={cn(
                          "font-semibold",
                          isAdmin && !isOwner ? "bg-amber-500/10 text-amber-600" : "bg-primary/5 text-primary"
                      )}>
                        {getInitials(session.teacherName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-base group-hover:text-primary transition-colors flex items-center gap-2">
                        {session.programName}
                        {!isOwner && !isAdmin && <Lock className="h-3 w-3 text-muted-foreground/40" />}
                        {isAdmin && !isOwner && <Crown className="h-3 w-3 text-amber-500/40" />}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/80">{session.teacherName}</span>
                        <span>•</span>
                        <span>{searchQuery ? format(session.date, "PPP") : "Today"}</span>
                        {isOwner && <Badge variant="outline" className="text-[9px] h-4 bg-primary/5 text-primary border-primary/20">Yours</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="px-2 py-0.5 text-xs font-medium">
                      {`${session.startTime} - ${session.endTime}`}
                    </Badge>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-8 w-8 transition-all",
                            canModify ? "opacity-0 group-hover:opacity-100" : "opacity-20 cursor-not-allowed"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canModify) onEdit(session);
                        }}
                      >
                        <PenTool className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-8 w-8 transition-all hover:text-destructive",
                            canModify ? "opacity-0 group-hover:opacity-100" : "opacity-20 cursor-not-allowed"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canModify) onDelete(session.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-20">
            <CalendarDays className="h-12 w-12 mb-4 opacity-20" />
            <h4 className="text-base font-semibold text-foreground/70">No sessions found</h4>
            <p className="text-sm max-w-[240px] mx-auto mt-1">
              {searchQuery ? "No results match your search." : "There are no bookings for today."}
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
