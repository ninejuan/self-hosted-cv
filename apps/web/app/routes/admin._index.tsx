import { useState, useEffect } from "react";
import { Link } from "react-router";
import { adminFetch } from "@/lib/admin-api";
import {
    Briefcase,
    PenLine,
    Mic2,
    FolderKanban,
    GraduationCap,
    Contact,
    User,
    ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
    profile?: { name: string; updatedAt?: string };
    counts: Record<string, number>;
}

const SECTION_LINKS = [
    { to: "/admin/profile", label: "Profile", icon: User },
    { to: "/admin/experience", label: "Experience", icon: Briefcase },
    { to: "/admin/writing", label: "Writing", icon: PenLine },
    { to: "/admin/speaking", label: "Speaking", icon: Mic2 },
    { to: "/admin/projects", label: "Projects", icon: FolderKanban },
    { to: "/admin/education", label: "Education", icon: GraduationCap },
    { to: "/admin/contacts", label: "Contacts", icon: Contact },
];

export function meta() {
    return [{ title: "Dashboard — Self-Hosted CV" }];
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);

    useEffect(() => {
        adminFetch<DashboardData>("/api/admin/dashboard")
            .then(setData)
            .catch(() => setData({ counts: {} }));
    }, []);

    return (
        <div>
            <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">
                Dashboard
            </h1>
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                {data?.profile?.name
                    ? `Welcome back, ${data.profile.name}`
                    : "Manage your CV content"}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {data === null ? SECTION_LINKS.map(({ to }) => (
                    <div key={to} className="rounded-xl border border-[var(--color-border)] px-4 py-3.5">
                        <div className="flex items-center gap-3">
                            <Skeleton className="size-9 rounded-lg" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="mt-2 h-3 w-16" />
                            </div>
                        </div>
                    </div>
                )) : SECTION_LINKS.map(({ to, label, icon: Icon }) => (
                    <Link
                        key={to}
                        to={to}
                        className={cn(
                            "group flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3.5 transition-colors",
                            "hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5",
                        )}
                    >
                        <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--color-tag-bg)]">
                            <Icon className="size-4 text-[var(--color-text-muted)]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
                                {label}
                            </p>
                            {data?.counts[label.toLowerCase()] !== undefined && (
                                <p className="text-[12px] text-[var(--color-text-muted)] tabular-nums">
                                    {data.counts[label.toLowerCase()]} items
                                </p>
                            )}
                        </div>
                        <ArrowRight className="size-4 text-[var(--color-text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
