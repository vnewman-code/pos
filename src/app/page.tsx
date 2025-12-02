import { db } from "@/db";
import { users } from "@/db/schema";
import { POSInterface } from "./pos-interface";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allUsers = await db.select().from(users);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
      </div>
      <POSInterface users={allUsers} />
    </div>
  );
}
