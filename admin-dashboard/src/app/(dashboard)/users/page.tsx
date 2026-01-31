"use client";

import { useEffect, useState } from "react";
import { Edit, Ban, CheckCircle, Loader2, User } from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface UserData {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    subscriptionPlan: string;
    childrenCount?: number;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadUsers() {
            try {
                const data = await fetchAPI("/users");
                setUsers(data);
            } catch (err) {
                setError("Failed to load users.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }

        loadUsers();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                        Users
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage parents, admins, and subscriptions.
                    </p>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                    <p>{error}</p>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 dark:bg-zinc-800/50 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-4 font-medium">User</th>
                            <th className="px-6 py-4 font-medium">Role</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Subscription</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="group transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {user.fullName || "User"}
                                                </p>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${user.role === 'admin'
                                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.isActive ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle className="h-4 w-4" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-gray-400">
                                                <Ban className="h-4 w-4" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 capitalize">
                                        {user.subscriptionPlan}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                            <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-zinc-700 dark:hover:text-blue-400">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            {user.isActive && (
                                                <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400">
                                                    <Ban className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
