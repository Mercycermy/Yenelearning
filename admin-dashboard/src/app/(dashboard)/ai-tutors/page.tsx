"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit, Plus, Trash2, Mic, Loader2, Sparkles } from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface Avatar {
    id: string;
    name: string;
    description: string;
    gender: string;
    personality: string;
    imageUrl?: string;
    voiceId?: string;
}

export default function AITutorsPage() {
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadAvatars() {
            try {
                const data = await fetchAPI("/content/avatars/all");
                setAvatars(data);
            } catch (err) {
                setError("Failed to load AI tutors.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }

        loadAvatars();
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
                        AI Tutors
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage the personalities and avatars for AI friends.
                    </p>
                </div>
                <Link
                    href="/ai-tutors/new"
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg dark:bg-blue-600 dark:shadow-none dark:hover:bg-blue-500"
                >
                    <Plus className="h-4 w-4" />
                    Create Tutor
                </Link>
            </div>

            {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                    <p>{error}</p>
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {avatars.map((avatar) => (
                    <div
                        key={avatar.id}
                        className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                    >
                        <div className="aspect-square w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-900">
                            {avatar.imageUrl ? (
                                <img
                                    src={avatar.imageUrl}
                                    alt={avatar.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm dark:bg-zinc-800">
                                        <span className="text-3xl">🤖</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-gray-900 dark:text-gray-50">
                                {avatar.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {avatar.description}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 capitalize">
                                    <Sparkles className="h-3 w-3" />
                                    {avatar.personality}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                                    {avatar.gender}
                                </span>
                            </div>
                        </div>

                        <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button className="rounded-full bg-white/90 p-2 text-gray-600 shadow-sm hover:text-blue-600 dark:bg-black/80 dark:text-gray-300 dark:hover:text-blue-400">
                                <Edit className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {avatars.length === 0 && !error && (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <Mic className="h-12 w-12 text-gray-300" />
                        <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-50">
                            No AI Tutors found
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Create avatars to guide children through lessons.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
