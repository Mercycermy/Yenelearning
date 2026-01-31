import { ArrowUpRight, Clock, Star, Trophy, Users } from "lucide-react";

export default function DashboardHome() {
    const stats = [
        {
            label: "Total Learners",
            value: "1,234",
            change: "+12.5%",
            trend: "up",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100",
        },
        {
            label: "Words Learned",
            value: "45.2k",
            change: "+8.2%",
            trend: "up",
            icon: Star,
            color: "text-amber-600",
            bg: "bg-amber-100",
        },
        {
            label: "Stories Completed",
            value: "8,921",
            change: "+23.1%",
            trend: "up",
            icon: Trophy,
            color: "text-emerald-600",
            bg: "bg-emerald-100",
        },
        {
            label: "Avg. Learning Time",
            value: "24m",
            change: "-2.4%",
            trend: "down",
            icon: Clock,
            color: "text-purple-600",
            bg: "bg-purple-100",
        },
    ];

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
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
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
                                    className={`flex items-center gap-1 text-xs font-medium ${stat.trend === "up" ? "text-emerald-600" : "text-red-600"
                                        }`}
                                >
                                    {stat.change}
                                    <ArrowUpRight
                                        className={`h-3 w-3 ${stat.trend === "down" ? "rotate-90" : ""
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

            {/* Recent Activity Mock */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-6 text-lg font-bold text-gray-900 dark:text-gray-50">
                    Recent Activity
                </h2>
                <div className="space-y-6">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-start gap-4">
                            <div className="relative mt-1 h-2 w-2 rounded-full bg-blue-500">
                                <div className="absolute -inset-1 animate-ping rounded-full bg-blue-500 opacity-20"></div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    New story "The Lion and the Mouse" published
                                </p>
                                <p className="text-xs text-gray-500">2 hours ago</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
