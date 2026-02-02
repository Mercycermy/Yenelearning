"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { fetchAPI, uploadFile } from "@/lib/api";

interface StoryPage {
    pageNumber: number;
    text: string;
    imageUrl?: string;
    imageFile?: File | null;
}

export default function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [pages, setPages] = useState<StoryPage[]>([]);
    const [storyData, setStoryData] = useState<any>(null);

    useEffect(() => {
        async function loadStory() {
            try {
                const data = await fetchAPI(`/content/stories/${id}`);
                setStoryData(data);
                setPages(data.pages || []);
            } catch (err) {
                alert("Failed to load story data");
                router.push("/content/stories");
            } finally {
                setIsLoading(false);
            }
        }
        loadStory();
    }, [id, router]);

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

    const updatePageImage = (index: number, imageFile: File | null) => {
        const newPages = [...pages];
        newPages[index].imageFile = imageFile;
        setPages(newPages);
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);

        const formData = new FormData(event.currentTarget);
        const coverFile = formData.get("coverFile") as File | null;
        const coverImageUrl = coverFile && coverFile.size > 0
            ? await uploadFile(coverFile)
            : storyData.coverImageUrl;

        const pagesWithUploads = await Promise.all(
            pages.map(async (page) => {
                const uploadedUrl = page.imageFile && page.imageFile.size > 0
                    ? await uploadFile(page.imageFile)
                    : page.imageUrl;
                return {
                    pageNumber: page.pageNumber,
                    text: page.text,
                    imageUrl: uploadedUrl && uploadedUrl.trim() !== "" ? uploadedUrl : undefined,
                };
            }),
        );

        const updateData = {
            title: formData.get("title"),
            description: formData.get("description"),
            language: formData.get("language"),
            difficulty: formData.get("difficulty"),
            minAge: parseInt(formData.get("minAge") as string),
            maxAge: parseInt(formData.get("maxAge") as string),
            coverImageUrl,
            pages: pagesWithUploads,
        };

        try {
            await fetchAPI(`/content/stories/${id}`, {
                method: "PATCH",
                body: JSON.stringify(updateData),
            });
            router.push("/content/stories");
        } catch (err: any) {
            alert(err.message || "Failed to update story");
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
                    href="/content/stories"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-400"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                        Edit Story
                    </h1>
                    <p className="text-sm text-gray-500">Update story and its pages.</p>
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
                                defaultValue={storyData.title}
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
                                defaultValue={storyData.description}
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
                                defaultValue={storyData.language}
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
                                defaultValue={storyData.difficulty}
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
                                defaultValue={storyData.minAge}
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
                                defaultValue={storyData.maxAge}
                                required
                                className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                            />
                        </div>

                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Cover Image Upload
                            </label>
                            <input
                                name="coverFile"
                                type="file"
                                accept="image/*"
                                className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                            />
                            {storyData.coverImageUrl && (
                                <p className="mt-2 text-xs text-gray-500">Current cover will be kept if no file is uploaded.</p>
                            )}
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
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Page Image Upload (optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => updatePageImage(index, e.target.files?.[0] || null)}
                                        className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                    />
                                    {page.imageFile && (
                                        <p className="mt-2 text-xs text-gray-500">Selected: {page.imageFile.name}</p>
                                    )}
                                    {!page.imageFile && page.imageUrl && (
                                        <p className="mt-2 text-xs text-gray-500">Current image will be kept if no file is uploaded.</p>
                                    )}
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
                        {isSaving ? "Saving..." : "Update Story"}
                    </button>
                </div>
            </form>
        </div>
    );
}
