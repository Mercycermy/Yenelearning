"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { fetchAPI, uploadFile } from "@/lib/api";

export default function NewWordPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);

        const formData = new FormData(event.currentTarget);
        const imageFile = formData.get("imageFile") as File | null;
        const imageUrl = imageFile && imageFile.size > 0 ? await uploadFile(imageFile) : undefined;

        const wordData = {
            title: formData.get("title"),
            description: formData.get("description"),
            type: "word",
            language: formData.get("language"),
            difficulty: formData.get("difficulty"),
            minAge: parseInt(formData.get("minAge") as string),
            maxAge: parseInt(formData.get("maxAge") as string),
            imageUrl,
            audioUrl: formData.get("audioUrl") || undefined,
        };

        try {
            await fetchAPI("/content", {
                method: "POST",
                body: JSON.stringify(wordData),
            });
            router.push("/content/words");
        } catch (err: any) {
            alert(err.message || "Failed to create word");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/content/words"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-400"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                        Add New Word
                    </h1>
                    <p className="text-sm text-gray-500">Create a new vocabulary card.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Word (Amharic)
                        </label>
                        <input
                            name="title"
                            required
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                            placeholder="e.g. ፖም"
                        />
                    </div>

                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description / English Translation
                        </label>
                        <textarea
                            name="description"
                            required
                            rows={3}
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                            placeholder="e.g. Apple - A sweet red fruit"
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
                            defaultValue={4}
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
                            defaultValue={8}
                            required
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        />
                    </div>

                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Image Upload (optional)
                        </label>
                        <input
                            name="imageFile"
                            type="file"
                            accept="image/*"
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-8 dark:border-zinc-800">
                    <Link
                        href="/content/words"
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
                        {isSaving ? "Saving..." : "Save Word"}
                    </button>
                </div>
            </form>
        </div>
    );
}
