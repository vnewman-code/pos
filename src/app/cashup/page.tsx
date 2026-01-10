"use client";

import { useEffect, useState } from "react";
import { Printer, RefreshCw } from "lucide-react";

type DailyReport = {
    grandTotal: number;
    totalCash: number;
    totalAccount: number;
    productSales: { name: string; quantity: number }[];
    transactions: {
        id: number;
        total: number;
        timestamp: string;
        userId: number | null;
        userName: string | null;
    }[];
};

export default function CashupPage() {
    const [report, setReport] = useState<DailyReport | null>(null);
    const [loading, setLoading] = useState(true);

    async function fetchReport() {
        setLoading(true);
        try {
            const res = await fetch("/api/reports/daily");
            if (!res.ok) throw new Error("Failed to fetch report");
            const data = await res.json();
            setReport(data);
        } catch (error) {
            console.error(error);
            alert("Error loading report");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchReport();
    }, []);

    if (loading) {
        return <div className="p-8">Loading report...</div>;
    }

    if (!report) {
        return <div className="p-8">Error loading report.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between print:hidden">
                <h1 className="text-3xl font-bold tracking-tight">Daily Cashup</h1>
                <div className="flex gap-2">
                    <button
                        onClick={fetchReport}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-black text-white hover:bg-black/90 h-10 px-4 py-2"
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        Print Report
                    </button>
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block text-center mb-8">
                <h1 className="text-2xl font-bold">Daily Sales Report</h1>
                <p>{new Date().toLocaleDateString()}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium text-muted-foreground">Expected Cash</div>
                    <div className="text-2xl font-bold text-green-600">
                        R{(report.totalCash / 100).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Cash in Till</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium text-muted-foreground">Account Sales</div>
                    <div className="text-2xl font-bold text-blue-600">
                        R{(report.totalAccount / 100).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Store Credit</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium text-muted-foreground">Grand Total</div>
                    <div className="text-2xl font-bold">
                        R{(report.grandTotal / 100).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Total Venue Revenue</p>
                </div>
            </div>

            {/* Product Sales Section */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <h3 className="font-semibold mb-4">Products Sold</h3>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Product</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Quantity Sold</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {report.productSales.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="p-4 text-center text-muted-foreground">
                                            No products sold today.
                                        </td>
                                    </tr>
                                ) : (
                                    report.productSales.map((item, idx) => (
                                        <tr key={idx} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">{item.name}</td>
                                            <td className="p-4 align-middle text-right">{item.quantity}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <h3 className="font-semibold mb-4">Today's Transactions</h3>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Time</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Customer</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {report.transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                            No transactions found for today.
                                        </td>
                                    </tr>
                                ) : (
                                    report.transactions.map((tx) => (
                                        <tr key={tx.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">
                                                {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tx.userId
                                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                    }`}>
                                                    {tx.userId ? "Account" : "Cash"}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle">
                                                {tx.userName || "-"}
                                            </td>
                                            <td className="p-4 align-middle text-right font-medium">
                                                R{(tx.total / 100).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
