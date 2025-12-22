import { db } from "@/db";
import { users } from "@/db/schema";
import { POSInterface } from "./pos-interface";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const allUsers = await db.select().from(users);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
        </div>
        <POSInterface users={allUsers} />
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-8 text-center text-red-600">
        <h1 className="text-2xl font-bold mb-4">Error Loading POS</h1>
        <p className="font-mono bg-red-50 p-4 rounded text-left overflow-auto">
          {error.message}
        </p>
      </div>
    );
  }
}
