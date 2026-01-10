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
                items: transactions.items,
                userId: transactions.userId,
                userName: users.name, // Join to get user name
            })
            .from(transactions)
            .leftJoin(users, eq(transactions.userId, users.id))
            .where(sql`date(${transactions.timestamp}) = date('now')`)
            .orderBy(desc(transactions.timestamp));

        // Calculate totals and aggregate product sales
        let totalCash = 0;
        let totalAccount = 0;
        const productSalesMap = new Map<string, number>();

        todaysTransactions.forEach((tx) => {
            if (tx.userId) {
                totalAccount += tx.total;
            } else {
                totalCash += tx.total;
            }

            // Parse items and aggregate
            try {
                const items: any[] = JSON.parse(tx.items as string);
                items.forEach((item) => {
                    const currentQty = productSalesMap.get(item.name) || 0;
                    productSalesMap.set(item.name, currentQty + item.quantity);
                });
            } catch (e) {
                console.error(`Failed to parse items for tx ${tx.id}`, e);
            }
        });

        const grandTotal = totalCash + totalAccount;

        // Convert map to array
        const productSales = Array.from(productSalesMap.entries())
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity);

        return NextResponse.json({
            grandTotal,
            totalCash,
            totalAccount,
            productSales,
            transactions: todaysTransactions,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
