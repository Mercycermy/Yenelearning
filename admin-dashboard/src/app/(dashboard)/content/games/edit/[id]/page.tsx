"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";

export default function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [game, setGame] = useState<any>(null);

    useEffect(() => {
        async function loadGame() {
            try {
                const data = await fetchAPI(`/content/${id}`);
                setGame(data);
            } catch (err) {
                alert("Failed to load game data");
                router.push("/content/games");
            } finally {
                setIsLoading(false);
            }
        }
        loadGame();
    }, [id, router]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);

        const formData = new FormData(event.currentTarget);
        const gameData = {
            title: formData.get("title"),
            description: formData.get("description"),
            language: formData.get("language"),
            difficulty: formData.get("difficulty"),
            minAge: parseInt(formData.get("minAge") as string),
            maxAge: parseInt(formData.get("maxAge") as string),
            imageUrl: formData.get("imageUrl") || undefined,
            metadata: {
                gameType: formData.get("gameType")
            }
        };

        try {
            await fetchAPI(`/content/${id}`, {
                method: "PATCH",
                body: JSON.stringify(gameData),
            });
            router.push("/content/games");
        } catch (err: any) {
            alert(err.message || "Failed to update game");
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/content/games"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-400"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                        Edit Game
                    </h1>
                    <p className="text-sm text-gray-500">Update learning activity details.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Game Title
                        </label>
                        <input
                            name="title"
                            defaultValue={game.title}
                            required
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        />
                    </div>

                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <textarea
                            name="description"
                            defaultValue={game.description}
                            required
                            rows={3}
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Language
                        </label>
                        <select
                            name="language"
                            defaultValue={game.language}
                            required
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        >
                            <option value="amharic">Amharic</option>
                            <option value="geez">Ge'ez</option>
                            <option value="english">English</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Game Type
                        </label>
                        <select
                            name="gameType"
                            defaultValue={game.metadata?.gameType}
                            required
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        >
                            <option value="matching">Matching</option>
                            <option value="quiz">Quiz</option>
                            <option value="drawing">Drawing</option>
                            <option value="voice">Voice Recognition</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Difficulty
                        </label>
                        <select
                            name="difficulty"
                            defaultValue={game.difficulty}
                            required
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Min Age
                        </label>
                        <input
                            name="minAge"
                            type="number"
                            defaultValue={game.minAge}
                            required
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Max Age
                        </label>
                        <input
                            name="maxAge"
                            type="number"
                            defaultValue={game.maxAge}
                            required
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        />
                    </div>

                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Image URL (optional)
                        </label>
                        <input
                            name="imageUrl"
                            defaultValue={game.imageUrl}
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-8 dark:border-zinc-800">
                    <Link
                        href="/content/games"
                        className="rounded-xl px-6 py-3 text-sm font-bold text-gray-500 transition-colors hover:text-gray-700"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50 dark:shadow-none"
                    >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isSaving ? "Saving..." : "Update Game"}
                    </button>
                </div>
            </form>
        </div>
    );
}
