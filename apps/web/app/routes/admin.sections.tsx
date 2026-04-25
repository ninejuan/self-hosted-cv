import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-api";
import { SortableList } from "@/components/admin/sortable-list";
import { toast } from "sonner";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionConfig } from "@/types/admin";

export function meta() {
    return [{ title: "Sections — Self-Hosted CV" }];
}

export default function SectionsReorder() {
    const [sections, setSections] = useState<SectionConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        adminFetch<SectionConfig[]>("/api/admin/sections")
            .then(setSections)
            .catch(() => toast.error("Failed to load sections"))
            .finally(() => setLoading(false));
    }, []);

    function toggleVisibility(id: string) {
        setSections((prev) =>
            prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)),
        );
    }

    async function handleSave() {
        setSaving(true);
        try {
            await adminFetch("/api/admin/sections/reorder", {
                method: "PUT",
                body: {
                    sections: sections.map((s, i) => ({
                        id: s.id,
                        order: i,
                        visible: s.visible,
                    })),
                },
            });
            toast.success("Sections updated");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Save failed");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="size-5 animate-spin text-[var(--color-text-muted)]" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">
                        Sections
                    </h1>
                    <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                        Drag to reorder, toggle visibility
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium transition-opacity",
                        "bg-[var(--color-accent)] text-[#111]",
                        saving ? "opacity-60" : "hover:opacity-80",
                    )}
                >
                    {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                    Save
                </button>
            </div>

            <div className="mt-6">
                <SortableList
                    items={sections}
                    onReorder={setSections}
                    renderItem={(section) => (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
                                    {section.title}
                                </p>
                                <p className="text-[12px] text-[var(--color-text-muted)]">
                                    {section.type}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => toggleVisibility(section.id)}
                                className={cn(
                                    "rounded-md p-1.5 transition-colors",
                                    section.visible
                                        ? "text-[var(--color-accent)]"
                                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
                                )}
                                aria-label={section.visible ? "Hide section" : "Show section"}
                            >
                                {section.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                            </button>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}
