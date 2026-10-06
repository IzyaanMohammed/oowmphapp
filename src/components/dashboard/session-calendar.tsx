"use client";

import { Calendar } from "../ui/calendar";
import { Card, CardContent } from "../ui/card";
import type { Session } from "@/lib/types";

interface SessionCalendarProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  setSearchQuery: (query: string) => void;
  sessions: Session[];
}

export function SessionCalendar({
  date,
  setDate,
  setSearchQuery,
  sessions,
}: SessionCalendarProps) {
  return (
    <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-xs rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
      <CardContent className="p-3">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            setDate(d);
            setSearchQuery("");
          }}
          className="p-1"
          modifiers={{
            hasSession: sessions.map((session) => new Date(session.date)),
          }}
          modifiersStyles={{
            hasSession: {
              fontWeight: "700",
              textDecoration: "underline",
              textDecorationColor: "#111111",
              textUnderlineOffset: "3px",
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
