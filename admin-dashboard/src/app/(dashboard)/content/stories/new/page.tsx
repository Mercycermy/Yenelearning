"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";

interface StoryPage {
    pageNumber: number;
    text: string;
    imageUrl?: string;
}

export default function NewStoryPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [pages, setPages] = useState<StoryPage[]>([
        { pageNumber: 1, text: "" }
    ]);

    const addPage = () => {
        setPages([...pages, { pageNumber: pages.length + 1, text: "" }]);
    };

    const removePage = (index: number) => {
        const newPages = pages.filter((_, i) => i !== index).map((page, i) => ({
            ...page,
            pageNumber: i + 1
        }));
        setPages(newPages);
    };

    const updatePageText = (index: number, text: string) => {
        const newPages = [...pages];
        newPages[index].text = text;
        setPages(newPages);
    };

    const updatePageImage = (index: number, imageUrl: string) => {
        const newPages = [...pages];
        newPages[index].imageUrl = imageUrl;
        setPages(newPages);
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);

        const formData = new FormData(event.currentTarget);
        const storyData = {
            title: formData.get("title"),
            description: formData.get("description"),
            language: formData.get("language"),
            difficulty: formData.get("difficulty"),
            minAge: parseInt(formData.get("minAge") as string),
            maxAge: parseInt(formData.get("maxAge") as string),
            coverImageUrl: formData.get("imageUrl") || undefined,
            pages: pages.map(p => ({
                ...p,
                imageUrl: p.imageUrl && p.imageUrl.trim() !== "" ? p.imageUrl : undefined
            })),
        };

        try {
            await fetchAPI("/content/stories", {
                method: "POST",
                body: JSON.stringify(storyData),
            });
            router.push("/content/stories");
        } catch (err: any) {
            alert(err.message || "Failed to create story");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/content/stories"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-400"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                        Create New Story
                    </h1>
                    <p className="text-sm text-gray-500">Write an interactive adventure for kids.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8">
                <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="mb-6 text-lg font-bold">Story Details</h2>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Story Title
                            </label>
                            <input
                                name="title"
                                required
                                className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                placeholder="e.g. The Brave Little Lion"
                            />
                        </div>

                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Description
                            </label>
                            <textarea
                                name="description"
                                required
                                rows={3}
                                className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                placeholder="A short summary of the story..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Language
                            </label>
                            <select
                                name="language"
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
                                Difficulty
                            </label>
                            <select
                                name="difficulty"
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
                                defaultValue={6}
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
                                defaultValue={12}
                                required
                                className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                            />
                        </div>

                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Cover Image URL
                            </label>
                            <input
                                name="imageUrl"
                                className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                placeholder="https://example.com/cover.png"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-lg font-bold">Story Pages</h2>
                    {pages.map((page, index) => (
                        <div key={index} className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600 dark:bg-blue-900/30">
                                    {page.pageNumber}
                                </span>
                                {pages.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removePage(index)}
                                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Page Text
                                    </label>
                                    <textarea
                                        value={page.text}
                                        onChange={(e) => updatePageText(index, e.target.value)}
                                        required
                                        rows={4}
                                        className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                        placeholder="What happens on this page?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Page Image URL (optional)
                                    </label>
                                    <input
                                        value={page.imageUrl || ""}
                                        onChange={(e) => updatePageImage(index, e.target.value)}
                                        className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                        placeholder="https://example.com/page-img.png"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addPage}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-6 text-sm font-bold text-gray-500 transition-all hover:border-blue-400 hover:text-blue-500 dark:border-zinc-800"
                    >
                        <Plus className="h-5 w-5" />
                        Add Another Page
                    </button>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-8 dark:border-zinc-800">
                    <Link
                        href="/content/stories"
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
                        {isSaving ? "Creating..." : "Create Story"}
                    </button>
                </div>
            </form>
        </div>
    );
}
