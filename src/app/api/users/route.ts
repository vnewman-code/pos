import { db } from "@/db";
import { users } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
    const allUsers = await db.select().from(users);
    return NextResponse.json(allUsers);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { name, balance, allowance } = body;

    const newUser = await db.insert(users).values({
        name,
        balance: balance || 0,
        allowance: allowance || 0,
    }).returning();

    return NextResponse.json(newUser[0]);
}
