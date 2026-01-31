import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
