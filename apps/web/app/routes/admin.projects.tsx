import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-api";
import { SectionEditor } from "@/components/admin/section-editor";
import { TextInput, TextArea, DateInput } from "@/components/admin/form-fields";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SideProject } from "@/types/admin";
import { AdminListSkeleton } from "@/components/ui/skeleton";

export function meta() {
    return [{ title: "Projects — Self-Hosted CV" }];
}

function ProjectForm({
    item,
    onSave,
    onCancel,
}: {
    item: SideProject | null;
    onSave: (data: Omit<SideProject, "id"> | SideProject) => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState({
        name: item?.name ?? "",
        url: item?.url ?? "",
        description: item?.description ?? "",
        startDate: item?.startDate ?? "",
        endDate: item?.endDate ?? "",
    });

    function set(field: string, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (item) {
            onSave({ ...item, ...form });
        } else {
            onSave(form as Omit<SideProject, "id">);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
                <TextInput label="URL" value={form.url} onChange={(e) => set("url", e.target.value)} type="url" placeholder="https://" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <DateInput label="Start Date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} required />
                <DateInput label="End Date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
            </div>
            <TextArea label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onCancel} className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-tag-bg)]">
                    Cancel
                </button>
                <button type="submit" className={cn("rounded-lg px-3 py-1.5 text-[13px] font-medium transition-opacity", "bg-[var(--color-accent)] text-[#111] hover:opacity-80")}>
                    Save
                </button>
            </div>
        </form>
    );
}

export default function ProjectsEditor() {
    const [items, setItems] = useState<SideProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminFetch<SideProject[]>("/api/admin/projects")
            .then(setItems)
            .catch(() => toast.error("Failed to load projects"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <AdminListSkeleton />;
    }

    return (
        <SectionEditor<SideProject>
            title="Project"
            apiPath="/api/admin/projects"
            items={items}
            onItemsChange={setItems}
            createEmpty={() => ({ name: "", startDate: "" } as Omit<SideProject, "id">)}
            renderListItem={(item) => (
                <div>
                    <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{item.name}</p>
                    <p className="text-[12px] text-[var(--color-text-muted)]">
                        {item.startDate} — {item.endDate || "Present"}
                    </p>
                </div>
            )}
            renderForm={(item, onSave, onCancel) => (
                <ProjectForm item={item} onSave={onSave} onCancel={onCancel} />
            )}
        />
    );
}
