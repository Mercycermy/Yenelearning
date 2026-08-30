"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
    Building2,
    ArrowLeft,
    Users,
    GraduationCap,
    Key,
    Mail,
    Phone,
    Plus,
    Send,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    Sparkles,
    BookOpen,
    Download,
    Printer,
    Star,
    Clock,
    AlertCircle,
    UserCheck,
    Globe,
    ExternalLink,
    FileSpreadsheet,
    MessageSquareText,
    School as SchoolIcon,
    Shield,
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface SchoolDetails {
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
    createdAt: string;
}

interface StudentItem {
    id: string;
    name: string;
    age: number;
    grade: string;
    currentLanguage: string;
    dailyTimeLimitMinutes: number;
    totalStars: number;
    totalTimeSpentMinutes: number;
    schoolId: string;
    parentId: string;
    parent?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    createdAt: string;
}

interface ParentItem {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    schoolId: string;
    childrenCount?: number;
    children?: StudentItem[];
    createdAt: string;
}

interface TeacherItem {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    schoolId: string;
    createdAt: string;
}

interface AnalyticsData {
    totalStudents: number;
    totalParents: number;
    totalTeachers: number;
    licenseUsage: { total: number; used: number; percentage: number };
    gradeDistribution: Record<string, number>;
    totalStarsEarned: number;
    totalLearningMinutes: number;
}

