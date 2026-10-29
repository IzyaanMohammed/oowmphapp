import { getBookers } from "@/app/actions";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  const bookers = await getBookers();

  return <AdminClient initialBookers={bookers} />;
}
