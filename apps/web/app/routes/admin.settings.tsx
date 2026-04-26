import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-api";
import { toast } from "sonner";
import { Loader2, Trash2, Shield, Info, Globe, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface SiteSettings {
    siteTitle: string;
    siteDescription: string;
    faviconUrl: string;
    ogTitle: string;
    ogDescription: string;
    ogImageUrl: string;
    themeColor: string;
    googleAnalyticsId: string;
    customHeadScripts: string;
    customCss: string;
}

const EMPTY_SITE: SiteSettings = {
    siteTitle: "",
    siteDescription: "",
    faviconUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: "",
    themeColor: "#A8E765",
    googleAnalyticsId: "",
    customHeadScripts: "",
    customCss: "",
};

function Field({ label, value, onChange, placeholder, type = "text" }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: "text" | "textarea" | "color";
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--color-text-muted)]">{label}</label>
            {type === "textarea" ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
                />
            ) : type === "color" ? (
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={value || "#A8E765"}
                        onChange={(e) => onChange(e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded border border-[var(--color-border)]"
                    />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="#A8E765"
                        className="flex-1 rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
                    />
                </div>
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
                />
            )}
        </div>
    );
}

export function meta() {
    return [{ title: "Settings — Self-Hosted CV" }];
}

export default function SettingsPage() {
    const [clearing, setClearing] = useState(false);
    const [version, setVersion] = useState<string>("");
    const [site, setSite] = useState<SiteSettings>(EMPTY_SITE);
    const [savingSite, setSavingSite] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        adminFetch<{ version: string }>("/api/admin/settings")
            .then((data) => setVersion(data.version))
            .catch(() => {});

        adminFetch<SiteSettings>("/api/admin/settings/site")
            .then((data) => { setSite({ ...EMPTY_SITE, ...data }); setLoaded(true); })
            .catch(() => setLoaded(true));
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

    async function handleSaveSite(e: React.FormEvent) {
        e.preventDefault();
        setSavingSite(true);
        try {
            const updated = await adminFetch<SiteSettings>("/api/admin/settings/site", {
                method: "PUT",
                body: site,
            });
            setSite({ ...EMPTY_SITE, ...updated });
            toast.success("Site settings saved");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Save failed");
        } finally {
            setSavingSite(false);
        }
    }

    function updateSite(key: keyof SiteSettings, value: string) {
        setSite((prev) => ({ ...prev, [key]: value }));
    }

    return (
        <div>
            <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">Settings</h1>
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                Application configuration
            </p>

            <div className="mt-6 flex flex-col gap-6">
                <form onSubmit={handleSaveSite}>
                    <section className="rounded-xl border border-[var(--color-border)] p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Globe className="size-4 text-[var(--color-text-muted)]" />
                                <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                                    Site Settings
                                </h2>
                            </div>
                            <button
                                type="submit"
                                disabled={savingSite || !loaded}
                                className={cn(
                                    "inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-[13px] font-medium text-[#052D0A] transition-opacity",
                                    (savingSite || !loaded) && "opacity-60",
                                )}
                            >
                                {savingSite ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                                Save
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field label="Site Title" value={site.siteTitle} onChange={(v) => updateSite("siteTitle", v)} placeholder="My CV" />
                                <Field label="Site Description" value={site.siteDescription} onChange={(v) => updateSite("siteDescription", v)} placeholder="Personal portfolio" />
                            </div>

                            <Field label="Favicon URL" value={site.faviconUrl} onChange={(v) => updateSite("faviconUrl", v)} placeholder="https://..." />

                            <div className="mt-2 border-t border-[var(--color-border)] pt-4">
                                <p className="mb-3 text-[12px] font-medium text-[var(--color-text-muted)]">Open Graph</p>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Field label="OG Title" value={site.ogTitle} onChange={(v) => updateSite("ogTitle", v)} placeholder="Defaults to Site Title" />
                                    <Field label="OG Description" value={site.ogDescription} onChange={(v) => updateSite("ogDescription", v)} placeholder="Defaults to Site Description" />
                                </div>
                                <div className="mt-4">
                                    <Field label="OG Image URL" value={site.ogImageUrl} onChange={(v) => updateSite("ogImageUrl", v)} placeholder="https://..." />
                                </div>
                            </div>

                            <div className="mt-2 border-t border-[var(--color-border)] pt-4">
                                <p className="mb-3 text-[12px] font-medium text-[var(--color-text-muted)]">Appearance</p>
                                <Field label="Theme Color" value={site.themeColor} onChange={(v) => updateSite("themeColor", v)} type="color" />
                            </div>

                            <div className="mt-2 border-t border-[var(--color-border)] pt-4">
                                <p className="mb-3 text-[12px] font-medium text-[var(--color-text-muted)]">Integrations</p>
                                <Field label="Google Analytics ID" value={site.googleAnalyticsId} onChange={(v) => updateSite("googleAnalyticsId", v)} placeholder="G-XXXXXXXXXX" />
                            </div>

                            <div className="mt-2 border-t border-[var(--color-border)] pt-4">
                                <p className="mb-3 text-[12px] font-medium text-[var(--color-text-muted)]">Advanced</p>
                                <div className="flex flex-col gap-4">
                                    <Field label="Custom CSS" value={site.customCss} onChange={(v) => updateSite("customCss", v)} type="textarea" placeholder="body { ... }" />
                                    <Field label="Custom Head Scripts" value={site.customHeadScripts} onChange={(v) => updateSite("customHeadScripts", v)} type="textarea" placeholder="<script>...</script>" />
                                </div>
                            </div>
                        </div>
                    </section>
                </form>

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
