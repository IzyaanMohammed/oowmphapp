"use client";

import type { Announcement } from "@/lib/types";
import { format } from "date-fns";
import { User, Calendar, Pencil, Trash2, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

interface AnnouncementListProps {
  announcements: Announcement[];
  isLoading: boolean;
  onEdit: (a: Announcement) => void;
  onDelete: (id: string) => void;
}

export function AnnouncementList({
  announcements,
  isLoading,
  onEdit,
  onDelete,
}: AnnouncementListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 bg-primary rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      {announcements.length > 0 ? (
        <div className="space-y-6">
          {announcements.map((a: Announcement) => {
            const isMock = a.id.startsWith('mock-');
            return (
              <div 
                key={a.id} 
                className={`group relative rounded-2xl border bg-card p-6 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 glass ${isMock ? 'border-dashed opacity-80' : 'border-border/50'}`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                       <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{a.title}</h3>
                       {isMock && <Badge variant="secondary" className="text-[10px] h-4">Demo</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                        <User className="h-3.5 w-3.5 text-primary/70" /> {a.authorName}
                      </span>
                      <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-primary/70" /> {a.createdAt ? format(a.createdAt, "PPP") : "Just now"}
                      </span>
                      {a.updatedAt && (
                        <Badge variant="outline" className="text-[10px] h-5 py-0 font-normal border-primary/20 text-primary bg-primary/5">Edited</Badge>
                      )}
                    </div>
                  </div>
                  {!isMock && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <Button size="icon" variant="ghost" onClick={() => onEdit(a)} className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onDelete(a.id)} className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="text-base leading-relaxed text-foreground/80 whitespace-pre-wrap pl-4 border-l-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                  {a.message}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-80 text-center space-y-4 border-2 border-dashed rounded-3xl p-12 bg-muted/5 border-muted-foreground/10">
          <p className="text-xl font-bold text-foreground/70">No bulletins posted</p>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">The announcement board is currently clear.</p>
        </div>
      )}
    </ScrollArea>
  );
}
