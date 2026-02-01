"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit, Plus, Trash2, Volume2, Image as ImageIcon, Loader2 } from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface Word {
    id: string;
    title: string; // Amharic
    // Note: Backend 'description' or 'metadata' might hold the English translation contextually
    // For now we map title -> Amharic, and check metadata for English if available, or just title
    description: string;
    type: "word";
    language: string;
    category?: string;
    imageUrl?: string;
    audioUrl?: string;
}

export default function WordsPage() {
    const [words, setWords] = useState<Word[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadWords() {
            try {
                const data = await fetchAPI("/content?type=word");
                setWords(data);
            } catch (err) {
                setError("Failed to load words. Please check if the backend is running.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }

        loadWords();
    }, []);

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this word?")) return;

        try {
            await fetchAPI(`/content/${id}`, { method: "DELETE" });
            setWords(words.filter((w) => w.id !== id));
        } catch (err) {
            alert("Failed to delete word.");
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
                        Word Library
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage vocabulary cards for lessons and games.
                    </p>
                </div>
                <Link
                    href="/content/words/new"
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg dark:bg-blue-600 dark:shadow-none dark:hover:bg-blue-500"
                >
                    <Plus className="h-4 w-4" />
                    Add New Word
                </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 dark:bg-zinc-800/50 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-4 font-medium">Title (Amharic)</th>
                            <th className="px-6 py-4 font-medium">Description (English)</th>
                            <th className="px-6 py-4 font-medium">Language</th>
                            <th className="px-6 py-4 font-medium">Assets</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {words.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No words found. Create one to get started!
                                </td>
                            </tr>
                        ) : (
                            words.map((word) => (
                                <tr
                                    key={word.id}
                                    className="group transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                                >
                                    <td className="px-6 py-4 text-lg font-bold text-gray-900 dark:text-gray-100">
                                        {word.title}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        {word.description || "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase">
                                            {word.language}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {word.imageUrl ? (
                                                <ImageIcon className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <ImageIcon className="h-4 w-4 text-gray-300" />
                                            )}
                                            {word.audioUrl ? (
                                                <Volume2 className="h-4 w-4 text-blue-500" />
                                            ) : (
                                                <Volume2 className="h-4 w-4 text-gray-300" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Link
                                                href={`/content/words/edit/${word.id}`}
                                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-zinc-700 dark:hover:text-blue-400"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(word.id)}
                                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
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
