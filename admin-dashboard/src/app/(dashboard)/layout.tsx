"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            router.push("/login");
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950">
            <Sidebar />
            <Header />
            <main className="ml-64 min-h-screen pt-20">
                <div className="mx-auto max-w-7xl px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
