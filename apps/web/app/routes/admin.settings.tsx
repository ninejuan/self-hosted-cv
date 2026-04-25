import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-api";
import { toast } from "sonner";
import { Loader2, Trash2, Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function meta() {
    return [{ title: "Settings — Self-Hosted CV" }];
}

export default function SettingsPage() {
    const [clearing, setClearing] = useState(false);
    const [version, setVersion] = useState<string>("");

    useEffect(() => {
        adminFetch<{ version: string }>("/api/admin/settings")
            .then((data) => setVersion(data.version))
            .catch(() => {});
    }, []);

    async function handleClearCache() {
        setClearing(true);
        try {
            await adminFetch("/api/admin/cache/clear", { method: "POST" });
            toast.success("Cache cleared");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to clear cache");
        } finally {
            setClearing(false);
        }
    }

    return (
        <div>
            <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">Settings</h1>
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                Application configuration
            </p>

            <div className="mt-6 flex flex-col gap-6">
                <section className="rounded-xl border border-[var(--color-border)] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="size-4 text-[var(--color-text-muted)]" />
                        <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                            Two-Factor Authentication
                        </h2>
                    </div>
                    <div className="rounded-lg bg-[var(--color-tag-bg)] px-4 py-3">
                        <p className="text-[13px] text-[var(--color-text-muted)]">
                            2FA setup will be available in a future update.
                        </p>
                    </div>
                </section>

                <section className="rounded-xl border border-[var(--color-border)] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Trash2 className="size-4 text-[var(--color-text-muted)]" />
                        <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                            Cache
                        </h2>
                    </div>
                    <p className="mb-3 text-[13px] text-[var(--color-text-secondary)]">
                        Clear the server-side cache to reflect recent changes immediately.
                    </p>
                    <button
                        type="button"
                        onClick={handleClearCache}
                        disabled={clearing}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[13px] font-medium transition-colors",
                            "text-[var(--color-text-secondary)] hover:bg-[var(--color-tag-bg)]",
                            clearing && "opacity-60",
                        )}
                    >
                        {clearing && <Loader2 className="size-3.5 animate-spin" />}
                        Clear Cache
                    </button>
                </section>

                <section className="rounded-xl border border-[var(--color-border)] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="size-4 text-[var(--color-text-muted)]" />
                        <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                            App Info
                        </h2>
                    </div>
                    <div className="flex flex-col gap-2 text-[13px]">
                        <div className="flex items-center justify-between">
                            <span className="text-[var(--color-text-muted)]">Version</span>
                            <span className="font-mono text-[12px] text-[var(--color-text-primary)]">
                                {version || "—"}
                            </span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
