"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit, Plus, Trash2, BookOpen, Loader2 } from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface Story {
    id: string;
    title: string;
    description: string;
    language: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    minAge: number;
    maxAge: number;
    imageUrl?: string;
    pages: any[];
}

export default function StoriesPage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadStories() {
            try {
                const data = await fetchAPI("/content/stories/all");
                setStories(data);
            } catch (err) {
                setError("Failed to load stories.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }

        loadStories();
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
                        Stories
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage interactive stories for children.
                    </p>
                </div>
                <Link
                    href="/content/stories/new"
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg dark:bg-blue-600 dark:shadow-none dark:hover:bg-blue-500"
                >
                    <Plus className="h-4 w-4" />
                    Create Story
                </Link>
            </div>

            {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                    <p>{error}</p>
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stories.map((story) => (
                    <div
                        key={story.id}
                        className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                    >
                        <div className="aspect-[4/3] w-full bg-gray-100 dark:bg-zinc-800">
                            {story.imageUrl ? (
                                <img
                                    src={story.imageUrl}
                                    alt={story.title}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-300">
                                    <BookOpen className="h-12 w-12" />
                                </div>
                            )}
                        </div>
                        <div className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-50">
                                        {story.title}
                                    </h3>
                                    <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                                        {story.description}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-full bg-purple-50 px-2.5 py-1 font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 uppercase">
                                    {story.language}
                                </span>
                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 capitalize">
                                    {story.difficulty}
                                </span>
                                <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    {story.minAge}-{story.maxAge} years
                                </span>
                            </div>
                        </div>
                        <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button className="rounded-full bg-white/90 p-2 text-gray-600 shadow-sm hover:text-blue-600 dark:bg-black/80 dark:text-gray-300 dark:hover:text-blue-400">
                                <Edit className="h-4 w-4" />
                            </button>
                            <button className="rounded-full bg-white/90 p-2 text-gray-600 shadow-sm hover:text-red-600 dark:bg-black/80 dark:text-gray-300 dark:hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {stories.length === 0 && !error && (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <BookOpen className="h-12 w-12 text-gray-300" />
                        <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-50">
                            No stories found
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by creating your first interactive story.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
