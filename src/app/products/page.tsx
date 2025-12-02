import { db } from "@/db";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ProductList } from "./product-list";
import { AddProductForm } from "./add-product-form";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <h3 className="font-semibold leading-none tracking-tight">Add New Product</h3>
                            <p className="text-sm text-muted-foreground">Add a new product to inventory.</p>
                        </div>
                        <div className="p-6 pt-0">
                            <AddProductForm />
                        </div>
                    </div>
                </div>
                <div>
                    <ProductList initialProducts={allProducts} />
                </div>
            </div>
        </div>
    );
}
