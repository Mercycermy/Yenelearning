"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";

export default function EditTutorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [tutor, setTutor] = useState<any>(null);

    useEffect(() => {
        async function loadTutor() {
            try {
                const data = await fetchAPI(`/content/avatars/all`);
                // Find the specific tutor by ID since there's no direct/avatars/:id GET endpoint (hypothetically)
                // Let's check if there is a direct endpoint. Based on my previous test script, I used /content/avatars/all
                // Actually, backend usually has GET /content/avatars/:id. Let's try that.
                const specificTutor = await fetchAPI(`/content/avatars/${id}`);
                setTutor(specificTutor);
            } catch (err) {
                alert("Failed to load tutor data");
                router.push("/ai-tutors");
            } finally {
                setIsLoading(false);
            }
        }
        loadTutor();
    }, [id, router]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);

        const formData = new FormData(event.currentTarget);
        const tutorData = {
            name: formData.get("name"),
            gender: formData.get("gender"),
            teachingStyle: formData.get("teachingStyle"),
            personalityDescription: formData.get("personalityDescription"),
            imageUrl: formData.get("imageUrl"),
            voiceId: formData.get("voiceId") || undefined,
            speechRate: parseFloat(formData.get("speechRate") as string),
            pitchLevel: parseFloat(formData.get("pitchLevel") as string),
        };

        try {
            await fetchAPI(`/content/avatars/${id}`, {
                method: "PATCH",
                body: JSON.stringify(tutorData),
            });
            router.push("/ai-tutors");
        } catch (err: any) {
            alert(err.message || "Failed to update tutor");
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
                    href="/ai-tutors"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-400"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                        Edit AI Tutor
                    </h1>
                    <p className="text-sm text-gray-500">Modify tutor personality and settings.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tutor Name
                        </label>
                        <input
                            name="name"
                            defaultValue={tutor.name}
                            required
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        />
                    </div>

                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Personality Description
                        </label>
                        <textarea
                            name="personalityDescription"
                            defaultValue={tutor.personalityDescription}
                            required
                            rows={3}
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Gender
                        </label>
                        <select
                            name="gender"
                            defaultValue={tutor.gender}
                            required
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Teaching Style
                        </label>
                        <select
                            name="teachingStyle"
                            defaultValue={tutor.teachingStyle}
                            required
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        >
                            <option value="calm_storyteller">Calm Storyteller</option>
                            <option value="playful_teacher">Playful Teacher</option>
                            <option value="serious_guide">Serious Guide</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Speech Rate (0.5 - 2.0)
                        </label>
                        <input
                            name="speechRate"
                            type="number"
                            step="0.1"
                            defaultValue={tutor.speechRate}
                            min="0.5"
                            max="2.0"
                            required
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pitch Level (0.5 - 2.0)
                        </label>
                        <input
                            name="pitchLevel"
                            type="number"
                            step="0.1"
                            defaultValue={tutor.pitchLevel}
                            min="0.5"
                            max="2.0"
                            required
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        />
                    </div>

                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Avatar Image URL
                        </label>
                        <input
                            name="imageUrl"
                            defaultValue={tutor.imageUrl}
                            required
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        />
                    </div>

                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Voice ID (optional)
                        </label>
                        <input
                            name="voiceId"
                            defaultValue={tutor.voiceId}
                            className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-8 dark:border-zinc-800">
                    <Link
                        href="/ai-tutors"
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
                        {isSaving ? "Saving..." : "Update Tutor"}
                    </button>
                </div>
            </form>
        </div>
    );
}
