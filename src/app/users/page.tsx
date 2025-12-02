import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { UserList } from "./user-list";
import { AddUserForm } from "./add-user-form";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <h3 className="font-semibold leading-none tracking-tight">Add New User</h3>
                            <p className="text-sm text-muted-foreground">Create a new user account.</p>
                        </div>
                        <div className="p-6 pt-0">
                            <AddUserForm />
                        </div>
                    </div>
                </div>
                <div>
                    <UserList initialUsers={allUsers} />
                </div>
            </div>
        </div>
    );
}
