"use client";

import { useState, useEffect } from "react";
import { Bell, Megaphone, Clock, CalendarCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { getBulletins, getSessions } from "@/app/actions";
import { formatDistanceToNow } from "date-fns";
import type { Announcement } from "@/lib/types";
import { useRouter } from "next/navigation";

type CombinedNotification = {
    id: string;
    type: 'bulletin' | 'booking';
    title: string;
    message: string;
    createdAt: Date;
};

export function NotificationIcon() {
  const [notifications, setNotifications] = useState<CombinedNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const fetchAll = async () => {
    try {
      const [bulletins, sessions] = await Promise.all([
          getBulletins(),
          getSessions()
      ]);

      const combined: CombinedNotification[] = [
          ...bulletins.map((b: any) => ({
              id: b.id,
              type: 'bulletin' as const,
              title: b.title,
              message: b.message,
              createdAt: new Date(b.createdAt)
          })),
          ...sessions.map((s: any) => ({
              id: s.id,
              type: 'booking' as const,
              title: "New Booking",
              message: `${s.programName} - ${s.teacherName}`,
              createdAt: new Date(s.createdAt || s.date)
          }))
      ];

      const sorted = combined.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
      ).slice(0, 10);
      
      setNotifications(sorted);
      
      const lastRead = localStorage.getItem('mph_notifications_last_read') || '0';
      const unread = sorted.filter((n) => 
          n.createdAt.getTime() > parseInt(lastRead)
      ).length;
      
      setUnreadCount(unread);
    } catch (err) {
      console.error("Notification sync error:", err);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => {
    setUnreadCount(0);
    localStorage.setItem('mph_notifications_last_read', Date.now().toString());
  };

  const handleNotificationClick = (n: CombinedNotification) => {
    const tab = n.type === 'bulletin' ? 'announcements' : 'sessions';
    router.push(`/dashboard?tab=${tab}&highlight=${n.id}`);
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && handleOpen()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors h-10 w-10 rounded-xl">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white border-2 border-background animate-bounce"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2 shadow-2xl border-primary/10 backdrop-blur-xl bg-card/95">
        <DropdownMenuLabel className="flex items-center justify-between px-2 py-1.5">
          <span className="font-bold text-base tracking-tight">Activity Feed</span>
          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-primary border-primary/20">System Live</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-primary/5" />
        
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground italic text-sm">
            No recent activity detected.
          </div>
        ) : (
          <div className="max-h-[450px] overflow-y-auto pr-1">
            {notifications.map((n) => (
              <DropdownMenuItem 
                key={n.id} 
                className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-primary/5 rounded-xl mb-2 border border-transparent hover:border-primary/10 transition-all"
                onClick={() => handleNotificationClick(n)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      n.type === 'bulletin' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-600'
                  }`}>
                    {n.type === 'bulletin' ? <Megaphone className="h-4 w-4" /> : <CalendarCheck className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-sm truncate">{n.title}</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{n.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {n.message}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pl-11 text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tight">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
