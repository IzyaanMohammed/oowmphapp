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
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Fetch all sessions initially, only when authenticated
  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore || authUserLoading || !authUser) return null;
    return query(collection(firestore, 'sessionBookings'));
  }, [firestore, authUser, authUserLoading]);
  const { data: sessions, isLoading: sessionsLoading } = useCollection<Session>(sessionsQuery);

  // When sessions are loaded, get the unique teacher IDs
  const teacherIds = useMemoFirebase(() => {
    if (!sessions) return [];
    return [...new Set(sessions.map(s => s.teacherId))];
  }, [sessions]);

  // Fetch users based on the teacher IDs from the sessions
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || teacherIds.length === 0) return null;
    // Firestore 'in' query is limited to 30 items. 
    // For this app, we'll take the first 30. For a larger scale app, pagination would be needed.
    return query(collection(firestore, "users"), where("id", "in", teacherIds.slice(0, 30)));
  }, [firestore, teacherIds]);

  const { data: fetchedUsers, isLoading: fetchedUsersLoading } = useCollection<User>(usersQuery);

  useEffect(() => {
    if (!fetchedUsersLoading) {
      setUsers(fetchedUsers || []);
      setUsersLoading(false);
    }
  }, [fetchedUsers, fetchedUsersLoading]);


  if (authUserLoading || (sessionsLoading && sessions === null) || (usersLoading && sessions !== null)) {
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

  const allUsers = [...users];
  if (authUser) {
    const currentUserInList = users.find(u => u.id === authUser.uid);
    if (!currentUserInList && authUser.email) {
       allUsers.push({
         id: authUser.uid,
         email: authUser.email,
         name: authUser.displayName || authUser.email,
         role: 'unverified', // Default role, might need adjustment
         avatarId: 'user-1'
       });
    }
  }


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Session Dashboard</h2>
        <p className="text-muted-foreground">
          Manage and view all your session bookings in one place.
        </p>
      </div>
      <DashboardClient sessions={sessionsWithDateObjects} users={allUsers} />
    </div>
  );
}
