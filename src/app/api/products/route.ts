import { db } from "@/db";
import { products } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
    const allProducts = await db.select().from(products);
    return NextResponse.json(allProducts);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { name, barcode, price } = body;

    const newProduct = await db.insert(products).values({
        name,
        barcode,
        price,
    }).returning();

    return NextResponse.json(newProduct[0]);
}
