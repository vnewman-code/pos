import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Query for transactions created today (server time)
        // using sqlite's date('now') to match the day part of the timestamp
        const todaysTransactions = await db
            .select({
                id: transactions.id,
                total: transactions.total,
                timestamp: transactions.timestamp,
                userId: transactions.userId,
                userName: users.name, // Join to get user name
            })
            .from(transactions)
            .leftJoin(users, eq(transactions.userId, users.id))
            .where(sql`date(${transactions.timestamp}) = date('now')`)
            .orderBy(desc(transactions.timestamp));

        // Calculate totals in JS
        let totalCash = 0;
        let totalAccount = 0;

        todaysTransactions.forEach((tx) => {
            if (tx.userId) {
                totalAccount += tx.total;
            } else {
                totalCash += tx.total;
            }
        });

        const grandTotal = totalCash + totalAccount;

        return NextResponse.json({
            grandTotal,
            totalCash,
            totalAccount,
            transactions: todaysTransactions,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
