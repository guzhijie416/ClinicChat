"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QRCode from "react-qr-code";
import { Skeleton } from "../ui/skeleton";

export function QRCodeCard() {
    const [chatUrl, setChatUrl] = useState<string | null>(null);

    useEffect(() => {
        // This ensures that window.location is only accessed on the client-side
        if (typeof window !== "undefined") {
            const url = new URL("/chat", window.location.origin);
            setChatUrl(url.href);
        }
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Client QR Code</CardTitle>
                <CardDescription>
                    Clients can scan this code to start a chat with the AI assistant.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6">
                <div className="bg-white p-4 rounded-lg border">
                    {chatUrl ? (
                        <QRCode
                            value={chatUrl}
                            size={180}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    ) : (
                        <Skeleton className="h-[200px] w-[200px]" />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