export default function SchoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const schoolId = resolvedParams.id;

    const [school, setSchool] = useState<SchoolDetails | null>(null);
    const [students, setStudents] = useState<StudentItem[]>([]);
    const [parents, setParents] = useState<ParentItem[]>([]);
    const [teachers, setTeachers] = useState<TeacherItem[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"students" | "teachers" | "parents" | "broadcast" | "analytics">("students");

    // Search & Filters
    const [studentSearch, setStudentSearch] = useState("");
    const [gradeFilter, setGradeFilter] = useState("all");
    const [parentSearch, setParentSearch] = useState("");
    const [teacherSearch, setTeacherSearch] = useState("");

    // Modals
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showBulkGenModal, setShowBulkGenModal] = useState(false);
    const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
    const [showStudentNoticeModal, setShowStudentNoticeModal] = useState(false);
    const [showEditStudentModal, setShowEditStudentModal] = useState(false);
    const [showDirectMessageModal, setShowDirectMessageModal] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
    const [selectedParent, setSelectedParent] = useState<ParentItem | null>(null);

    // Form States - Enroll Student
    const [enrollName, setEnrollName] = useState("");
    const [enrollAge, setEnrollAge] = useState(6);
    const [enrollGrade, setEnrollGrade] = useState("kg");
    const [enrollLanguage, setEnrollLanguage] = useState("amharic");
    const [enrollDailyTime, setEnrollDailyTime] = useState(30);
    const [enrollParentEmail, setEnrollParentEmail] = useState("");
    const [enrollParentName, setEnrollParentName] = useState("");
    const [enrollResult, setEnrollResult] = useState<{ student: StudentItem; credentials?: { email: string; password: string } } | null>(null);

    // Form States - Bulk Generate Credentials
    const [bulkCount, setBulkCount] = useState(5);
    const [bulkGrade, setBulkGrade] = useState("kg");
    const [bulkAge, setBulkAge] = useState(6);
    const [bulkLanguage, setBulkLanguage] = useState("amharic");
    const [bulkPrefix, setBulkPrefix] = useState("student");
    const [bulkResult, setBulkResult] = useState<Array<{ studentName: string; grade: string; parentEmail: string; parentPassword: string; studentId: string }> | null>(null);

    // Form States - Add Teacher
    const [teacherEmail, setTeacherEmail] = useState("");
    const [teacherFirstName, setTeacherFirstName] = useState("");
    const [teacherLastName, setTeacherLastName] = useState("");
    const [teacherPassword, setTeacherPassword] = useState("");
    const [teacherResult, setTeacherResult] = useState<{ email: string; password?: string } | null>(null);

    // Form States - Student Notice
    const [noticeSubject, setNoticeSubject] = useState("");
    const [noticeBody, setNoticeBody] = useState("");
    const [includeProgressSummary, setIncludeProgressSummary] = useState(true);
    const [noticeStatus, setNoticeStatus] = useState<string | null>(null);

    // Form States - Edit Student
    const [editName, setEditName] = useState("");
    const [editAge, setEditAge] = useState(6);
    const [editGrade, setEditGrade] = useState("kg");
    const [editLanguage, setEditLanguage] = useState("amharic");
    const [editDailyTime, setEditDailyTime] = useState(30);

    // Form States - Broadcast Message
    const [broadcastSubject, setBroadcastSubject] = useState("");
    const [broadcastBody, setBroadcastBody] = useState("");
    const [broadcastGrade, setBroadcastGrade] = useState("all");
    const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);
    const [directSubject, setDirectSubject] = useState("");
    const [directBody, setDirectBody] = useState("");

    const loadSchoolData = async () => {
        setLoading(true);
        try {
            const [schoolData, studentList, parentList, teacherList, analyticsData] = await Promise.all([
                fetchAPI(`/schools/${schoolId}`),
                fetchAPI(`/schools/${schoolId}/students`),
                fetchAPI(`/schools/${schoolId}/parents`),
                fetchAPI(`/schools/${schoolId}/teachers`),
                fetchAPI(`/schools/${schoolId}/analytics`),
            ]);

            setSchool(schoolData);
            setStudents(Array.isArray(studentList) ? studentList : []);
            setParents(Array.isArray(parentList) ? parentList : []);
            setTeachers(Array.isArray(teacherList) ? teacherList : []);
            setAnalytics(analyticsData);
        } catch {
            // Mock fallback for preview if offline
            setSchool({
                id: schoolId,
                name: "St. Joseph Primary School",
                code: "STJ-2026",
                domain: "stjoseph",
                address: "Addis Ababa, Arada Sub-City",
                contactEmail: "admin@stjoseph.edu.et",
                contactPhone: "+251 11 123 4567",
                primaryColor: "#2563EB",
                welcomeMessage: "Welcome to St. Joseph Institutional Portal powered by YeneLearning.",
                licenseCount: 150,
                usedLicenses: 112,
                isActive: true,
                createdAt: new Date().toISOString(),
            });
            setStudents([
                {
                    id: "s1",
                    name: "Abebe Kebede",
                    age: 6,
                    grade: "kg",
                    currentLanguage: "amharic",
                    dailyTimeLimitMinutes: 30,
                    totalStars: 180,
                    totalTimeSpentMinutes: 240,
                    schoolId,
                    parentId: "p1",
                    parent: { id: "p1", firstName: "Kebede", lastName: "Mekonnen", email: "kebede@parent.et" },
                    createdAt: new Date().toISOString(),
                },
                {
                    id: "s2",
                    name: "Sara Hailu",
                    age: 7,
                    grade: "grade_1",
                    currentLanguage: "english",
                    dailyTimeLimitMinutes: 45,
                    totalStars: 230,
                    totalTimeSpentMinutes: 310,
                    schoolId,
                    parentId: "p2",
                    parent: { id: "p2", firstName: "Hailu", lastName: "Tadesse", email: "hailu@parent.et" },
                    createdAt: new Date().toISOString(),
                },
            ]);
            setParents([
                {
                    id: "p1",
                    firstName: "Kebede",
                    lastName: "Mekonnen",
                    email: "kebede@parent.et",
                    role: "parent",
                    schoolId,
                    childrenCount: 1,
                    createdAt: new Date().toISOString(),
                },
            ]);
            setTeachers([
                {
                    id: "t1",
                    firstName: "Tigist",
                    lastName: "Alemu",
                    email: "tigist@stjoseph.edu.et",
                    role: "teacher",
                    schoolId,
                    createdAt: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSchoolData();
    }, [schoolId]);

    const handleEnrollStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetchAPI(`/schools/${schoolId}/students`, {
                method: "POST",
                body: JSON.stringify({
                    name: enrollName,
                    age: Number(enrollAge),
                    grade: enrollGrade,
                    currentLanguage: enrollLanguage,
                    dailyTimeLimitMinutes: Number(enrollDailyTime),
                    parentEmail: enrollParentEmail.trim() || undefined,
                    parentFirstName: enrollParentName.trim() || undefined,
                }),
            });
            setEnrollResult(res);
            loadSchoolData();
        } catch (err: any) {
            alert(err.message || "Failed to enroll student");
        }
    };

    const handleBulkGenerateCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetchAPI(`/schools/${schoolId}/generate-student-creds`, {
                method: "POST",
                body: JSON.stringify({
                    count: Number(bulkCount),
                    grade: bulkGrade,
                    age: Number(bulkAge),
                    currentLanguage: bulkLanguage,
                    prefix: bulkPrefix.trim() || "student",
                }),
            });
            setBulkResult(res.credentials || []);
            loadSchoolData();
        } catch (err: any) {
            alert(err.message || "Failed to generate bulk credentials");
        }
    };

    const handleAddTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetchAPI(`/schools/${schoolId}/teachers`, {
                method: "POST",
                body: JSON.stringify({
                    email: teacherEmail.trim(),
                    firstName: teacherFirstName.trim(),
                    lastName: teacherLastName.trim(),
                    password: teacherPassword.trim() || undefined,
                }),
            });
            setTeacherResult({ email: teacherEmail, password: res.tempPassword || teacherPassword || "As entered" });
            loadSchoolData();
        } catch (err: any) {
            alert(err.message || "Failed to add teacher");
        }
    };

    const handleRemoveTeacher = async (teacherId: string, teacherName: string) => {
        if (!confirm(`Are you sure you want to remove teacher ${teacherName}?`)) return;
        try {
            await fetchAPI(`/schools/${schoolId}/teachers/${teacherId}`, {
                method: "DELETE",
            });
            loadSchoolData();
        } catch (err: any) {
            alert(err.message || "Failed to remove teacher");
        }
    };

    const handleSendStudentNotice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        setNoticeStatus("Sending...");
        try {
            await fetchAPI(`/schools/${schoolId}/students/${selectedStudent.id}/notice`, {
                method: "POST",
                body: JSON.stringify({
                    subject: noticeSubject,
                    body: noticeBody,
                    includeProgressSummary,
                }),
            });
            setNoticeStatus("✅ Academic notice successfully delivered to parent inbox!");
            setTimeout(() => {
                setShowStudentNoticeModal(false);
                setNoticeStatus(null);
                setNoticeSubject("");
                setNoticeBody("");
            }, 2000);
        } catch (err: any) {
            setNoticeStatus(`❌ Error: ${err.message}`);
        }
    };

    const handleUpdateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        try {
            await fetchAPI(`/schools/${schoolId}/students/${selectedStudent.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    name: editName,
                    age: Number(editAge),
                    grade: editGrade,
                    currentLanguage: editLanguage,
                    dailyTimeLimitMinutes: Number(editDailyTime),
                }),
            });
            setShowEditStudentModal(false);
            loadSchoolData();
        } catch (err: any) {
            alert(err.message || "Failed to update student");
        }
    };

    const handleDeleteStudent = async (studentId: string, studentName: string) => {
        if (!confirm(`Are you sure you want to unenroll ${studentName}? This will return 1 license to the school pool.`)) return;
        try {
            await fetchAPI(`/schools/${schoolId}/students/${studentId}`, {
                method: "DELETE",
            });
            loadSchoolData();
        } catch (err: any) {
            alert(err.message || "Failed to unenroll student");
        }
    };

    const handleSendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        setBroadcastStatus("Sending...");
        try {
            const res = await fetchAPI(`/schools/${schoolId}/broadcast`, {
                method: "POST",
                body: JSON.stringify({
                    subject: broadcastSubject,
                    body: broadcastBody,
                    targetGrade: broadcastGrade === "all" ? undefined : broadcastGrade,
                }),
            });
            setBroadcastStatus(`✅ Broadcast successfully delivered to ${res.delivered || 0} parents!`);
            setBroadcastSubject("");
            setBroadcastBody("");
            setTimeout(() => setBroadcastStatus(null), 5000);
        } catch (err: any) {
            setBroadcastStatus(`❌ Error: ${err.message}`);
        }
    };

    const handleSendDirectMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedParent) return;
        try {
            await fetchAPI(`/schools/${schoolId}/broadcast`, {
                method: "POST",
                body: JSON.stringify({
                    subject: directSubject,
                    body: directBody,
                    targetParentId: selectedParent.id,
                }),
            });
            alert(`Message sent to ${selectedParent.firstName} ${selectedParent.lastName}!`);
            setShowDirectMessageModal(false);
            setDirectSubject("");
            setDirectBody("");
        } catch (err: any) {
            alert(err.message || "Failed to send message");
        }
    };

    const downloadCredentialsCSV = (creds: Array<{ studentName: string; grade: string; parentEmail: string; parentPassword: string }>) => {
        const header = "Student Name,Grade,Parent Login Email,Temporary Password\n";
        const rows = creds.map(c => `"${c.studentName}","${c.grade}","${c.parentEmail}","${c.parentPassword}"`).join("\n");
        const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${school?.domain || "school"}_credentials.csv`;
        a.click();
    };

    const formatGrade = (grade: string) => {
        switch (grade) {
            case "kg": return "Kindergarten (KG)";
            case "grade_1": return "Grade 1";
            case "grade_2": return "Grade 2";
            case "grade_3": return "Grade 3";
            case "grade_4": return "Grade 4";
            default: return grade?.toUpperCase() || "KG";
        }
    };

    const filteredStudents = students.filter((s) => {
        const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
            s.parent?.email.toLowerCase().includes(studentSearch.toLowerCase());
        const matchesGrade = gradeFilter === "all" || s.grade === gradeFilter;
        return matchesSearch && matchesGrade;
    });

    const filteredParents = parents.filter((p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(parentSearch.toLowerCase()) ||
        p.email.toLowerCase().includes(parentSearch.toLowerCase())
    );

    const filteredTeachers = teachers.filter((t) =>
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.email.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    const licensePercentage = school && school.licenseCount > 0
        ? Math.round((school.usedLicenses / school.licenseCount) * 100)
        : 0;

    const domainSlug = school?.domain || school?.code.toLowerCase();

    return (
        <div className="space-y-8 pb-16">
            {/* Back Navigation & School Domain Header */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <Link
                        href="/schools"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 dark:text-zinc-400"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to School Directory
                    </Link>

                    {/* Dedicated Domain URL Pill */}
                    <a
                        href={`/portal/${domainSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition shadow-sm"
                    >
                        <Globe className="h-3.5 w-3.5" />
                        Dedicated Domain: <span className="font-mono underline">{domainSlug}.yenelearning.com</span>
                        <ExternalLink className="h-3 w-3 ml-0.5" />
                    </a>
                </div>

                <div
                    className="flex flex-col gap-4 rounded-3xl p-8 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between"
                    style={{
                        background: school?.primaryColor
                            ? `linear-gradient(135deg, ${school.primaryColor} 0%, #1e1b4b 100%)`
                            : "linear-gradient(135deg, #2563EB 0%, #4338CA 100%)",
                    }}
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
                                <Building2 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                                    {school?.name || "School Portal"}
                                </h1>
                                <p className="font-mono text-xs text-white/80">
                                    School Code: <span className="font-bold text-white uppercase">{school?.code}</span> • Domain: <span className="font-bold text-white">{domainSlug}.yene.et</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => {
                                setBulkResult(null);
                                setShowBulkGenModal(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md px-4 py-2.5 text-sm font-bold text-white hover:bg-white/30 transition shadow-sm"
                        >
                            <Key className="h-4 w-4" />
                            Bulk Generate Credentials
                        </button>
                        <button
                            onClick={() => {
                                setEnrollResult(null);
                                setEnrollName("");
                                setEnrollParentEmail("");
                                setEnrollParentName("");
                                setShowEnrollModal(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-900 shadow-md hover:bg-blue-50 transition"
                        >
                            <Plus className="h-4 w-4" />
                            Enroll Student
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">Enrolled Students</p>
                        <GraduationCap className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-gray-900 dark:text-gray-100">
                        {students.length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">KG through Grade 4</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">School Teachers</p>
                        <SchoolIcon className="h-5 w-5 text-indigo-500" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-gray-900 dark:text-gray-100">
                        {teachers.length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Class Instructors</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">Parent Accounts</p>
                        <Users className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-gray-900 dark:text-gray-100">
                        {parents.length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Linked Families</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">License Quota</p>
                        <Key className="h-5 w-5 text-emerald-500" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-gray-900 dark:text-gray-100">
                        {school?.usedLicenses} / {school?.licenseCount}
                    </p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                            className={`h-full ${licensePercentage > 85 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.min(100, licensePercentage)}%` }}
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">Learning Mastery</p>
                        <Star className="h-5 w-5 text-amber-500" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-gray-900 dark:text-gray-100">
                        {students.reduce((sum, s) => sum + (s.totalStars || 0), 0)} ⭐
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Total Stars Earned</p>
                </div>
            </div>

            {/* Main Navigation Tabs */}
            <div className="flex border-b border-gray-200 dark:border-zinc-800 gap-2 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("students")}
                    className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition whitespace-nowrap ${
                        activeTab === "students"
                            ? "border-blue-600 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400"
                    }`}
                >
                    <GraduationCap className="h-4 w-4" />
                    Students ({students.length})
                </button>
                <button
                    onClick={() => setActiveTab("teachers")}
                    className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition whitespace-nowrap ${
                        activeTab === "teachers"
                            ? "border-blue-600 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400"
                    }`}
                >
                    <SchoolIcon className="h-4 w-4" />
                    Teachers & Staff ({teachers.length})
                </button>
                <button
                    onClick={() => setActiveTab("parents")}
                    className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition whitespace-nowrap ${
                        activeTab === "parents"
                            ? "border-blue-600 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400"
                    }`}
                >
                    <Users className="h-4 w-4" />
                    Parents ({parents.length})
                </button>
                <button
                    onClick={() => setActiveTab("broadcast")}
                    className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition whitespace-nowrap ${
                        activeTab === "broadcast"
                            ? "border-blue-600 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400"
                    }`}
                >
                    <Send className="h-4 w-4" />
                    Parent Broadcasts
                </button>
                <button
                    onClick={() => setActiveTab("analytics")}
                    className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition whitespace-nowrap ${
                        activeTab === "analytics"
                            ? "border-blue-600 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400"
                    }`}
                >
                    <Sparkles className="h-4 w-4" />
                    Performance Analytics
                </button>
            </div>

            {/* TAB 1: STUDENTS MANAGEMENT */}
            {activeTab === "students" && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 items-center gap-3 max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search student or parent..."
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                />
                            </div>
                            <select
                                value={gradeFilter}
                                onChange={(e) => setGradeFilter(e.target.value)}
                                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200"
                            >
                                <option value="all">All Grades</option>
                                <option value="kg">Kindergarten</option>
                                <option value="grade_1">Grade 1</option>
                                <option value="grade_2">Grade 2</option>
                                <option value="grade_3">Grade 3</option>
                                <option value="grade_4">Grade 4</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setBulkResult(null);
                                    setShowBulkGenModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                            >
                                <Key className="h-4 w-4 text-emerald-500" />
                                Bulk Credentials
                            </button>
                            <button
                                onClick={() => {
                                    setEnrollResult(null);
                                    setEnrollName("");
                                    setEnrollParentEmail("");
                                    setEnrollParentName("");
                                    setShowEnrollModal(true);
                                }}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
                            >
                                <Plus className="h-4 w-4" />
                                Enroll Student
                            </button>
                        </div>
                    </div>

                    {/* Students Data Table */}
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-500 dark:text-zinc-400">
                                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600 dark:bg-zinc-800/60 dark:text-zinc-300">
                                    <tr>
                                        <th className="px-6 py-4">Student Name</th>
                                        <th className="px-6 py-4">Grade Track</th>
                                        <th className="px-6 py-4">Age / Language</th>
                                        <th className="px-6 py-4">Linked Parent</th>
                                        <th className="px-6 py-4">Mastery / Stars</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-gray-400">
                                                No students found. Click "Enroll Student" or "Bulk Credentials" to add learners.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((s) => (
                                            <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs">
                                                            {s.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{s.name}</p>
                                                            <p className="text-xs text-gray-400">ID: {s.id.substring(0, 8)}...</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                                                        s.grade === "kg"
                                                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                                    }`}>
                                                        {formatGrade(s.grade)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    <p className="font-medium text-gray-700 dark:text-zinc-300">{s.age} yrs old</p>
                                                    <p className="text-gray-400 capitalize">{s.currentLanguage || "Amharic"}</p>
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {s.parent ? (
                                                        <div>
                                                            <p className="font-semibold text-gray-800 dark:text-zinc-200">
                                                                {s.parent.firstName} {s.parent.lastName}
                                                            </p>
                                                            <p className="text-gray-400">{s.parent.email}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Unassigned Parent</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    <p className="font-bold text-amber-600">{s.totalStars || 0} ⭐ stars</p>
                                                    <p className="text-gray-400">{s.totalTimeSpentMinutes || 0} min study time</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedStudent(s);
                                                                setNoticeSubject(`Academic Progress Update for ${s.name}`);
                                                                setNoticeBody(`Dear Parent, here is an official update regarding ${s.name}'s performance at ${school?.name}.`);
                                                                setNoticeStatus(null);
                                                                setShowStudentNoticeModal(true);
                                                            }}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                                                            title="Send Notice to Parent"
                                                        >
                                                            <MessageSquareText className="h-3.5 w-3.5" />
                                                            Notice
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedStudent(s);
                                                                setEditName(s.name);
                                                                setEditAge(s.age);
                                                                setEditGrade(s.grade || "kg");
                                                                setEditLanguage(s.currentLanguage || "amharic");
                                                                setEditDailyTime(s.dailyTimeLimitMinutes || 30);
                                                                setShowEditStudentModal(true);
                                                            }}
                                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-zinc-800"
                                                            title="Edit Student / Change Grade"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteStudent(s.id, s.name)}
                                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                            title="Unenroll Student"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: TEACHERS MANAGEMENT */}
            {activeTab === "teachers" && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search teacher by name or email..."
                                value={teacherSearch}
                                onChange={(e) => setTeacherSearch(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                            />
                        </div>

                        <button
                            onClick={() => {
                                setTeacherResult(null);
                                setTeacherEmail("");
                                setTeacherFirstName("");
                                setTeacherLastName("");
                                setTeacherPassword("");
                                setShowAddTeacherModal(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
                        >
                            <Plus className="h-4 w-4" />
                            Add School Teacher
                        </button>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-zinc-400">
                            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600 dark:bg-zinc-800/60 dark:text-zinc-300">
                                <tr>
                                    <th className="px-6 py-4">Teacher Name</th>
                                    <th className="px-6 py-4">School Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Assigned Since</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {filteredTeachers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-400">
                                            No teachers assigned to this school yet. Click "Add School Teacher" to provision.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTeachers.map((t) => (
                                        <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs">
                                                        {t.firstName?.substring(0, 1)}{t.lastName?.substring(0, 1)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {t.firstName} {t.lastName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-700 dark:text-zinc-300">
                                                {t.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    <SchoolIcon className="h-3.5 w-3.5" /> Class Teacher
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-400">
                                                {new Date(t.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleRemoveTeacher(t.id, `${t.firstName} ${t.lastName}`)}
                                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                    title="Remove Teacher"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: PARENTS DIRECTORY */}
            {activeTab === "parents" && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search parent name or email..."
                                value={parentSearch}
                                onChange={(e) => setParentSearch(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-zinc-400">
                            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600 dark:bg-zinc-800/60 dark:text-zinc-300">
                                <tr>
                                    <th className="px-6 py-4">Parent Name</th>
                                    <th className="px-6 py-4">Login Email</th>
                                    <th className="px-6 py-4">Children Enrolled</th>
                                    <th className="px-6 py-4">Account Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {filteredParents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-400">
                                            No parent accounts found for this school.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredParents.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold text-xs">
                                                        {p.firstName?.substring(0, 1)}{p.lastName?.substring(0, 1)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {p.firstName} {p.lastName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-700 dark:text-zinc-300">
                                                {p.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                    <GraduationCap className="h-3.5 w-3.5" />
                                                    {p.childrenCount ?? (p.children ? p.children.length : 1)} Student(s)
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedParent(p);
                                                        setDirectSubject(`Notice regarding your student at ${school?.name}`);
                                                        setDirectBody("");
                                                        setShowDirectMessageModal(true);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                                >
                                                    <Mail className="h-3.5 w-3.5 text-blue-500" />
                                                    Contact Parent
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: BROADCAST & COMMUNICATION */}
            {activeTab === "broadcast" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                                <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Send School Announcement
                                </h3>
                                <p className="text-xs text-gray-400">
                                    Broadcast notices directly to parent mobile app notification inboxes.
                                </p>
                            </div>
                        </div>

                        {broadcastStatus && (
                            <div className={`p-4 rounded-xl mb-4 text-sm font-semibold ${
                                broadcastStatus.startsWith("✅")
                                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                                    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                            }`}>
                                {broadcastStatus}
                            </div>
                        )}

                        <form onSubmit={handleSendBroadcast} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                                    Target Parent Audience *
                                </label>
                                <select
                                    value={broadcastGrade}
                                    onChange={(e) => setBroadcastGrade(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                >
                                    <option value="all">📢 All Registered Parents ({parents.length} recipients)</option>
                                    <option value="kg">Kindergarten Parents Only</option>
                                    <option value="grade_1">Grade 1 Parents Only</option>
                                    <option value="grade_2">Grade 2 Parents Only</option>
                                    <option value="grade_3">Grade 3 Parents Only</option>
                                    <option value="grade_4">Grade 4 Parents Only</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                                    Announcement Subject *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={broadcastSubject}
                                    onChange={(e) => setBroadcastSubject(e.target.value)}
                                    placeholder="e.g. Term 1 Learning Schedule & Homework Review"
                                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                                    Message Body *
                                </label>
                                <textarea
                                    required
                                    rows={5}
                                    value={broadcastBody}
                                    onChange={(e) => setBroadcastBody(e.target.value)}
                                    placeholder="Write your official school announcement, reminders, or study instructions..."
                                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-500 transition"
                                >
                                    <Send className="h-4 w-4" />
                                    Send Announcement Now
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-2">
                                💡 Quick Announcement Presets
                            </h4>
                            <p className="text-xs text-gray-400 mb-4">Click any preset to prefill your announcement:</p>

                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setBroadcastSubject("Weekly Mini-Game Practice Requirement");
                                        setBroadcastBody("Dear Parents, please ensure your child completes at least 2 sessions of Shape Match and Word Spell this week to reinforce their vocabulary.");
                                    }}
                                    className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-blue-50 dark:bg-zinc-800 text-xs font-medium text-gray-700 dark:text-zinc-200 transition"
                                >
                                    🎮 Weekly Mini-Game Practice
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setBroadcastSubject("Monthly Chapter Story Milestone");
                                        setBroadcastBody("The new Monthly Story Chapter is now unlocked on YeneLearning! Encourage your child to read and practice pronunciation today.");
                                    }}
                                    className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-blue-50 dark:bg-zinc-800 text-xs font-medium text-gray-700 dark:text-zinc-200 transition"
                                >
                                    📖 Story Chapter Unlock Notice
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setBroadcastSubject("End of Term Progress Review");
                                        setBroadcastBody("Teachers have updated student progress benchmarks. Please check your Parent Dashboard analytics for weekly accuracy and hours spent.");
                                    }}
                                    className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-blue-50 dark:bg-zinc-800 text-xs font-medium text-gray-700 dark:text-zinc-200 transition"
                                >
                                    📊 Term Progress Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5: ANALYTICS & GRADE BREAKDOWN */}
            {activeTab === "analytics" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-4">
                                🎓 Grade Level Enrollment
                            </h4>
                            <div className="space-y-3">
                                {["kg", "grade_1", "grade_2", "grade_3", "grade_4"].map((g) => {
                                    const count = students.filter((s) => s.grade === g).length;
                                    const pct = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
                                    return (
                                        <div key={g} className="space-y-1">
                                            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                                <span>{formatGrade(g)}</span>
                                                <span>{count} students ({pct}%)</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-4">
                                🌐 Language Preference
                            </h4>
                            <div className="space-y-3">
                                {["amharic", "english"].map((lang) => {
                                    const count = students.filter((s) => (s.currentLanguage || "amharic") === lang).length;
                                    const pct = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
                                    return (
                                        <div key={lang} className="space-y-1">
                                            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-zinc-300 capitalize">
                                                <span>{lang}</span>
                                                <span>{count} learners ({pct}%)</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                                                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-2">
                                ⏱️ Learning Time Summary
                            </h4>
                            <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-3">
                                {Math.round(students.reduce((sum, s) => sum + (s.totalTimeSpentMinutes || 0), 0) / 60)} hrs
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Total active learning across all enrolled students.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* BULK GENERATE CREDENTIALS MODAL */}
            {showBulkGenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    Bulk Student Credential Generator
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                                    Instantly provision batch accounts for <span className="font-bold text-blue-600">{school?.name}</span> with printable cards & CSV.
                                </p>
                            </div>
                        </div>

                        {!bulkResult ? (
                            <form onSubmit={handleBulkGenerateCredentials} className="mt-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                            Number of Students to Generate *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            max="50"
                                            value={bulkCount}
                                            onChange={(e) => setBulkCount(Number(e.target.value))}
                                            className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                            Student Name Prefix
                                        </label>
                                        <input
                                            type="text"
                                            value={bulkPrefix}
                                            onChange={(e) => setBulkPrefix(e.target.value)}
                                            placeholder="e.g. Student or KG_A"
                                            className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                            Grade Track *
                                        </label>
                                        <select
                                            value={bulkGrade}
                                            onChange={(e) => setBulkGrade(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                        >
                                            <option value="kg">KG</option>
                                            <option value="grade_1">Grade 1</option>
                                            <option value="grade_2">Grade 2</option>
                                            <option value="grade_3">Grade 3</option>
                                            <option value="grade_4">Grade 4</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                            Approximate Age
                                        </label>
                                        <input
                                            type="number"
                                            min="3"
                                            max="15"
                                            value={bulkAge}
                                            onChange={(e) => setBulkAge(Number(e.target.value))}
                                            className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                            Language
                                        </label>
                                        <select
                                            value={bulkLanguage}
                                            onChange={(e) => setBulkLanguage(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                        >
                                            <option value="amharic">Amharic</option>
                                            <option value="english">English</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                                    <p className="font-bold">ℹ️ Automatic Provisioning Details:</p>
                                    <p>• Creates linked student profile and parent access account with unique logins.</p>
                                    <p>• Uses {bulkCount} license(s) from school quota (Available: {(school?.licenseCount || 0) - (school?.usedLicenses || 0)}).</p>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowBulkGenModal(false)}
                                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-blue-500 flex items-center gap-2"
                                    >
                                        <Key className="h-4 w-4" />
                                        Generate {bulkCount} Credentials
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4" /> Generated {bulkResult.length} Student Login Cards
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => downloadCredentialsCSV(bulkResult)}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                        >
                                            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Download CSV
                                        </button>
                                        <button
                                            onClick={() => window.print()}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-blue-500"
                                        >
                                            <Printer className="h-4 w-4" /> Print Cards
                                        </button>
                                    </div>
                                </div>

                                {/* Printable Credential Slips Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto p-1">
                                    {bulkResult.map((c, i) => (
                                        <div
                                            key={i}
                                            className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 dark:border-zinc-700 dark:bg-zinc-800/80 font-mono text-xs space-y-1.5 shadow-sm"
                                        >
                                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-zinc-700 pb-1 font-sans">
                                                <p className="font-bold text-gray-900 dark:text-gray-100">{c.studentName}</p>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                                    {c.grade.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="pt-1"><span className="text-gray-400">Portal:</span> <span className="font-bold text-blue-600 dark:text-blue-400">{domainSlug}.yene.et</span></p>
                                            <p><span className="text-gray-400">Email:</span> <span className="font-bold text-gray-800 dark:text-zinc-200">{c.parentEmail}</span></p>
                                            <p><span className="text-gray-400">Password:</span> <span className="font-bold text-emerald-600 dark:text-emerald-400">{c.parentPassword}</span></p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowBulkGenModal(false)}
                                        className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-blue-500"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ADD TEACHER MODAL */}
            {showAddTeacherModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add School Teacher</h2>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                            Assign an instructor account for <span className="font-bold text-blue-600">{school?.name}</span>.
                        </p>

                        {!teacherResult ? (
                            <form onSubmit={handleAddTeacher} className="mt-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={teacherFirstName}
                                            onChange={(e) => setTeacherFirstName(e.target.value)}
                                            placeholder="e.g. Tigist"
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
                                            value={teacherLastName}
                                            onChange={(e) => setTeacherLastName(e.target.value)}
                                            placeholder="e.g. Alemu"
                                            className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                        Teacher School Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={teacherEmail}
                                        onChange={(e) => setTeacherEmail(e.target.value)}
                                        placeholder={`teacher@${domainSlug}.edu.et`}
                                        className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                        Password (leave blank to auto-generate)
                                    </label>
                                    <input
                                        type="password"
                                        value={teacherPassword}
                                        onChange={(e) => setTeacherPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                    />
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddTeacherModal(false)}
                                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-blue-500"
                                    >
                                        Add Teacher
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-6 space-y-4">
                                <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                                        Teacher Account Added!
                                    </p>
                                    <div className="mt-3 bg-white dark:bg-zinc-800 p-3 rounded-lg font-mono text-xs space-y-1">
                                        <p><span className="text-gray-400">Email:</span> <span className="font-bold text-gray-900 dark:text-gray-100">{teacherResult.email}</span></p>
                                        {teacherResult.password && (
                                            <p><span className="text-gray-400">Password:</span> <span className="font-bold text-blue-600 dark:text-blue-400">{teacherResult.password}</span></p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddTeacherModal(false)}
                                        className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-blue-500"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SEND INDIVIDUAL STUDENT NOTICE MODAL */}
            {showStudentNoticeModal && selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Send Academic Notice: {selectedStudent.name}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                            Delivers an official update directly to parent{" "}
                            <span className="font-bold text-blue-600">{selectedStudent.parent?.email || "linked account"}</span>.
                        </p>

                        {noticeStatus && (
                            <div className={`mt-4 p-3 rounded-xl text-xs font-semibold ${
                                noticeStatus.startsWith("✅")
                                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                                    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                            }`}>
                                {noticeStatus}
                            </div>
                        )}

                        <form onSubmit={handleSendStudentNotice} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={noticeSubject}
                                    onChange={(e) => setNoticeSubject(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                    Notice / Academic Remarks *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={noticeBody}
                                    onChange={(e) => setNoticeBody(e.target.value)}
                                    placeholder="e.g. Excellent progress in Story Reading today! Keep up the daily practice."
                                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                />
                            </div>

                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-zinc-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={includeProgressSummary}
                                    onChange={(e) => setIncludeProgressSummary(e.target.checked)}
                                    className="h-4 w-4 rounded text-blue-600"
                                />
                                Auto-attach live progress summary ({selectedStudent.totalStars || 0} ⭐ stars, {selectedStudent.totalTimeSpentMinutes || 0} mins study time)
                            </label>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowStudentNoticeModal(false)}
                                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-blue-500"
                                >
                                    <Send className="h-4 w-4" />
                                    Send Notice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ENROLL STUDENT MODAL */}
            {showEnrollModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Enroll New Student</h2>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                            Add a student to <span className="font-bold text-blue-600">{school?.name}</span>. This uses 1 license.
                        </p>

                        {!enrollResult ? (
                            <form onSubmit={handleEnrollStudent} className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                        Student Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={enrollName}
                                        onChange={(e) => setEnrollName(e.target.value)}
                                        placeholder="e.g. Almaz Bekele"
                                        className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                            Age *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="3"
                                            max="15"
                                            value={enrollAge}
                                            onChange={(e) => setEnrollAge(Number(e.target.value))}
                                            className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                            Grade Level Track *
                                        </label>
                                        <select
                                            value={enrollGrade}
                                            onChange={(e) => setEnrollGrade(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                        >
                                            <option value="kg">Kindergarten (KG)</option>
                                            <option value="grade_1">Grade 1</option>
                                            <option value="grade_2">Grade 2</option>
                                            <option value="grade_3">Grade 3</option>
                                            <option value="grade_4">Grade 4</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                            Language
                                        </label>
                                        <select
                                            value={enrollLanguage}
                                            onChange={(e) => setEnrollLanguage(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                        >
                                            <option value="amharic">Amharic</option>
                                            <option value="english">English</option>
                                            <option value="oromo">Afaan Oromoo</option>
                                            <option value="geez">Ge'ez</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                            Daily Time Limit (min)
                                        </label>
                                        <input
                                            type="number"
                                            min="10"
                                            max="120"
                                            value={enrollDailyTime}
                                            onChange={(e) => setEnrollDailyTime(Number(e.target.value))}
                                            className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-zinc-800 pt-3">
                                    <p className="text-xs font-bold text-gray-800 dark:text-zinc-200 mb-2">
                                        Parent Contact & Account Provisioning
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                                Parent Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={enrollParentName}
                                                onChange={(e) => setEnrollParentName(e.target.value)}
                                                placeholder="e.g. Bekele Mekonnen"
                                                className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                                Parent Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={enrollParentEmail}
                                                onChange={(e) => setEnrollParentEmail(e.target.value)}
                                                placeholder="bekele@parent.et"
                                                className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowEnrollModal(false)}
                                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-blue-500"
                                    >
                                        Enroll Student
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-6 space-y-4">
                                <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                                        🎉 Student Enrolled Successfully!
                                    </p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                        {enrollResult.student.name} is now registered under {formatGrade(enrollResult.student.grade)}.
                                    </p>

                                    {enrollResult.credentials && (
                                        <div className="mt-3 bg-white dark:bg-zinc-800 p-3 rounded-lg font-mono text-xs space-y-1">
                                            <p className="font-bold text-gray-700 dark:text-zinc-200 mb-1">Generated Parent Login:</p>
                                            <p><span className="text-gray-400">Email:</span> <span className="font-bold text-gray-900 dark:text-gray-100">{enrollResult.credentials.email}</span></p>
                                            <p><span className="text-gray-400">Password:</span> <span className="font-bold text-blue-600 dark:text-blue-400">{enrollResult.credentials.password}</span></p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowEnrollModal(false)}
                                        className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-blue-500"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* EDIT STUDENT / CHANGE GRADE MODAL */}
            {showEditStudentModal && selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Update Student: {selectedStudent.name}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                            Modify grade level track, age, or daily learning time limits.
                        </p>

                        <form onSubmit={handleUpdateStudent} className="mt-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                    Student Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                        Grade Track (Curriculum Track) *
                                    </label>
                                    <select
                                        value={editGrade}
                                        onChange={(e) => setEditGrade(e.target.value)}
                                        className="mt-1 w-full font-bold text-blue-600 rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                                    >
                                        <option value="kg">Kindergarten (KG)</option>
                                        <option value="grade_1">Grade 1</option>
                                        <option value="grade_2">Grade 2</option>
                                        <option value="grade_3">Grade 3</option>
                                        <option value="grade_4">Grade 4</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        min="3"
                                        max="15"
                                        value={editAge}
                                        onChange={(e) => setEditAge(Number(e.target.value))}
                                        className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                        Language
                                    </label>
                                    <select
                                        value={editLanguage}
                                        onChange={(e) => setEditLanguage(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                    >
                                        <option value="amharic">Amharic</option>
                                        <option value="english">English</option>
                                        <option value="oromo">Afaan Oromoo</option>
                                        <option value="geez">Ge'ez</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                        Daily Time Limit (min)
                                    </label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="180"
                                        value={editDailyTime}
                                        onChange={(e) => setEditDailyTime(Number(e.target.value))}
                                        className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditStudentModal(false)}
                                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-blue-500"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DIRECT MESSAGE MODAL */}
            {showDirectMessageModal && selectedParent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Contact Parent: {selectedParent.firstName} {selectedParent.lastName}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                            Send a direct notification to {selectedParent.email} via the in-app message inbox.
                        </p>

                        <form onSubmit={handleSendDirectMessage} className="mt-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={directSubject}
                                    onChange={(e) => setDirectSubject(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                    Message Body *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={directBody}
                                    onChange={(e) => setDirectBody(e.target.value)}
                                    placeholder="Write your private message or update for this parent..."
                                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDirectMessageModal(false)}
                                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-blue-500"
                                >
                                    <Send className="h-4 w-4" />
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
