"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ShoppingCart, Trash2, CreditCard, Banknote, Scan, Printer, X } from "lucide-react";

type Product = {
    id: number;
    name: string;
    barcode: string;
    price: number;
};

type User = {
    id: number;
    name: string;
    balance: number;
    allowance: number;
};

type CartItem = Product & { quantity: number };

type Transaction = {
    id: number;
    total: number;
    items: string;
    timestamp: string;
    userId: number | null;
};

export function POSInterface({ users }: { users: User[] }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [scanning, setScanning] = useState(false);
    const [manualBarcode, setManualBarcode] = useState("");
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Cash Modal State
    const [cashModalOpen, setCashModalOpen] = useState(false);
    const [tenderedAmount, setTenderedAmount] = useState("");
    const [change, setChange] = useState<number | null>(null);

    // Receipt Modal State
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
    const [lastTransactionItems, setLastTransactionItems] = useState<CartItem[]>([]);

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    useEffect(() => {
        if (scanning) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
            );
            scanner.render(onScanSuccess, onScanFailure);
            scannerRef.current = scanner;
        } else {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, [scanning]);

    async function onScanSuccess(decodedText: string, decodedResult: any) {
        if (loading) return;
        if (scannerRef.current) {
            scannerRef.current.pause();
        }

        await addToCart(decodedText);

        setTimeout(() => {
            if (scannerRef.current) {
                scannerRef.current.resume();
            }
        }, 1000);
    }

    function onScanFailure(error: any) {
        // handle scan failure
    }

    async function addToCart(barcode: string) {
        setLoading(true);
        try {
            const res = await fetch(`/api/products/${barcode}`);
            if (!res.ok) {
                alert("Product not found");
                setLoading(false);
                return;
            }
            const product = await res.json();
            setCart((prev) => {
                const existing = prev.find((p) => p.id === product.id);
                if (existing) {
                    return prev.map((p) =>
                        p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
                    );
                }
                return [...prev, { ...product, quantity: 1 }];
            });
        } catch (err) {
            console.error(err);
            alert("Error fetching product");
        } finally {
            setLoading(false);
        }
    }

    function removeFromCart(id: number) {
        setCart((prev) => prev.filter((item) => item.id !== id));
    }

    function initiateCashPayment() {
        setCashModalOpen(true);
        setTenderedAmount("");
        setChange(null);
    }

    async function processTransaction(method: "cash" | "account") {
        setLoading(true);
        try {
            const res = await fetch("/api/transactions", {
                method: "POST",
                body: JSON.stringify({
                    userId: method === "account" ? Number(selectedUser) : null,
                    total,
                    items: cart,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Transaction failed");
            }

            const transaction = await res.json();
            setLastTransaction(transaction);
            setLastTransactionItems([...cart]);
            setReceiptOpen(true);
            setCart([]);
            setSelectedUser("");
            setCashModalOpen(false);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleCheckout(method: "cash" | "account") {
        if (cart.length === 0) return;

        if (method === "cash") {
            initiateCashPayment();
            return;
        }

        if (method === "account") {
            if (!selectedUser) {
                alert("Please select a user for account payment");
                return;
            }
            await processTransaction("account");
        }
    }

    function calculateChange() {
        const tendered = Number(tenderedAmount) * 100; // convert to cents
        if (isNaN(tendered)) return;
        setChange(tendered - total);
    }

    function handlePrintReceipt() {
        window.print();
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6 print:hidden">
                {/* Scanner Section */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Scanner</h3>
                            <button
                                onClick={() => setScanning(!scanning)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                            >
                                <Scan className="mr-2 h-4 w-4" />
                                {scanning ? "Stop Camera" : "Start Camera"}
                            </button>
                        </div>

                        {scanning && <div id="reader" className="w-full"></div>}

                        <div className="flex gap-2 mt-4">
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Enter barcode manually"
                                value={manualBarcode}
                                onChange={(e) => setManualBarcode(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        addToCart(manualBarcode);
                                        setManualBarcode("");
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    addToCart(manualBarcode);
                                    setManualBarcode("");
                                }}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 h-10 px-4 py-2"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* User Selection */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-6">
                        <h3 className="font-semibold mb-4">Customer Account</h3>
                        <select
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            <option value="">Select User (Optional for Cash)</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name} (Bal: R{(u.balance / 100).toFixed(2)})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Cart Section */}
            <div className="space-y-6 print:hidden">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full flex flex-col">
                    <div className="flex flex-col space-y-1.5 p-6 border-b">
                        <h3 className="font-semibold leading-none tracking-tight flex items-center">
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Current Cart
                        </h3>
                    </div>
                    <div className="p-6 flex-1 overflow-auto">
                        {cart.length === 0 ? (
                            <div className="text-center text-muted-foreground py-10">
                                Cart is empty
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                R{(item.price / 100).toFixed(2)} x {item.quantity}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-medium">
                                                R{((item.price * item.quantity) / 100).toFixed(2)}
                                            </p>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-6 bg-muted/50 border-t">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-lg font-medium">Total</span>
                            <span className="text-2xl font-bold">R{(total / 100).toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleCheckout("cash")}
                                disabled={cart.length === 0 || loading}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-12 px-4 py-2 w-full"
                            >
                                <Banknote className="mr-2 h-4 w-4" />
                                Cash Pay
                            </button>
                            <button
                                onClick={() => handleCheckout("account")}
                                disabled={cart.length === 0 || loading || !selectedUser}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-12 px-4 py-2 w-full"
                            >
                                <CreditCard className="mr-2 h-4 w-4" />
                                Account Pay
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cash Modal */}
            {cashModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Cash Payment</h3>
                            <button onClick={() => setCashModalOpen(false)}>
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-lg font-medium">
                                <span>Total Due:</span>
                                <span>R{(total / 100).toFixed(2)}</span>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount Tendered (R)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={tenderedAmount}
                                    onChange={(e) => {
                                        setTenderedAmount(e.target.value);
                                        const val = Number(e.target.value) * 100;
                                        setChange(val - total);
                                    }}
                                />
                            </div>
                            {change !== null && (
                                <div className={`flex justify-between text-lg font-medium ${change < 0 ? "text-red-500" : "text-green-600"}`}>
                                    <span>Change:</span>
                                    <span>R{(change / 100).toFixed(2)}</span>
                                </div>
                            )}
                            <button
                                onClick={() => processTransaction("cash")}
                                disabled={loading || (Number(tenderedAmount) * 100) < total}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-12 px-4 py-2 w-full"
                            >
                                {loading ? "Processing..." : "Confirm Payment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {receiptOpen && lastTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:bg-white print:static print:block">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900 print:shadow-none print:w-full print:max-w-none">
                        <div className="flex items-center justify-between mb-4 print:hidden">
                            <h3 className="text-lg font-semibold">Receipt</h3>
                            <button onClick={() => setReceiptOpen(false)}>
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4 text-center print:text-left">
                            <div className="border-b pb-4">
                                <h2 className="text-2xl font-bold">Melkstroom Tuckshop</h2>
                                <p className="text-sm text-muted-foreground">Melkstroom, Upington</p>
                                <p className="text-sm text-muted-foreground">{new Date().toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">Tx ID: #{lastTransaction.id}</p>
                            </div>
                            <div className="space-y-2">
                                {lastTransactionItems.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span>{item.name} x{item.quantity}</span>
                                        <span>R{((item.price * item.quantity) / 100).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>R{(lastTransaction.total / 100).toFixed(2)}</span>
                                </div>
                                {lastTransaction.userId ? (
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Payment Method</span>
                                        <span>Account</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Payment Method</span>
                                            <span>Cash</span>
                                        </div>
                                        {tenderedAmount && (
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <span>Tendered</span>
                                                <span>R{Number(tenderedAmount).toFixed(2)}</span>
                                            </div>
                                        )}
                                        {change !== null && (
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <span>Change</span>
                                                <span>R{(change / 100).toFixed(2)}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="pt-6 print:hidden">
                                <button
                                    onClick={handlePrintReceipt}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 h-10 px-4 py-2 w-full"
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
