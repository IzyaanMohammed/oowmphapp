"use client";

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

export function SessionForm({ isOpen, setIsOpen, session, sessions, onSave }: SessionFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      programName: session?.programName || "",
      teacherName: session?.teacherName || "",
      date: session?.date ? new Date(session.date) : new Date(),
      startTime: session?.startTime || "",
      endTime: session?.endTime || "",
      notes: session?.notes || "",
    },
  });

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
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl bg-card/95 backdrop-blur-xl">
        <div className="bg-primary/10 px-8 py-6 border-b border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tight">
              {session ? "Edit Session" : "New Session"}
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-primary/70">
              Schedule and manage academic appointments with precision.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="programName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Program Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Mathematics 101" className="h-12 px-4 rounded-xl bg-muted/30 border-2 border-transparent focus:border-primary/50 focus:bg-background transition-all shadow-inner" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teacherName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Teacher Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" className="h-12 px-4 rounded-xl bg-muted/30 border-2 border-transparent focus:border-primary/50 focus:bg-background transition-all shadow-inner" {...field} />
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
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "h-12 px-4 rounded-xl bg-muted/30 border-2 border-transparent focus:border-primary/50 focus:bg-background transition-all text-left font-medium shadow-inner",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 text-primary" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl border-none" align="start">
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

              <div className="grid grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" className="h-12 px-4 rounded-xl bg-muted/30 border-2 border-transparent focus:border-primary/50 focus:bg-background transition-all shadow-inner" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">End Time</FormLabel>
                      <FormControl>
                        <Input type="time" className="h-12 px-4 rounded-xl bg-muted/30 border-2 border-transparent focus:border-primary/50 focus:bg-background transition-all shadow-inner" {...field} />
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
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Session objectives..." className="p-4 rounded-xl bg-muted/30 border-2 border-transparent focus:border-primary/50 focus:bg-background transition-all min-h-[100px] resize-none shadow-inner" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="h-12 px-6 rounded-xl font-bold">Cancel</Button>
                  <Button type="submit" className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
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
