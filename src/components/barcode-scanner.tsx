"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanFailure?: (error: any) => void;
}

export function BarcodeScanner({ onScanSuccess, onScanFailure }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Initialize the scanner
        // We use a small timeout to ensure the DOM element is ready
        const timeoutId = setTimeout(() => {
            if (!scannerRef.current) {
                const scanner = new Html5QrcodeScanner(
                    "reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    /* verbose= */ false
                );

                scanner.render(
                    (decodedText) => {
                        // Clear the scanner after successful scan to stop the camera
                        scanner.clear().catch(console.error);
                        onScanSuccess(decodedText);
                    },
                    (error) => {
                        if (onScanFailure) onScanFailure(error);
                    }
                );
                scannerRef.current = scanner;
            }
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner during cleanup", error);
                });
            }
        };
    }, [onScanSuccess, onScanFailure]);

    return (
        <div className="w-full max-w-sm mx-auto">
            <div id="reader" className="w-full"></div>
        </div>
    );
}
