"use client";

import { Bell, Search } from "lucide-react";

export function Header() {
    return (
        <header className="fixed right-0 top-0 z-30 flex h-20 w-[calc(100%-16rem)] items-center justify-between border-b border-gray-100 bg-white/50 px-8 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Overview
                </h2>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-10 w-64 rounded-xl border-none bg-gray-50 pl-10 text-sm font-medium text-gray-800 outline-none ring-1 ring-gray-200 transition-all focus:bg-white focus:ring-2 focus:ring-blue-100 dark:bg-zinc-800 dark:text-gray-200 dark:ring-zinc-700 dark:focus:ring-blue-900"
                    />
                </div>

                <button className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-zinc-800 dark:hover:text-gray-200">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-900"></span>
                </button>

                <div className="flex items-center gap-3 pl-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Admin User</p>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Super Admin</p>
                    </div>
                    <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-gray-200 shadow-sm dark:border-zinc-700">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="h-full w-full object-cover" />
                    </div>
                </div>
            </div>
        </header>
    );
}
