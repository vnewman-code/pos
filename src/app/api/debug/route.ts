import { db } from "@/db";
import { users, products } from "@/db/schema";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Check DB Connection by counting users
        const userCount = await db.select().from(users).limit(1);
        const productCount = await db.select().from(products).limit(1);

        return NextResponse.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            database: {
                connected: true,
                userPeek: userCount.length >= 0 ? "success" : "failed",
                productPeek: productCount.length >= 0 ? "success" : "failed",
            },
            env: {
                nodeEnv: process.env.NODE_ENV,
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                status: "error",
                message: error.message,
                stack: error.stack,
            },
            { status: 500 }
        );
    }
}
