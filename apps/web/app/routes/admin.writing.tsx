import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-api";
import { SectionEditor } from "@/components/admin/section-editor";
import { TextInput, TextArea, DateInput } from "@/components/admin/form-fields";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Writing } from "@/types/admin";
import { AdminListSkeleton } from "@/components/ui/skeleton";

export function meta() {
    return [{ title: "Writing — Self-Hosted CV" }];
}

function WritingForm({
    item,
    onSave,
    onCancel,
}: {
    item: Writing | null;
    onSave: (data: Omit<Writing, "id"> | Writing) => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState({
        title: item?.title ?? "",
        url: item?.url ?? "",
        date: item?.date ?? "",
        collaborators: item?.collaborators ?? "",
        description: item?.description ?? "",
        readTime: item?.readTime ?? "",
    });

    function set(field: string, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (item) {
            onSave({ ...item, ...form });
        } else {
            onSave(form as Omit<Writing, "id">);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextInput label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} required />
            <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="URL" value={form.url} onChange={(e) => set("url", e.target.value)} type="url" placeholder="https://" />
                <DateInput label="Date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Collaborators" value={form.collaborators} onChange={(e) => set("collaborators", e.target.value)} />
                <TextInput label="Read Time" value={form.readTime} onChange={(e) => set("readTime", e.target.value)} placeholder="5 min" />
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

export default function WritingEditor() {
    const [items, setItems] = useState<Writing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminFetch<Writing[]>("/api/admin/writing")
            .then(setItems)
            .catch(() => toast.error("Failed to load writing"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <AdminListSkeleton />;
    }

    return (
        <SectionEditor<Writing>
            title="Writing"
            apiPath="/api/admin/writing"
            items={items}
            onItemsChange={setItems}
            createEmpty={() => ({ title: "", date: "" } as Omit<Writing, "id">)}
            renderListItem={(item) => (
                <div>
                    <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{item.title}</p>
                    <p className="text-[12px] text-[var(--color-text-muted)]">{item.date}</p>
                </div>
            )}
            renderForm={(item, onSave, onCancel) => (
                <WritingForm item={item} onSave={onSave} onCancel={onCancel} />
            )}
        />
    );
}
