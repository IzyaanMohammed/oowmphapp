import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getSessions } from "@/app/actions";

export default async function DashboardPage() {
  const initialSessions = await getSessions();
  
  // Pass as plain objects
  const serializedSessions = JSON.parse(JSON.stringify(initialSessions));

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <main className="p-0">
         <DashboardClient initialSessions={serializedSessions} />
      </main>
    </div>
  );
}
