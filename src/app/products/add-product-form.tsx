"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarcodeScanner } from "@/components/barcode-scanner";

export function AddProductForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [barcode, setBarcode] = useState("");

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            barcode: formData.get("barcode"),
            price: Number(formData.get("price")) * 100, // convert to cents
            stock: Number(formData.get("stock")),
        };

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || res.statusText);
            }

            setLoading(false);
            setBarcode("");
            router.refresh();
            (e.target as HTMLFormElement).reset();
            alert("Product added successfully!");
        } catch (error: any) {
            console.error(error);
            alert(`Failed to add product: ${error.message}`);
            setLoading(false);
        }
    }

    return (
        <div className="space-y-4">
            {scanning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="bg-background p-4 rounded-lg w-full max-w-md m-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Scan Barcode</h3>
                            <button
                                onClick={() => setScanning(false)}
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Close
                            </button>
                        </div>
                        <BarcodeScanner
                            onScanSuccess={(code) => {
                                setBarcode(code);
                                setScanning(false);
                            }}
                        />
                    </div>
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="name">Name</label>
                    <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        id="name"
                        name="name"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="barcode">Barcode</label>
                    <div className="flex gap-2">
                        <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            id="barcode"
                            name="barcode"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setScanning(true)}
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                        >
                            Scan
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="price">Price (R)</label>
                        <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="stock">Initial Stock</label>
                        <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            id="stock"
                            name="stock"
                            type="number"
                            defaultValue="0"
                            required
                        />
                    </div>
                </div>

                <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-black text-white hover:bg-black/90 h-10 px-4 py-2 w-full"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add Product"}
                </button>
            </form>
        </div>
    );
}
