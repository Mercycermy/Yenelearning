"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit, Plus, Trash2, Lightbulb, Loader2 } from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface KnowledgeItem {
    id: string;
    title: string;
    description: string;
    language: string;
    difficulty: string;
    minAge: number;
    maxAge: number;
    imageUrl?: string;
    metadata?: {
        category?: string;
    };
}

interface LanguageItem {
    id: string;
    code: string;
    name: string;
    nativeName: string;
    isActive: boolean;
}

export default function KnowledgePage() {
    const [items, setItems] = useState<KnowledgeItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [languages, setLanguages] = useState<LanguageItem[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>("all");

    useEffect(() => {
        async function loadLanguages() {
            try {
                const data = await fetchAPI("/settings/languages");
                setLanguages(data);
            } catch (err) {
                console.error(err);
            }
        }

        loadLanguages();
    }, []);

    useEffect(() => {
        async function loadKnowledge() {
            setIsLoading(true);
            setError(null);
            try {
                const query = selectedLanguage === "all"
                    ? "/content?type=knowledge"
                    : `/content?type=knowledge&language=${selectedLanguage}`;
                const data = await fetchAPI(query);
                setItems(data);
            } catch (err) {
                setError("Failed to load knowledge content.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }

        loadKnowledge();
    }, [selectedLanguage]);

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this knowledge item?")) return;

        try {
            await fetchAPI(`/content/${id}`, { method: "DELETE" });
            setItems(items.filter((item) => item.id !== id));
        } catch (err) {
            alert("Failed to delete knowledge item.");
            console.error(err);
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                <p className="font-medium">Error loading content</p>
                <p className="text-sm opacity-80">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                        Knowledge Library
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage general knowledge content for learners.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedLanguage}
                        onChange={(event) => setSelectedLanguage(event.target.value)}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-200"
                    >
                        <option value="all">All languages</option>
                        {languages
                            .filter((lang) => lang.isActive)
                            .map((lang) => (
                                <option key={lang.id} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                    </select>
                    <Link
                        href="/content/knowledge/new"
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg dark:bg-blue-600 dark:shadow-none dark:hover:bg-blue-500"
                    >
                        <Plus className="h-4 w-4" />
                        Add Knowledge
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                    >
                        <div className="relative aspect-video w-full bg-amber-50 dark:bg-zinc-800 flex items-center justify-center">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                                <Lightbulb className="h-12 w-12 text-amber-300 dark:text-zinc-600" />
                            )}
                            {item.metadata?.category && (
                                <div className="absolute top-2 right-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold shadow-sm uppercase dark:bg-black/80 dark:text-white">
                                    {item.metadata.category}
                                </div>
                            )}
                        </div>

                        <div className="p-5">
                            <h3 className="font-bold text-gray-900 dark:text-gray-50">
                                {item.title}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                                {item.description}
                            </p>

                            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                <div className="flex gap-2">
                                    <span className="rounded-md bg-gray-100 px-2 py-1 font-medium dark:bg-zinc-800 uppercase">
                                        {item.language}
                                    </span>
                                    <span className="rounded-md bg-gray-100 px-2 py-1 font-medium dark:bg-zinc-800 capitalize">
                                        {item.difficulty}
                                    </span>
                                </div>
                                <span>{item.minAge}-{item.maxAge} yrs</span>
                            </div>
                        </div>
                        <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <Link
                                href={`/content/knowledge/edit/${item.id}`}
                                className="rounded-full bg-white/90 p-2 text-gray-600 shadow-sm hover:text-blue-600 dark:bg-black/80 dark:text-gray-300 dark:hover:text-blue-400"
                            >
                                <Edit className="h-4 w-4" />
                            </Link>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="rounded-full bg-white/90 p-2 text-gray-600 shadow-sm hover:text-red-600 dark:bg-black/80 dark:text-gray-300 dark:hover:text-red-400"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && !error && (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <Lightbulb className="h-12 w-12 text-gray-300" />
                        <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-50">
                            No knowledge items found
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Add general knowledge topics for learners.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
