"use client";

import { useEffect, useState, use } from "react";
import {
    Building2,
    GraduationCap,
    Users,
    Key,
    Shield,
    CheckCircle2,
    Sparkles,
    ArrowRight,
    Lock,
    Mail,
    Eye,
    EyeOff,
    BookOpen,
    Send,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface SchoolBranding {
    id: string;
    name: string;
    code: string;
    domain?: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
    logoUrl?: string;
    primaryColor?: string;
    welcomeMessage?: string;
    licenseCount: number;
    usedLicenses: number;
    isActive: boolean;
}

export default function SchoolDomainPortalPage({ params }: { params: Promise<{ domain: string }> }) {
    const resolvedParams = use(params);
    const domain = resolvedParams.domain;

    const [school, setSchool] = useState<SchoolBranding | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Login Form State
    const [activeRole, setActiveRole] = useState<"school_admin" | "teacher" | "parent">("school_admin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [obscure, setObscure] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loginSuccess, setLoginSuccess] = useState(false);

    useEffect(() => {
        const fetchSchoolByDomain = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/schools/domain/${domain}`);
                if (!res.ok) {
                    throw new Error("School not found");
                }
                const data = await res.json();
                setSchool(data);
            } catch {
                // Fallback for mock preview or offline
                if (domain) {
                    setSchool({
                        id: "mock-id",
                        name: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Partner Academy`,
                        code: `${domain.toUpperCase()}-2026`,
                        domain: domain.toLowerCase(),
                        address: "Addis Ababa, Ethiopia",
                        contactEmail: `admin@${domain.toLowerCase()}.edu.et`,
                        contactPhone: "+251 11 000 0000",
                        primaryColor: "#2563EB",
                        welcomeMessage: "Welcome to our official institutional learning portal powered by YeneLearning.",
                        licenseCount: 100,
                        usedLicenses: 45,
                        isActive: true,
                    });
                } else {
                    setNotFound(true);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSchoolByDomain();
    }, [domain]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || "Invalid email or password");
            }

            const data = await res.json();
            if (typeof window !== "undefined") {
                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            setLoginSuccess(true);

            // Redirect based on role
            setTimeout(() => {
                if (school?.id) {
                    window.location.href = `/schools/${school.id}`;
                } else {
                    window.location.href = "/";
                }
            }, 800);
        } catch (err: any) {
            setError(err.message || "Sign in failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="text-sm font-semibold text-gray-600 dark:text-zinc-400">Loading School Domain Portal...</p>
                </div>
            </div>
        );
    }

    if (notFound || !school) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center dark:bg-zinc-950">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
                    <Building2 className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">School Domain Not Found</h1>
                <p className="mt-2 text-sm text-gray-500 max-w-sm">
                    The school domain <span className="font-mono font-bold text-gray-800 dark:text-zinc-200">"{domain}"</span> is not registered on YeneLearning.
                </p>
                <a href="/schools" className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow">
                    Back to Institutional Directory
                </a>
            </div>
        );
    }

    const primaryBg = school.primaryColor || "#2563EB";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col justify-between">
            {/* School Custom Top Header */}
            <header className="border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow"
                            style={{ backgroundColor: primaryBg }}
                        >
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="font-black text-gray-900 dark:text-gray-100 text-base leading-tight">
                                {school.name}
                            </h2>
                            <p className="text-xs font-mono text-gray-500 dark:text-zinc-400">
                                {school.domain ? `${school.domain}.yenelearning.com` : school.code}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Official School Portal
                        </span>
                        <a
                            href={`/schools/${school.id}`}
                            className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-200"
                        >
                            Management Console
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Portal Body */}
            <main className="max-w-6xl mx-auto px-4 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Side: School Branding & Overview */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 dark:bg-blue-900/30 px-3.5 py-1.5 text-xs font-bold text-blue-800 dark:text-blue-300">
                        <Sparkles className="h-3.5 w-3.5" /> Institutional E-Learning Domain
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
                        Welcome to <span style={{ color: primaryBg }}>{school.name}</span>
                    </h1>

                    <p className="text-base text-gray-600 dark:text-zinc-300 leading-relaxed">
                        {school.welcomeMessage || "Access your personalized student learning tracks, bilingual pronunciation tutors, class performance dashboards, and official school communications."}
                    </p>

                    {/* School Key Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">Student Learning</h4>
                                    <p className="text-xs text-gray-400">KG to Grade 4 adaptive games</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">Parent Monitoring</h4>
                                    <p className="text-xs text-gray-400">Weekly reports & direct notices</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                    <Key className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">Instant Credentials</h4>
                                    <p className="text-xs text-gray-400">Direct school-issued accounts</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                    <Send className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">School Notices</h4>
                                    <p className="text-xs text-gray-400">Official homework & updates</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Branded Authentication Card */}
                <div className="lg:col-span-5">
                    <div className="rounded-3xl border border-gray-200/80 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="text-center pb-4 border-b border-gray-100 dark:border-zinc-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                Sign In to {school.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                                Enter your school-issued account details to access your portal.
                            </p>
                        </div>

                        {/* Role Switcher Tabs */}
                        <div className="flex gap-2 my-5 p-1 bg-gray-100 dark:bg-zinc-800 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => setActiveRole("school_admin")}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                                    activeRole === "school_admin"
                                        ? "bg-white text-blue-600 shadow dark:bg-zinc-700 dark:text-white"
                                        : "text-gray-500 hover:text-gray-800 dark:text-zinc-400"
                                }`}
                            >
                                School Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveRole("teacher")}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                                    activeRole === "teacher"
                                        ? "bg-white text-blue-600 shadow dark:bg-zinc-700 dark:text-white"
                                        : "text-gray-500 hover:text-gray-800 dark:text-zinc-400"
                                }`}
                            >
                                Teacher
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveRole("parent")}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                                    activeRole === "parent"
                                        ? "bg-white text-blue-600 shadow dark:bg-zinc-700 dark:text-white"
                                        : "text-gray-500 hover:text-gray-800 dark:text-zinc-400"
                                }`}
                            >
                                Parent
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs font-semibold">
                                {error}
                            </div>
                        )}

                        {loginSuccess && (
                            <div className="p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" /> Signed in successfully! Redirecting...
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                                    School Email Address *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={
                                            activeRole === "school_admin"
                                                ? `admin@${school.domain || "school"}.edu.et`
                                                : activeRole === "teacher"
                                                ? `teacher@${school.domain || "school"}.edu.et`
                                                : `parent@${school.domain || "school"}.edu.et`
                                        }
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                                    Password *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={obscure ? "password" : "text"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-10 text-sm outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setObscure(!obscure)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {obscure ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
                                style={{ backgroundColor: primaryBg }}
                            >
                                {submitting ? (
                                    <span>Signing In...</span>
                                ) : (
                                    <>
                                        <span>Sign In to {school.name}</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800 text-center">
                            <p className="text-xs text-gray-400">
                                Need credentials? Contact your school administrator at{" "}
                                <span className="font-semibold text-gray-700 dark:text-zinc-300">
                                    {school.contactEmail || "admin@school.edu.et"}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-zinc-800 py-4 text-center text-xs text-gray-400">
                © 2026 {school.name} • Powered by YeneLearning Institutional Platform
            </footer>
        </div>
    );
}
