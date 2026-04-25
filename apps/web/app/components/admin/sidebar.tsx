import { cn } from "@/lib/utils";
import { NavLink } from "react-router";
import {
    LayoutDashboard,
    User,
    Layers,
    Briefcase,
    PenLine,
    Mic2,
    FolderKanban,
    GraduationCap,
    Contact,
    Share2,
    Settings,
    ScrollText,
    LogOut,
    X,
    Menu,
} from "lucide-react";

const NAV_ITEMS = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/profile", label: "Profile", icon: User },
    { to: "/admin/sections", label: "Sections", icon: Layers },
    { to: "/admin/experience", label: "Experience", icon: Briefcase },
    { to: "/admin/writing", label: "Writing", icon: PenLine },
    { to: "/admin/speaking", label: "Speaking", icon: Mic2 },
    { to: "/admin/projects", label: "Projects", icon: FolderKanban },
    { to: "/admin/education", label: "Education", icon: GraduationCap },
    { to: "/admin/contacts", label: "Contacts", icon: Contact },
    { to: "/admin/linkedin", label: "LinkedIn Import", icon: Share2 },
    { to: "/admin/settings", label: "Settings", icon: Settings },
    { to: "/admin/audit-logs", label: "Audit Log", icon: ScrollText },
] as const;

interface SidebarProps {
    open: boolean;
    onClose: () => void;
    onLogout: () => void;
}

export function Sidebar({ open, onClose, onLogout }: SidebarProps) {
    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                    onClick={onClose}
                    aria-hidden
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-[var(--color-bg)] transition-transform duration-200 lg:static lg:translate-x-0",
                    "border-[var(--color-border)]",
                    open ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex h-14 items-center justify-between border-b border-[var(--color-border)] px-4">
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Admin
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-2 py-3">
                    <ul className="flex flex-col gap-0.5">
                        {NAV_ITEMS.map(({ to, label, icon: Icon, ...rest }) => (
                            <li key={to}>
                                <NavLink
                                    to={to}
                                    end={"end" in rest}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        cn(
                                            "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                                            isActive
                                                ? "bg-[var(--color-accent)]/12 text-[var(--color-accent)]"
                                                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-tag-bg)] hover:text-[var(--color-text-primary)]",
                                        )
                                    }
                                >
                                    <Icon className="size-4 shrink-0" />
                                    {label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="border-t border-[var(--color-border)] px-2 py-3">
                    <button
                        type="button"
                        onClick={onLogout}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-tag-bg)] hover:text-[var(--color-text-primary)]"
                    >
                        <LogOut className="size-4 shrink-0" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-md p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] lg:hidden"
            aria-label="Open sidebar"
        >
            <Menu className="size-5" />
        </button>
    );
}
