import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-4 text-center">
            <h2 className="mb-2 text-2xl font-bold">Page Not Found</h2>
            <p className="mb-6 text-muted-foreground">Could not find requested resource</p>
            <Link
                href="/"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Return Home
            </Link>
        </div>
    );
}
