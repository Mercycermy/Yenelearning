"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit, Plus, Trash2, Gamepad2, Loader2, Image as ImageIcon } from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface Game {
    id: string;
    title: string;
    description: string;
    type: string;
    language: string;
    difficulty: string;
    minAge: number;
    maxAge: number;
    imageUrl?: string;
    metadata?: {
        gameType?: string; // specific game mechanics (e.g., matching, quiz)
    };
}

export default function GamesPage() {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadGames() {
            try {
                const data = await fetchAPI("/content?type=game");
                setGames(data);
            } catch (err) {
                setError("Failed to load games.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }

        loadGames();
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
                        Games
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage learning games and interactive activities.
                    </p>
                </div>
                <Link
                    href="/content/games/new"
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg dark:bg-blue-600 dark:shadow-none dark:hover:bg-blue-500"
                >
                    <Plus className="h-4 w-4" />
                    Create Game
                </Link>
            </div>

            {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                    <p>{error}</p>
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {games.map((game) => (
                    <div
                        key={game.id}
                        className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                    >
                        <div className="relative aspect-video w-full bg-indigo-50 dark:bg-zinc-800 flex items-center justify-center">
                            {game.imageUrl ? (
                                <img src={game.imageUrl} alt={game.title} className="h-full w-full object-cover" />
                            ) : (
                                <Gamepad2 className="h-12 w-12 text-indigo-300 dark:text-zinc-600" />
                            )}
                            <div className="absolute top-2 right-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold shadow-sm uppercase dark:bg-black/80 dark:text-white">
                                {game.metadata?.gameType || "Game"}
                            </div>
                        </div>

                        <div className="p-5">
                            <h3 className="font-bold text-gray-900 dark:text-gray-50">
                                {game.title}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                                {game.description}
                            </p>

                            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                <div className="flex gap-2">
                                    <span className="rounded-md bg-gray-100 px-2 py-1 font-medium dark:bg-zinc-800 uppercase">
                                        {game.language}
                                    </span>
                                    <span className="rounded-md bg-gray-100 px-2 py-1 font-medium dark:bg-zinc-800 capitalize">
                                        {game.difficulty}
                                    </span>
                                </div>
                                <span>{game.minAge}-{game.maxAge} yrs</span>
                            </div>
                        </div>
                        <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button className="rounded-full bg-white/90 p-2 text-gray-600 shadow-sm hover:text-blue-600 dark:bg-black/80 dark:text-gray-300 dark:hover:text-blue-400">
                                <Edit className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {games.length === 0 && !error && (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <Gamepad2 className="h-12 w-12 text-gray-300" />
                        <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-50">
                            No games found
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Create educational games for children.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
