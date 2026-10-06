"use client";

import { useEffect } from "react";
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
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { Calendar } from "../ui/calendar";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface SessionFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  session: Session | null;
  selectedDate?: Date;
  sessions: Session[];
  onSave?: (session: Session) => void;
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

  // Whenever dialog opens, automatically pre-select selectedDate or session date
  useEffect(() => {
    if (isOpen) {
      const targetDate = session?.date 
        ? new Date(session.date) 
        : (selectedDate ? new Date(selectedDate) : new Date());
      
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newStart = parseInt(values.startTime.replace(':', ''), 10);
    const newEnd = parseInt(values.endTime.replace(':', ''), 10);

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

    const hasOverlap = sessionsOnSameDay.some(existingSession => {
      const existingStart = parseInt(existingSession.startTime.replace(':', ''), 10);
      const existingEnd = parseInt(existingSession.endTime.replace(':', ''), 10);
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      toast({
        variant: "destructive",
        title: "Booking Conflict",
        description: "This session overlaps with an existing booking on the same day.",
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
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-900 rounded-2xl">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {session ? "Edit Session" : "New Session"}
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-zinc-500">
              Schedule and manage academic appointments with precision.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="programName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Program Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Mathematics 101" className="h-9 px-3 text-xs rounded-md bg-white dark:bg-zinc-950 border-zinc-200 focus:border-zinc-900" {...field} />
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
                      <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Teacher Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" className="h-9 px-3 text-xs rounded-md bg-white dark:bg-zinc-950 border-zinc-200 focus:border-zinc-900" {...field} />
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
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "h-9 px-3 rounded-md bg-white dark:bg-zinc-950 border-zinc-200 focus:border-zinc-900 text-left text-xs font-medium",
                              !field.value && "text-zinc-400"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-3.5 w-3.5 text-zinc-500" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-xl overflow-hidden shadow-xl border-zinc-200" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
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
                      <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" className="h-9 px-3 text-xs rounded-md bg-white dark:bg-zinc-950 border-zinc-200 focus:border-zinc-900" {...field} />
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
                      <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">End Time</FormLabel>
                      <FormControl>
                        <Input type="time" className="h-9 px-3 text-xs rounded-md bg-white dark:bg-zinc-950 border-zinc-200 focus:border-zinc-900" {...field} />
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
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Session objectives..." className="p-3 text-xs rounded-md bg-white dark:bg-zinc-950 border-zinc-200 focus:border-zinc-900 min-h-[80px] resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-9 px-4 text-xs font-semibold rounded-md">Cancel</Button>
                <Button type="submit" className="h-9 px-5 text-xs font-semibold rounded-md bg-zinc-900 hover:bg-zinc-800 text-white active:scale-[0.98] transition-all">
                  {session ? "Update Session" : "Create Session"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
