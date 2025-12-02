import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ barcode: string }> }
) {
    const { barcode } = await params;
    const product = await db
        .select()
        .from(products)
        .where(eq(products.barcode, barcode))
        .limit(1);

    if (product.length === 0) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product[0]);
}
