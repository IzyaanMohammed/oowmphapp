import { AnnouncementsClient } from "./announcements-client";
import { getBulletins } from "@/app/actions";

export default async function AnnouncementsPage() {
  const initialBulletins = await getBulletins();
  
  const bulletinsWithDates = initialBulletins.map((b: any) => ({
    ...b,
    createdAt: new Date(b.createdAt),
    updatedAt: b.updatedAt ? new Date(b.updatedAt) : undefined,
  }));

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <AnnouncementsClient initialBulletins={bulletinsWithDates} />
      </main>
    </div>
  );
}
