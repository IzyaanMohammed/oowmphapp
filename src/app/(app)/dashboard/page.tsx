'use client';
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { useCollection, useFirestore } from "@/firebase";
import type { Session, User } from "@/lib/types";
import { collection, query } from "firebase/firestore";

export default function DashboardPage() {
  const firestore = useFirestore();

  const usersQuery = query(collection(firestore, 'users'));
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  const sessionsQuery = query(collection(firestore, 'sessionBookings'));
  const { data: sessions, isLoading: sessionsLoading } = useCollection<Session>(sessionsQuery);

  if (usersLoading || sessionsLoading) {
    return <div>Loading...</div>
  }

  const sessionsWithDateObjects = sessions?.map(s => ({...s, date: new Date(s.date)})) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Session Dashboard</h2>
        <p className="text-muted-foreground">
          Manage and view all your session bookings in one place.
        </p>
      </div>
      <DashboardClient sessions={sessionsWithDateObjects} users={users || []} />
    </div>
  );
}
