"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    Gamepad2,
    Mic,
    Users,
    Settings,
    LogOut,
    Library,
    Lightbulb
} from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Words", href: "/content/words", icon: Library },
        { name: "Stories", href: "/content/stories", icon: BookOpen },
        { name: "Games", href: "/content/games", icon: Gamepad2 },
        { name: "Knowledge", href: "/content/knowledge", icon: Lightbulb },
        { name: "AI Tutors", href: "/ai-tutors", icon: Mic },
        { name: "Users", href: "/users", icon: Users },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-100 bg-white/80 backdrop-blur-md transition-transform dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="flex h-full flex-col justify-between px-4 py-6">
                <div>
                    <div className="mb-10 flex items-center gap-3 px-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-200 dark:shadow-none">
                            <span className="text-xl font-bold text-white">Y</span>
                        </div>
                        <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
                            Yene Teacher
                        </span>
                    </div>

                    <nav className="flex flex-col gap-1.5">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/20 dark:text-blue-400"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800/50 dark:hover:text-gray-100"
                                        }`}
                                >
                                    <Icon className={`h-5 w-5 ${isActive ? "text-blue-500 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-600 dark:text-zinc-500 dark:group-hover:text-gray-300"}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="border-t border-gray-100 pt-6 dark:border-zinc-800">
                    <button
                        onClick={handleLogout}
                        className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}
