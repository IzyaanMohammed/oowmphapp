import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { MOCK_SESSIONS, MOCK_USERS } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Session Dashboard</h2>
        <p className="text-muted-foreground">
          Manage and view all your session bookings in one place.
        </p>
      </div>
      <DashboardClient sessions={MOCK_SESSIONS} users={MOCK_USERS} />
    </div>
  );
}
