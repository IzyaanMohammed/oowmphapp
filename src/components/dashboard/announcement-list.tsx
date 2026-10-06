"use client";

import type { Announcement } from "@/lib/types";
import { format } from "date-fns";
import { User, Calendar, Pencil, Trash2 } from "lucide-react";
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
      <div className="flex flex-col gap-4 py-8">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 animate-pulse border border-zinc-200/50 dark:border-zinc-800" />
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[550px] pr-2">
      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((a: Announcement) => {
            const isMock = a.id.startsWith('mock-');
            return (
              <div 
                key={a.id} 
                className={`group relative rounded-xl border bg-white dark:bg-zinc-900/90 p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 ${isMock ? 'border-dashed opacity-80' : 'border-zinc-200/80 dark:border-zinc-800'}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{a.title}</h3>
                      {isMock && <Badge variant="secondary" className="text-[10px] h-4 rounded-full">Demo</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/60 px-2.5 py-0.5 rounded-full text-zinc-700 dark:text-zinc-300">
                        <User className="h-3 w-3 text-zinc-500" /> {a.authorName}
                      </span>
                      <span className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/60 px-2.5 py-0.5 rounded-full text-zinc-700 dark:text-zinc-300">
                        <Calendar className="h-3 w-3 text-zinc-500" /> {a.createdAt ? format(a.createdAt, "PPP") : "Just now"}
                      </span>
                      {a.updatedAt && (
                        <Badge variant="outline" className="text-[10px] h-4 font-medium border-zinc-200 text-zinc-600 rounded-full">Edited</Badge>
                      )}
                    </div>
                  </div>
                  {!isMock && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" onClick={() => onEdit(a)} className="h-8 w-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onDelete(a.id)} className="h-8 w-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap pl-3.5 border-l-2 border-zinc-200 dark:border-zinc-700">
                  {a.message}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-3 border border-dashed rounded-xl p-8 bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200/80">
          <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300">No bulletins posted</p>
          <p className="text-xs text-zinc-500 max-w-sm">The announcement board is clear. Click "New Post" above to publish an announcement.</p>
        </div>
      )}
    </ScrollArea>
  );
}
