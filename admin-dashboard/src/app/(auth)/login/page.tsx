"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, User } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Invalid credentials");
            }

            const data = await response.json();
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("user", JSON.stringify(data.user));

            router.push("/");
        } catch (err: any) {
            alert(err.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-200 dark:shadow-none">
                    <span className="text-2xl font-bold text-white">Y</span>
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-50">
                    Welcome back
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Sign in to your admin account
                </p>
            </div>

            <div className="mt-8 rounded-2xl bg-white px-10 py-8 shadow-xl shadow-gray-200/50 dark:bg-zinc-900 dark:shadow-none">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Email address
                        </label>
                        <div className="relative mt-2">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100 dark:focus:border-blue-400"
                                placeholder="admin@yeneteacher.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Password
                        </label>
                        <div className="relative mt-2">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100 dark:focus:border-blue-400"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:ring-offset-zinc-900"
                            />
                            <label
                                htmlFor="remember-me"
                                className="ml-2 font-medium text-gray-700 dark:text-gray-300"
                            >
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link
                                href="#"
                                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:opacity-90 hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-zinc-900"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
