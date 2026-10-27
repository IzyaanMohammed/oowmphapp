"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { Session } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, AlertTriangle, Mail, Copy, Check, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { Calendar } from "../ui/calendar";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { getSessionContactEmail } from "@/lib/mock-data";

interface SessionFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  session: Session | null;
  selectedDate?: Date;
  sessions: Session[];
  onSave?: (session: Session) => void;
}

interface ConflictData {
  existingSession: Session;
  mockEmail: string;
  requestedTime: string;
  requestedDate: Date;
}

const formSchema = z.object({
  programName: z.string().min(2, "Program name is too short"),
  teacherName: z.string().min(2, "Teacher name is too short"),
  date: z.date({ required_error: "A date is required." }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  notes: z.string().optional(),
});

export function SessionForm({ isOpen, setIsOpen, session, selectedDate, sessions, onSave }: SessionFormProps) {
  const { toast } = useToast();
  const [conflictData, setConflictData] = useState<ConflictData | null>(null);
  const [showConflictPopup, setShowConflictPopup] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      programName: session?.programName || "",
      teacherName: session?.teacherName || "",
      date: session?.date ? new Date(session.date) : (selectedDate ? new Date(selectedDate) : new Date()),
      startTime: session?.startTime || "",
      endTime: session?.endTime || "",
      notes: session?.notes || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      const targetDate = session?.date 
        ? new Date(session.date) 
        : (selectedDate ? new Date(selectedDate) : new Date());
      
      setConflictData(null);
      setShowConflictPopup(false);
      setCopiedEmail(false);

      form.reset({
        programName: session?.programName || "",
        teacherName: session?.teacherName || "",
        date: targetDate,
        startTime: session?.startTime || "",
        endTime: session?.endTime || "",
        notes: session?.notes || "",
      });
    }
  }, [isOpen, session, selectedDate, form]);

  const handleCopyEmail = (email: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
      toast({
        title: "Email Copied",
        description: `${email} has been copied to your clipboard.`,
      });
    }
  };

  const toMinutes = (timeStr: string) => {
    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newStart = toMinutes(values.startTime);
    const newEnd = toMinutes(values.endTime);

    if (newStart >= newEnd) {
      form.setError("endTime", {
        type: "manual",
        message: "End time must be after start time.",
      });
      return;
    }

    const sessionsOnSameDay = sessions.filter(s => 
      isSameDay(new Date(s.date), values.date) && s.id !== session?.id
    );

    const conflictingSession = sessionsOnSameDay.find(existingSession => {
      const existingStart = toMinutes(existingSession.startTime);
      const existingEnd = toMinutes(existingSession.endTime);
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (conflictingSession) {
      const mockEmail = getSessionContactEmail(conflictingSession);
      setConflictData({
        existingSession: conflictingSession,
        mockEmail,
        requestedTime: `${values.startTime} - ${values.endTime}`,
        requestedDate: values.date,
      });
      setShowConflictPopup(true);

      toast({
        variant: "destructive",
        title: "Booking Conflict",
        description: `Slot already reserved by ${conflictingSession.teacherName}. Contact details shown.`,
      });
      return;
    }

    const sessionData: Session = {
      ...values,
      id: session?.id || uuidv4(),
      date: values.date,
    };

    if (onSave) onSave(sessionData);

    toast({
      title: session ? "Session Updated" : "Session Created",
      description: `The session "${values.programName}" has been saved successfully.`,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="fixed left-1/2 top-4 sm:top-10 -translate-x-1/2 translate-y-0 w-[95vw] sm:w-full sm:max-w-[490px] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-5rem)] flex flex-col p-0 overflow-hidden border border-zinc-300 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-900 rounded-none gap-0 z-50">
        {showConflictPopup && conflictData && (
          <div className="absolute inset-0 z-50 bg-white dark:bg-zinc-900 flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="shrink-0 bg-zinc-100 dark:bg-zinc-900 px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-none bg-red-600 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold tracking-tight text-black dark:text-white">
                    Time Slot Conflict
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-red-600 dark:text-red-400">
                    Booking cannot be completed for this timing
                  </DialogDescription>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Existing Booking Information
                </span>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block">Program</span>
                    <span className="font-semibold text-black dark:text-white truncate block">
                      {conflictData.existingSession.programName}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block">Booked By</span>
                    <span className="font-semibold text-black dark:text-white truncate block">
                      {conflictData.existingSession.teacherName}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block">Date</span>
                    <span className="font-semibold text-black dark:text-white block">
                      {format(new Date(conflictData.existingSession.date), "PPP")}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block">Reserved Slot</span>
                    <span className="font-mono font-bold text-red-600 dark:text-red-400 block">
                      {conflictData.existingSession.startTime} – {conflictData.existingSession.endTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  The Multi-Purpose Hall is already reserved for this duration. If you need to request a timing replacement, swap slots, or coordinate a change, you can contact the person who booked this session:
                </p>

                <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-none bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                          Organizer Email
                        </span>
                        <span className="text-xs font-mono font-bold text-black dark:text-white truncate block select-all">
                          {conflictData.mockEmail}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end pt-1 sm:pt-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyEmail(conflictData.mockEmail)}
                        className="h-8 px-2.5 text-xs rounded-none border-zinc-300 hover:bg-white dark:hover:bg-zinc-700"
                      >
                        {copiedEmail ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1 text-green-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-1" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                      <a
                        href={`mailto:${conflictData.mockEmail}?subject=${encodeURIComponent(
                          `MPH Reservation Request - ${conflictData.existingSession.programName} (${format(
                            new Date(conflictData.existingSession.date),
                            "PPP"
                          )})`
                        )}&body=${encodeURIComponent(
                          `Hi ${conflictData.existingSession.teacherName},\n\nI was looking to book the Multi-Purpose Hall on ${format(
                            new Date(conflictData.existingSession.date),
                            "PPP"
                          )} during your reserved timing (${conflictData.existingSession.startTime} - ${
                            conflictData.existingSession.endTime
                          }).\n\nWould it be possible to discuss replacing, swapping, or adjusting the schedule?\n\nThank you!`
                        )}`}
                        className="inline-flex items-center justify-center h-8 px-3 text-xs font-bold rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                        Email
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 bg-zinc-50 dark:bg-zinc-900 px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowConflictPopup(false);
                  setIsOpen(false);
                }}
                className="h-9 px-4 text-xs font-semibold rounded-none border-zinc-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => setShowConflictPopup(false)}
                className="h-9 px-5 text-xs font-bold rounded-none bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 border border-black"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Adjust Timing
              </Button>
            </div>
          </div>
        )}

        <div className="shrink-0 bg-zinc-100 dark:bg-zinc-900 px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-black dark:text-white">
              {session ? "Edit Session" : "New Session"}
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-zinc-500">
              Schedule and manage academic appointments.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {conflictData && !showConflictPopup && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-900 text-xs">
                  <div className="font-bold text-red-700 dark:text-red-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                      Conflict: {conflictData.existingSession.teacherName} ({conflictData.existingSession.startTime} – {conflictData.existingSession.endTime})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowConflictPopup(true)}
                      className="text-[11px] font-bold text-red-700 dark:text-red-300 underline hover:text-black dark:hover:text-white"
                    >
                      View Contact
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                    Contact <span className="font-mono font-bold text-black dark:text-white">{conflictData.mockEmail}</span> to request a swap or change your booking hours.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="programName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-black dark:text-zinc-300">Program Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Mathematics 101" className="h-9 px-3 text-xs rounded-none bg-white dark:bg-black border-zinc-300 focus:border-black" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teacherName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-black dark:text-zinc-300">Teacher Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" className="h-9 px-3 text-xs rounded-none bg-white dark:bg-black border-zinc-300 focus:border-black" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-black dark:text-zinc-300">Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "h-9 px-3 rounded-none bg-white dark:bg-black border-zinc-300 focus:border-black text-left text-xs font-medium",
                              !field.value && "text-zinc-400"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-3.5 w-3.5 text-black" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-none overflow-hidden shadow-none border-zinc-300" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="rounded-none"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-black dark:text-zinc-300">Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" className="h-9 px-3 text-xs rounded-none bg-white dark:bg-black border-zinc-300 focus:border-black" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-black dark:text-zinc-300">End Time</FormLabel>
                      <FormControl>
                        <Input type="time" className="h-9 px-3 text-xs rounded-none bg-white dark:bg-black border-zinc-300 focus:border-black" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-black dark:text-zinc-300">Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Session objectives..." className="p-3 text-xs rounded-none bg-white dark:bg-black border-zinc-300 focus:border-black min-h-[70px] resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="shrink-0 bg-zinc-50 dark:bg-zinc-900 px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-9 px-4 text-xs font-semibold rounded-none border-zinc-300">Cancel</Button>
              <Button type="submit" className="h-9 px-5 text-xs font-bold rounded-none bg-black hover:bg-zinc-800 text-white border border-black">
                {session ? "Update Session" : "Create Session"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
