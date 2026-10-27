"use client";

import type { Session } from "@/lib/types";
import { isSameDay, format, getMonth, getYear, getDaysInMonth, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

// ----- helpers -----

/** Convert "HH:MM" to total minutes from midnight */
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Operating hours: 07:00 – 21:00 in 30-min slots */
const START_HOUR = 7;
const END_HOUR = 21;
const SLOT_MINUTES = 30;

const TIME_SLOTS: string[] = [];
for (let h = START_HOUR; h < END_HOUR; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

function isSlotBooked(slotTime: string, sessions: Session[]): Session | null {
  const slotMin = toMinutes(slotTime);
  for (const s of sessions) {
    const start = toMinutes(s.startTime);
    const end = toMinutes(s.endTime);
    if (slotMin >= start && slotMin < end) return s;
  }
  return null;
}

// ----- Day view -----

function DayView({ date, sessions }: { date: Date; sessions: Session[] }) {
  const daySessions = useMemo(
    () => sessions.filter((s) => isSameDay(s.date, date)),
    [sessions, date]
  );

  const bookedCount = useMemo(() => {
    const bookedSlots = TIME_SLOTS.filter((t) => isSlotBooked(t, daySessions));
    return bookedSlots.length;
  }, [daySessions]);

  const freeCount = TIME_SLOTS.length - bookedCount;

  return (
    <div className="space-y-3">
      {/* Summary pills */}
      <div className="flex gap-2 text-[11px] font-semibold">
        <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          {freeCount} free
        </span>
        <span className="flex items-center gap-1.5 px-2 py-1 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          {bookedCount} booked
        </span>
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-4 gap-1">
        {TIME_SLOTS.map((slot) => {
          const booked = isSlotBooked(slot, daySessions);
          return (
            <div
              key={slot}
              title={booked ? `${booked.programName} — ${booked.teacherName} (${booked.startTime}–${booked.endTime})` : `Available at ${slot}`}
              className={`
                group relative h-9 flex items-center justify-center text-[10px] font-mono font-semibold
                border transition-colors cursor-default
                ${booked
                  ? "bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400"
                  : "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                }
              `}
            >
              {slot}
              {/* Hover tooltip */}
              {booked && (
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 hidden group-hover:flex flex-col items-start bg-zinc-900 text-white text-[10px] px-2 py-1.5 shadow-lg whitespace-nowrap max-w-[180px]">
                  <span className="font-bold truncate w-full">{booked.programName}</span>
                  <span className="text-zinc-400 truncate w-full">{booked.teacherName}</span>
                  <span className="text-zinc-400">{booked.startTime}–{booked.endTime}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----- Month view -----

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function MonthView({
  viewDate,
  sessions,
  onDayClick,
}: {
  viewDate: Date;
  sessions: Session[];
  onDayClick: (d: Date) => void;
}) {
  const year = getYear(viewDate);
  const month = getMonth(viewDate);
  const daysInMonth = getDaysInMonth(viewDate);
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function statusForDay(day: number): "free" | "partial" | "full" | "empty" {
    const d = new Date(year, month, day);
    const daySessions = sessions.filter((s) => isSameDay(s.date, d));
    if (daySessions.length === 0) return "empty";
    const bookedSlots = TIME_SLOTS.filter((t) => isSlotBooked(t, daySessions)).length;
    if (bookedSlots === 0) return "empty";
    if (bookedSlots < TIME_SLOTS.length * 0.5) return "free";
    if (bookedSlots < TIME_SLOTS.length * 0.85) return "partial";
    return "full";
  }

  const statusClass: Record<string, string> = {
    empty: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500",
    free: "bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300",
    partial: "bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300",
    full: "bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400",
  };

  const today = startOfDay(new Date());

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-[10px] font-semibold mb-3">
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 inline-block" /> Light bookings</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 inline-block" /> Moderate</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 inline-block" /> Heavy</span>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-zinc-500 py-0.5">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;
          const status = statusForDay(day);
          const d = new Date(year, month, day);
          const isToday = isSameDay(d, today);
          return (
            <button
              key={day}
              onClick={() => onDayClick(d)}
              title={`${format(d, "EEEE, MMM d")} — ${status === "empty" ? "No bookings" : status}`}
              className={`
                h-8 w-full flex items-center justify-center text-[11px] font-semibold border
                transition-all hover:ring-2 hover:ring-black dark:hover:ring-white hover:z-10 relative
                ${statusClass[status]}
                ${isToday ? "ring-2 ring-black dark:ring-white font-bold" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ----- Main widget -----

interface AvailabilityWidgetProps {
  date: Date | undefined;
  sessions: Session[];
  onDaySelect?: (d: Date) => void;
}

type ViewMode = "day" | "month";

export function AvailabilityWidget({ date, sessions, onDaySelect }: AvailabilityWidgetProps) {
  const [mode, setMode] = useState<ViewMode>("day");
  const [viewDate, setViewDate] = useState<Date>(date ?? new Date());

  const displayDate = date ?? new Date();

  function shiftMonth(dir: 1 | -1) {
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + dir);
      return d;
    });
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-2.5">
        <span className="text-xs font-bold tracking-tight text-black dark:text-white uppercase">
          Availability
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setMode("day")}
            className={`px-2.5 py-0.5 text-[10px] font-bold border transition-colors ${mode === "day" ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:border-zinc-500"}`}
          >
            Day
          </button>
          <button
            onClick={() => setMode("month")}
            className={`px-2.5 py-0.5 text-[10px] font-bold border transition-colors ${mode === "month" ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:border-zinc-500"}`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Sub-header: date label + nav (month view only) */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        {mode === "day" ? (
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {format(displayDate, "EEEE, MMMM d, yyyy")}
          </span>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-none"
              onClick={() => shiftMonth(-1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {format(viewDate, "MMMM yyyy")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-none"
              onClick={() => shiftMonth(1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {mode === "day" ? (
          <DayView date={displayDate} sessions={sessions} />
        ) : (
          <MonthView
            viewDate={viewDate}
            sessions={sessions}
            onDayClick={(d) => {
              onDaySelect?.(d);
              setMode("day");
            }}
          />
        )}
      </div>
    </div>
  );
}
