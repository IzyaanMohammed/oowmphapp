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
    <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none rounded-none bg-white dark:bg-zinc-900 overflow-hidden">
      <CardContent className="p-3">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            setDate(d);
            setSearchQuery("");
          }}
          className="p-1 rounded-none"
          modifiers={{
            hasSession: sessions.map((session) => new Date(session.date)),
          }}
          modifiersStyles={{
            hasSession: {
              fontWeight: "900",
              textDecoration: "underline",
              textDecorationColor: "#000000",
              textUnderlineOffset: "3px",
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
