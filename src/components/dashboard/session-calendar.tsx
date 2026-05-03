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
    <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden glass">
      <CardContent className="p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            setDate(d);
            setSearchQuery("");
          }}
          className="p-4"
          modifiers={{
            hasSession: sessions.map((session) => session.date),
          }}
          modifiersStyles={{
            hasSession: {
              fontWeight: "bold",
              textDecoration: "underline",
              textDecorationColor: "hsl(var(--primary))",
              textUnderlineOffset: "4px",
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
