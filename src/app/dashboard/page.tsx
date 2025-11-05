'use client';
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { Session, User } from "@/lib/types";
import { collection, query, where, Timestamp } from "firebase/firestore";
import { useUser as useAuthUser } from "@/firebase";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user: authUser, isUserLoading: authUserLoading } = useAuthUser();

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return query(collection(firestore, 'sessionBookings'));
  }, [firestore, authUser]);

  const { data: sessions, isLoading: sessionsLoading } = useCollection<Session>(sessionsQuery);

  if (authUserLoading || (sessionsLoading && sessions === null)) {
    return (
       <div className="flex items-center justify-center h-full">
        <div className="text-lg font-semibold">Loading Dashboard...</div>
      </div>
    );
  }

  const sessionsWithDateObjects = sessions?.map(s => {
    // Firestore timestamps can be seconds/nanoseconds objects or ISO strings
    const date = s.date instanceof Timestamp ? s.date.toDate() : new Date(s.date);
    return {...s, date };
  }) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Session Dashboard</h2>
        <p className="text-muted-foreground">
          Manage and view all your session bookings in one place.
        </p>
      </div>
      <DashboardClient sessions={sessionsWithDateObjects} />
    </div>
  );
}
