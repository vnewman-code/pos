import { db } from "@/db";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ProductList } from "./product-list";
import { AddProductForm } from "./add-product-form";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    let allProducts = [];
    try {
        allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
    } catch (e: any) {
        return (
            <div className="p-10 text-red-500 font-bold">
                <h1>Error Loading Products</h1>
                <pre>{e.message}</pre>
                <div className="mt-4 text-sm text-gray-500">
                    <p>Did you remember to run the migration?</p>
                    <code className="bg-gray-100 p-1 rounded">npx drizzle-kit push</code>
                </div>
            </div>
        );
    }

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
