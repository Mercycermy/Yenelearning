import Link from "next/link";
import { Edit, Plus, Trash2, Volume2, Image as ImageIcon } from "lucide-react";

export default function WordsPage() {
    const words = [
        {
            id: 1,
            amharic: "አንበሳ",
            english: "Lion",
            category: "Animals",
            hasAudio: true,
            hasImage: true,
        },
        {
            id: 2,
            amharic: "ቤት",
            english: "House",
            category: "Objects",
            hasAudio: true,
            hasImage: true,
        },
        {
            id: 3,
            amharic: "መኪና",
            english: "Car",
            category: "Vehicles",
            hasAudio: true,
            hasImage: false,
        },
        {
            id: 4,
            amharic: "ትምህርት ቤት",
            english: "School",
            category: "Places",
            hasAudio: false,
            hasImage: true,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                        Word Library
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage vocabulary cards for lessons and games.
                    </p>
                </div>
                <Link
                    href="/content/words/new"
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg dark:bg-blue-600 dark:shadow-none dark:hover:bg-blue-500"
                >
                    <Plus className="h-4 w-4" />
                    Add New Word
                </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 dark:bg-zinc-800/50 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-4 font-medium">Amharic</th>
                            <th className="px-6 py-4 font-medium">English</th>
                            <th className="px-6 py-4 font-medium">Category</th>
                            <th className="px-6 py-4 font-medium">Assets</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {words.map((word) => (
                            <tr
                                key={word.id}
                                className="group transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                            >
                                <td className="px-6 py-4 text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {word.amharic}
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    {word.english}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                        {word.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {word.hasImage && (
                                            <ImageIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        )}
                                        {word.hasAudio && (
                                            <Volume2 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        )}
                                        {!word.hasImage && !word.hasAudio && (
                                            <span className="text-xs text-gray-300">-</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-zinc-700 dark:hover:text-blue-400">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
