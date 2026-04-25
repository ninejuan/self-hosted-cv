import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-api";
import { SectionEditor } from "@/components/admin/section-editor";
import { TextInput, DateInput } from "@/components/admin/form-fields";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Speaking } from "@/types/admin";
import { AdminListSkeleton } from "@/components/ui/skeleton";

export function meta() {
    return [{ title: "Speaking — Self-Hosted CV" }];
}

function SpeakingForm({
    item,
    onSave,
    onCancel,
}: {
    item: Speaking | null;
    onSave: (data: Omit<Speaking, "id"> | Speaking) => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState({
        title: item?.title ?? "",
        url: item?.url ?? "",
        event: item?.event ?? "",
        location: item?.location ?? "",
        date: item?.date ?? "",
    });

    function set(field: string, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (item) {
            onSave({ ...item, ...form });
        } else {
            onSave(form as Omit<Speaking, "id">);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextInput label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} required />
            <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Event" value={form.event} onChange={(e) => set("event", e.target.value)} />
                <TextInput label="Location" value={form.location} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="URL" value={form.url} onChange={(e) => set("url", e.target.value)} type="url" placeholder="https://" />
                <DateInput label="Date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
            </div>
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

export default function SpeakingEditor() {
    const [items, setItems] = useState<Speaking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminFetch<Speaking[]>("/api/admin/speaking")
            .then(setItems)
            .catch(() => toast.error("Failed to load speaking"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <AdminListSkeleton />;
    }

    return (
        <SectionEditor<Speaking>
            title="Speaking"
            apiPath="/api/admin/speaking"
            items={items}
            onItemsChange={setItems}
            createEmpty={() => ({ title: "", date: "" } as Omit<Speaking, "id">)}
            renderListItem={(item) => (
                <div>
                    <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{item.title}</p>
                    <p className="text-[12px] text-[var(--color-text-muted)]">
                        {item.event && `${item.event} · `}{item.date}
                    </p>
                </div>
            )}
            renderForm={(item, onSave, onCancel) => (
                <SpeakingForm item={item} onSave={onSave} onCancel={onCancel} />
            )}
        />
    );
}
