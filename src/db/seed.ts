import { db } from "./index";
import { products, users } from "./schema";

async function main() {
    console.log("Seeding database...");

    // Seed Users
    await db.insert(users).values([
        { name: "John Doe", balance: 5000, allowance: 10000 },
        { name: "Jane Smith", balance: 2500, allowance: 5000 },
        { name: "Alice Johnson", balance: 0, allowance: 2000 },
    ]);

    // Seed Products
    await db.insert(products).values([
        { name: "Soda", barcode: "123456789", price: 150 },
        { name: "Chips", barcode: "987654321", price: 200 },
        { name: "Candy Bar", barcode: "456123789", price: 100 },
        { name: "Water", barcode: "111222333", price: 100 },
    ]);

    console.log("Seeding complete!");
}

main().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
