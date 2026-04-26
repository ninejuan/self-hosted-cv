import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { Toaster } from "sonner";
import { Sidebar, SidebarToggle } from "@/components/admin/sidebar";
import { UpdateBanner } from "@/components/admin/update-banner";
import { adminFetch, clearCsrfToken } from "@/lib/admin-api";
import type { UpdateCheckResponse } from "@/types/admin";
import { ErrorBoundaryView } from "@/components/error-boundary";
import type { Route } from "./+types/admin";

export function meta() {
    return [{ title: "Admin — Self-Hosted CV" }];
}

export default function AdminLayout() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [authed, setAuthed] = useState<boolean | null>(null);
    const [updateData, setUpdateData] = useState<UpdateCheckResponse | null>(null);

    useEffect(() => {
        adminFetch("/api/auth/me")
            .then(() => setAuthed(true))
            .catch(() => {
                setAuthed(false);
                navigate("/login", { replace: true });
            });
    }, [navigate]);

    useEffect(() => {
        if (!authed) return;
        adminFetch<UpdateCheckResponse>("/api/admin/update-check")
            .then(setUpdateData)
            .catch(() => {});
    }, [authed]);

    async function handleLogout() {
        try {
            await adminFetch("/api/auth/logout", { method: "POST" });
        } catch {
        }
        clearCsrfToken();
        navigate("/login", { replace: true });
    }

    if (authed === null) {
        return (
            <div
                className="flex min-h-screen items-center justify-center gap-3"
                style={{ backgroundColor: "var(--color-bg)" }}
            >
                <div className="size-6 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
                <span className="text-[13px] text-[var(--color-text-muted)]">Loading admin…</span>
            </div>
        );
    }

    if (!authed) return null;

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onLogout={handleLogout}
            />

            <div className="flex flex-1 flex-col min-w-0 lg:ml-60">
                <header className="flex h-14 items-center gap-3 border-b border-[var(--color-border)] px-4 lg:px-6">
                    <SidebarToggle onClick={() => setSidebarOpen(true)} />
                    <span className="text-[13px] font-medium text-[var(--color-text-muted)] lg:hidden">
                        Admin
                    </span>
                </header>

                <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
                    <div className="mx-auto max-w-3xl">
                        {updateData && <UpdateBanner data={updateData} />}
                        <div className={updateData?.update_available ? "mt-4" : ""}>
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>

            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: "var(--color-bg)",
                        color: "var(--color-text-primary)",
                        border: "1px solid var(--color-border)",
                        fontFamily: "var(--font-primary)",
                        fontSize: "13px",
                    },
                }}
            />
        </div>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    return <ErrorBoundaryView error={error} title="Admin panel failed to load" />;
}
