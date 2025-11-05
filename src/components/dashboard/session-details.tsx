'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import type { Session } from '@/lib/types';
import { format } from 'date-fns';

interface SessionDetailsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  session: Session;
}

export function SessionDetailsDialog({
  isOpen,
  setIsOpen,
  session,
}: SessionDetailsDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{session.programName}</AlertDialogTitle>
          <AlertDialogDescription>
            Session Details
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Teacher:</span>
                <span className="font-medium">{session.teacherName}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{format(session.date, 'PPP')}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <Badge variant="outline">{`${session.startTime} - ${session.endTime}`}</Badge>
            </div>
            {session.notes && (
                <div>
                    <p className="text-muted-foreground">Notes:</p>
                    <p className="mt-1 rounded-md border bg-secondary/50 p-3">{session.notes}</p>
                </div>
            )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
