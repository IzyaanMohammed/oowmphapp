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
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { v4 as uuidv4 } from 'uuid';
import type { User as AppUser } from "@/lib/types";
import { useEffect } from "react";

interface SessionFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  session: Session | null;
  sessions: Session[];
}

const formSchema = z.object({
  programName: z.string().min(2, "Program name is too short"),
  teacherName: z.string().min(2, "Teacher name is too short"),
  date: z.date({ required_error: "A date is required." }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  notes: z.string().optional(),
});

export function SessionForm({ isOpen, setIsOpen, session, sessions }: SessionFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userData } = useDoc<AppUser>(userDocRef);

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

  useEffect(() => {
    if (userData && !session) {
      form.setValue('teacherName', userData.displayName);
    }
  }, [userData, form, session]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to save a session.",
        });
        return;
    }
    
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


    const sessionData = {
      ...values,
      date: values.date.toISOString(),
      teacherId: user.uid,
    };

    const id = session?.id || uuidv4();
    const sessionWithId = { ...sessionData, id };
    const sessionRef = doc(firestore, 'sessionBookings', id);
    
    if (session) {
      setDocumentNonBlocking(sessionRef, sessionData, { merge: true });
    } else {
      setDocumentNonBlocking(sessionRef, sessionWithId, {});
    }

    toast({
        title: session ? "Session Updated" : "Session Created",
        description: `The session "${values.programName}" has been saved successfully.`,
    });
    setIsOpen(false);
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{session ? "Edit Session" : "Add New Session"}</DialogTitle>
          <DialogDescription>
            Fill in the details below to schedule a new session. All fields are required.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="programName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Mathematics 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teacherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter teacher's name" {...field} readOnly={!!userData} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
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
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
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
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes for the session..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit">Save Session</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
