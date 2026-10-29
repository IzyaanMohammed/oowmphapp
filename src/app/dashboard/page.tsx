import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getSessions, getBookers } from "@/app/actions";

export default async function DashboardPage() {
  const [initialSessions, extraBookers] = await Promise.all([getSessions(), getBookers()]);
  
  // Pass as plain objects
  const serializedSessions = JSON.parse(JSON.stringify(initialSessions));

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <main className="p-0">
         <DashboardClient initialSessions={serializedSessions} extraBookers={extraBookers} />
      </main>
    </div>
  );
}
