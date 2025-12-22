"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-4 text-center">
            <h2 className="mb-4 text-2xl font-bold text-red-600">Something went wrong!</h2>
            <div className="mb-6 max-w-md rounded-md bg-zinc-100 p-4 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                {error.message || "An unexpected error occurred"}
            </div>
            <button
                onClick={() => reset()}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Try again
            </button>
        </div>
    );
}
