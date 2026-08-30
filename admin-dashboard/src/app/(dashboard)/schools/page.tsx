"use client";

import { useEffect, useState, useTransition } from "react";
import {
    Building2,
    Plus,
    Key,
    Users,
    CheckCircle2,
    Search,
    Shield,
    Calendar,
    Mail,
    Phone,
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface SchoolItem {
    id: string;
    name: string;
    code: string;
    domain?: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
    primaryColor?: string;
    welcomeMessage?: string;
    licenseCount: number;
    usedLicenses: number;
    isActive: boolean;
    createdAt: string;
}

export default function SchoolsPage() {
    const [schools, setSchools] = useState<SchoolItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isPending, startTransition] = useTransition();

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showProvisionModal, setShowProvisionModal] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<SchoolItem | null>(null);

    // Create Form
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [domain, setDomain] = useState("");
    const [primaryColor, setPrimaryColor] = useState("#2563EB");
    const [welcomeMessage, setWelcomeMessage] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [licenseCount, setLicenseCount] = useState("50");

    // Provision Form
    const [provisionEmail, setProvisionEmail] = useState("");
    const [provisionFirstName, setProvisionFirstName] = useState("");
    const [provisionLastName, setProvisionLastName] = useState("");
    const [provisionRole, setProvisionRole] = useState("parent");
    const [provisionResult, setProvisionResult] = useState<{ email: string; password: string }[] | null>(null);

    const loadSchools = async () => {
        setLoading(true);
        try {
            const data = await fetchAPI("/schools");
            setSchools(Array.isArray(data) ? data : []);
        } catch {
            // Mock preview fallback
            setSchools([
                {
                    id: "school-1",
                    name: "St. Joseph Primary School",
                    code: "STJ-2026",
                    domain: "stjoseph",
                    address: "Addis Ababa, Arada",
                    contactEmail: "admin@stjoseph.edu.et",
                    contactPhone: "+251 11 123 4567",
                    primaryColor: "#2563EB",
                    welcomeMessage: "Welcome to St. Joseph Institutional Learning Portal.",
                    licenseCount: 150,
                    usedLicenses: 112,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                },
                {
                    id: "school-2",
                    name: "Cathedral School",
                    code: "CATH-2026",
                    domain: "cathedral",
                    address: "Addis Ababa, Lideta",
                    contactEmail: "contact@cathedral.edu.et",
                    contactPhone: "+251 11 987 6543",
                    primaryColor: "#7C3AED",
                    welcomeMessage: "Welcome to Cathedral E-Learning Portal.",
                    licenseCount: 200,
                    usedLicenses: 145,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSchools();
    }, []);

    const handleCreateSchool = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetchAPI("/schools", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    code: code.toUpperCase(),
                    domain: domain ? domain.toLowerCase().replace(/[^a-z0-9-]/g, "") : undefined,
                    primaryColor: primaryColor || undefined,
                    welcomeMessage: welcomeMessage || undefined,
                    contactEmail: contactEmail || undefined,
                    contactPhone: contactPhone || undefined,
                    licenseCount: parseInt(licenseCount, 10) || 0,
                }),
            });
            setShowCreateModal(false);
            setName("");
            setCode("");
            setDomain("");
            setPrimaryColor("#2563EB");
            setWelcomeMessage("");
            setContactEmail("");
            setContactPhone("");
            loadSchools();
        } catch (err: any) {
            alert(err.message || "Failed to create school");
        }
    };

    const handleProvisionCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSchool) return;
        try {
            const res = await fetchAPI(`/schools/${selectedSchool.id}/provision`, {
                method: "POST",
                body: JSON.stringify({
                    users: [
                        {
                            email: provisionEmail,
                            firstName: provisionFirstName,
                            lastName: provisionLastName,
                            role: provisionRole,
                        },
                    ],
                }),
            });
            if (res.credentials) {
                setProvisionResult(res.credentials);
            }
            loadSchools();
        } catch (err: any) {
            alert(err.message || "Failed to provision credentials");
        }
    };

    const filtered = schools.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.code.toLowerCase().includes(search.toLowerCase())
    );

    const totalLicenses = schools.reduce((sum, s) => sum + s.licenseCount, 0);
    const usedLicenses = schools.reduce((sum, s) => sum + s.usedLicenses, 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
                        School Partners & B2B Licensing
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                        Manage institutional contracts, license allocations, and auto-generate student/parent credentials.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                    <Plus className="h-4 w-4" />
                    Add School Partner
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                            <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Partner Schools</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{schools.length}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                            <Key className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Total B2B Licenses</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalLicenses}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/20">
                            <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Provisioned Accounts</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {usedLicenses} ({totalLicenses > 0 ? Math.round((usedLicenses / totalLicenses) * 100) : 0}%)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* School Roster Table */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-col gap-4 border-b border-gray-100 p-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by school name or code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-zinc-400">
                        <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600 dark:bg-zinc-800/50 dark:text-zinc-300">
                            <tr>
                                <th className="px-6 py-4">School & Domain</th>
                                <th className="px-6 py-4">School Code</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">License Usage</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {filtered.map((school) => {
                                const usagePct = Math.round((school.usedLicenses / (school.licenseCount || 1)) * 100);
                                const domainSlug = school.domain || school.code.toLowerCase();
                                return (
                                    <tr key={school.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
                                                    style={{ backgroundColor: school.primaryColor || "#2563EB" }}
                                                >
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{school.name}</p>
                                                    <a
                                                        href={`/portal/${domainSlug}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                    >
                                                        🌐 {domainSlug}.yenelearning.com
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-gray-700 dark:text-gray-300">
                                            {school.code}
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <div className="space-y-1">
                                                {school.contactEmail && (
                                                    <p className="flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5 text-gray-400" /> {school.contactEmail}
                                                    </p>
                                                )}
                                                {school.contactPhone && (
                                                    <p className="flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5 text-gray-400" /> {school.contactPhone}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs">
                                                    <span>{school.usedLicenses} of {school.licenseCount}</span>
                                                    <span className="font-semibold">{usagePct}%</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${usagePct > 90 ? "bg-amber-500" : "bg-emerald-500"}`}
                                                        style={{ width: `${Math.min(100, usagePct)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={`/portal/${domainSlug}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 transition"
                                                >
                                                    🌐 Domain Portal
                                                </a>
                                                <a
                                                    href={`/schools/${school.id}`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-500 transition"
                                                >
                                                    <Building2 className="h-3.5 w-3.5" />
                                                    Admin Console
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        setSelectedSchool(school);
                                                        setProvisionResult(null);
                                                        setShowProvisionModal(true);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                                >
                                                    <Key className="h-3.5 w-3.5 text-emerald-500" />
                                                    Provision
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create School Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add School Partner & Domain</h2>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                            Set up B2B licensing contract, dedicated school subdomain, and custom branding.
                        </p>

                        <form onSubmit={handleCreateSchool} className="mt-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                    School Official Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (!domain) {
                                            setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""));
                                        }
                                    }}
                                    placeholder="e.g. St. Joseph Primary School"
                                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                        School Code (Unique) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="e.g. STJ-2026"
                                        className="mt-1 w-full font-mono uppercase rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                        Custom Domain / Slug *
                                    </label>
                                    <div className="mt-1 flex items-center rounded-xl border border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 px-2.5">
                                        <input
                                            type="text"
                                            value={domain}
                                            onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                                            placeholder="stjoseph"
                                            className="w-full bg-transparent p-2 text-sm font-mono outline-none dark:text-gray-100"
                                        />
                                        <span className="text-xs text-gray-400 font-mono">.yene.et</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                        License Count *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={licenseCount}
                                        onChange={(e) => setLicenseCount(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                        Theme Primary Color
                                    </label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="h-9 w-12 rounded-lg border border-gray-200 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-full font-mono text-xs rounded-xl border border-gray-200 p-2.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                    Welcome / Portal Message
                                </label>
                                <textarea
                                    rows={2}
                                    value={welcomeMessage}
                                    onChange={(e) => setWelcomeMessage(e.target.value)}
                                    placeholder="Welcome to our official school portal..."
                                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        placeholder="admin@school.edu.et"
                                        className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                        Contact Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        placeholder="+251 ..."
                                        className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                                >
                                    Create Partner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Provision Modal */}
            {showProvisionModal && selectedSchool && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Provision User Credentials
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                            Generate pre-configured credentials for <span className="font-semibold text-blue-600">{selectedSchool.name}</span>
                        </p>

                        {!provisionResult ? (
                            <form onSubmit={handleProvisionCredentials} className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                        Account Role
                                    </label>
                                    <select
                                        value={provisionRole}
                                        onChange={(e) => setProvisionRole(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                    >
                                        <option value="parent">Parent Account</option>
                                        <option value="teacher">Teacher Account</option>
                                        <option value="school_admin">School Admin</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={provisionFirstName}
                                            onChange={(e) => setProvisionFirstName(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={provisionLastName}
                                            onChange={(e) => setProvisionLastName(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={provisionEmail}
                                        onChange={(e) => setProvisionEmail(e.target.value)}
                                        placeholder="parent@example.com"
                                        className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                    />
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowProvisionModal(false)}
                                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                                    >
                                        Generate Login
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-6 space-y-4">
                                <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                                        Credentials Generated Successfully!
                                    </p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                        Share these login details securely with the recipient.
                                    </p>

                                    {provisionResult.map((c, i) => (
                                        <div key={i} className="mt-3 bg-white dark:bg-zinc-800 p-3 rounded-lg font-mono text-xs space-y-1">
                                            <p><span className="text-gray-400">Email:</span> <span className="font-bold text-gray-900 dark:text-gray-100">{c.email}</span></p>
                                            <p><span className="text-gray-400">Password:</span> <span className="font-bold text-blue-600 dark:text-blue-400">{c.password}</span></p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowProvisionModal(false)}
                                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
