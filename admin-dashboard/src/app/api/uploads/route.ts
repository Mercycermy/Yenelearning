import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    const backendBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const contentType = request.headers.get("content-type");

    if (!contentType || !contentType.includes("multipart/form-data")) {
        return NextResponse.json({ message: "Content-Type must be multipart/form-data" }, { status: 400 });
    }

    try {
        const response = await fetch(`${backendBase}/uploads`, {
            method: "POST",
            headers: {
                "Content-Type": contentType,
                ...(request.headers.get("authorization") ? { "Authorization": request.headers.get("authorization") as string } : {}),
            },
            body: request.body,
            // @ts-expect-error - duplex is required for streaming body
            duplex: "half", 
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Backend upload failed:", response.status, errorText);
            return new NextResponse(errorText, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Upload proxy error:", error);
        return NextResponse.json({ message: error.message || "Upload failed" }, { status: 500 });
    }
}
