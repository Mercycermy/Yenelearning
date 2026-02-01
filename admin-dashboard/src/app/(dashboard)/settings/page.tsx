"use client";

import { useState, useEffect } from "react";
import { User, Settings as SettingsIcon, Shield, Plus, Trash2 } from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface LanguageItem {
    id: string;
    code: string;
    name: string;
    nativeName: string;
    isActive: boolean;
}

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [languages, setLanguages] = useState<LanguageItem[]>([]);
    const [isSavingLang, setIsSavingLang] = useState(false);
    const [langForm, setLangForm] = useState({ code: "", name: "", nativeName: "" });

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
        async function loadLanguages() {
            try {
                const data = await fetchAPI("/settings/languages");
                setLanguages(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        loadLanguages();
    }, []);

    async function handleAddLanguage() {
        if (!langForm.code || !langForm.name || !langForm.nativeName) return;
        setIsSavingLang(true);
        try {
            const newLang = await fetchAPI("/settings/languages", {
                method: "POST",
                body: JSON.stringify({
                    code: langForm.code.toLowerCase().trim(),
                    name: langForm.name.trim(),
                    nativeName: langForm.nativeName.trim(),
                }),
            });
            setLanguages((prev) => [...prev, newLang]);
            setLangForm({ code: "", name: "", nativeName: "" });
        } catch (err) {
            alert("Failed to add language");
        } finally {
            setIsSavingLang(false);
        }
    }

    async function handleToggleLanguage(lang: LanguageItem) {
        try {
            const updated = await fetchAPI(`/settings/languages/${lang.id}`, {
                method: "PATCH",
                body: JSON.stringify({ isActive: !lang.isActive }),
            });
            setLanguages((prev) => prev.map((l) => (l.id === lang.id ? updated : l)));
        } catch (err) {
            alert("Failed to update language");
        }
    }

    async function handleDeleteLanguage(lang: LanguageItem) {
        const confirmed = window.confirm(`Delete ${lang.name}?`);
        if (!confirmed) return;
        try {
            await fetchAPI(`/settings/languages/${lang.id}`, { method: "DELETE" });
            setLanguages((prev) => prev.filter((l) => l.id !== lang.id));
        } catch (err) {
            alert("Failed to delete language");
        }
    }

    if (isLoading) return null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Settings</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage your profile and system preferences.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Section */}
                    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-gray-100 font-semibold">
                            <User className="h-5 w-5 text-blue-500" />
                            <h2>Admin Profile</h2>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">First Name</label>
                                <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-gray-900 dark:text-gray-100">
                                    {user?.firstName || "Admin"}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Last Name</label>
                                <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-gray-900 dark:text-gray-100">
                                    {user?.lastName || "User"}
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Email Address</label>
                                <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-gray-900 dark:text-gray-100">
                                    {user?.email || "admin@yeneteacher.com"}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Role</label>
                                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 font-medium capitalize">
                                    {user?.role || "Admin"}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* System Section */}
                    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-gray-100 font-semibold">
                            <SettingsIcon className="h-5 w-5 text-indigo-500" />
                            <h2>System Settings</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-50 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</p>
                                    <p className="text-sm text-gray-500">Receive alerts about new user registrations.</p>
                                </div>
                                <div className="h-6 w-11 rounded-full bg-blue-600 relative cursor-pointer">
                                    <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-50 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                                    <p className="text-sm text-gray-500">Enable system-wide dark theme.</p>
                                </div>
                                <div className="h-6 w-11 rounded-full bg-gray-200 dark:bg-blue-600 relative cursor-pointer">
                                    <div className="absolute left-1 dark:left-auto dark:right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all"></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Language Management */}
                    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                                <SettingsIcon className="h-5 w-5 text-indigo-500" />
                                <h2>Languages</h2>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <input
                                placeholder="code (amharic)"
                                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                value={langForm.code}
                                onChange={(e) => setLangForm({ ...langForm, code: e.target.value })}
                            />
                            <input
                                placeholder="name"
                                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                value={langForm.name}
                                onChange={(e) => setLangForm({ ...langForm, name: e.target.value })}
                            />
                            <input
                                placeholder="native"
                                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                value={langForm.nativeName}
                                onChange={(e) => setLangForm({ ...langForm, nativeName: e.target.value })}
                            />
                        </div>
                        <div className="mt-3">
                            <button
                                onClick={handleAddLanguage}
                                disabled={isSavingLang}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
                            >
                                <Plus className="h-4 w-4" /> Add Language
                            </button>
                        </div>

                        <div className="mt-6 space-y-2">
                            {languages.length === 0 ? (
                                <div className="text-sm text-gray-500">No languages found.</div>
                            ) : (
                                languages.map((lang) => (
                                    <div
                                        key={lang.id}
                                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-800/50"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {lang.name} <span className="text-gray-400">({lang.code})</span>
                                            </p>
                                            <p className="text-gray-500">{lang.nativeName}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleLanguage(lang)}
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${lang.isActive
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                                    : "bg-gray-200 text-gray-600 dark:bg-zinc-700 dark:text-gray-300"}`}
                                            >
                                                {lang.isActive ? "Active" : "Inactive"}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLanguage(lang)}
                                                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100 font-semibold">
                            <Shield className="h-5 w-5 text-emerald-500" />
                            <h2>Security</h2>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            Manage your password and security keys.
                        </p>
                        <button className="w-full rounded-xl bg-gray-100 dark:bg-zinc-800 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-200 dark:hover:bg-zinc-700">
                            Change Password
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}
