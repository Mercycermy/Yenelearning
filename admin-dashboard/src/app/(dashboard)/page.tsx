"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Clock, Star, Trophy, Users } from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface DashboardStats {
    totalLearners: number;
    wordsLearned: number;
    storiesCompleted: number;
    avgLearningMinutes: number;
    changes: {
        learners: number;
        words: number;
        stories: number;
        avgTime: number;
    };
    recentActivity: Array<{
        id: string;
        type: string;
        title: string;
        childName: string;
        status: string;
        occurredAt: string | null;
    }>;
}

export default function DashboardHome() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await fetchAPI("/progress/stats/dashboard");
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }

        loadStats();
    }, []);

    const statCards = useMemo(() => {
        if (!stats) return [];
        return [
            {
                label: "Total Learners",
                value: stats.totalLearners.toLocaleString(),
                change: stats.changes.learners,
                icon: Users,
                color: "text-blue-600",
                bg: "bg-blue-100",
            },
            {
                label: "Words Learned",
                value: stats.wordsLearned.toLocaleString(),
                change: stats.changes.words,
                icon: Star,
                color: "text-amber-600",
                bg: "bg-amber-100",
            },
            {
                label: "Stories Completed",
                value: stats.storiesCompleted.toLocaleString(),
                change: stats.changes.stories,
                icon: Trophy,
                color: "text-emerald-600",
                bg: "bg-emerald-100",
            },
            {
                label: "Avg. Learning Time",
                value: `${stats.avgLearningMinutes}m`,
                change: stats.changes.avgTime,
                icon: Clock,
                color: "text-purple-600",
                bg: "bg-purple-100",
            },
        ];
    }, [stats]);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-sm text-gray-500">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                    Dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Welcome back to Yene Teacher Admin. Here's what's happening today.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => {
                    const Icon = stat.icon;
                    const trend = stat.change >= 0 ? "up" : "down";
                    return (
                        <div
                            key={i}
                            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`rounded-xl ${stat.bg} p-3 dark:bg-opacity-10`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div
                                    className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-600" : "text-red-600"
                                        }`}
                                >
                                    {stat.change >= 0 ? "+" : ""}{stat.change}%
                                    <ArrowUpRight
                                        className={`h-3 w-3 ${trend === "down" ? "rotate-90" : ""
                                            }`}
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {stat.label}
                                </h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-50">
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-6 text-lg font-bold text-gray-900 dark:text-gray-50">
                    Recent Activity
                </h2>
                {stats && stats.recentActivity.length > 0 ? (
                    <div className="space-y-6">
                        {stats.recentActivity.map((item) => (
                            <div key={item.id} className="flex items-start gap-4">
                                <div className="relative mt-1 h-2 w-2 rounded-full bg-blue-500">
                                    <div className="absolute -inset-1 animate-ping rounded-full bg-blue-500 opacity-20"></div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {item.childName} completed {item.type} "{item.title}"
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {item.occurredAt ? new Date(item.occurredAt).toLocaleString() : "Recently"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-gray-500">No recent activity yet.</div>
                )}
            </div>
        </div>
    );
}
