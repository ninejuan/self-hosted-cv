import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-api";
import { SectionEditor } from "@/components/admin/section-editor";
import { TextInput } from "@/components/admin/form-fields";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SocialLink } from "@/types/admin";
import { AdminListSkeleton } from "@/components/ui/skeleton";

interface ContactItem extends SocialLink {
    id: string;
}

export function meta() {
    return [{ title: "Contacts — Self-Hosted CV" }];
}

function ContactForm({
    item,
    onSave,
    onCancel,
}: {
    item: ContactItem | null;
    onSave: (data: Omit<ContactItem, "id"> | ContactItem) => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState({
        platform: item?.platform ?? "",
        url: item?.url ?? "",
        username: item?.username ?? "",
    });

    function set(field: string, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (item) {
            onSave({ ...item, ...form });
        } else {
            onSave(form as Omit<ContactItem, "id">);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextInput label="Platform" value={form.platform} onChange={(e) => set("platform", e.target.value)} required placeholder="GitHub, Twitter, Email..." />
            <TextInput label="URL" value={form.url} onChange={(e) => set("url", e.target.value)} required placeholder="https://..." />
            <TextInput label="Username / Label" value={form.username} onChange={(e) => set("username", e.target.value)} required />
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

export default function ContactsEditor() {
    const [items, setItems] = useState<ContactItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminFetch<ContactItem[]>("/api/admin/contacts")
            .then(setItems)
            .catch(() => toast.error("Failed to load contacts"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <AdminListSkeleton />;
    }

    return (
        <SectionEditor<ContactItem>
            title="Contact"
            apiPath="/api/admin/contacts"
            items={items}
            onItemsChange={setItems}
            createEmpty={() => ({ platform: "", url: "", username: "" } as Omit<ContactItem, "id">)}
            renderListItem={(item) => (
                <div>
                    <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{item.platform}</p>
                    <p className="text-[12px] text-[var(--color-text-muted)]">{item.username}</p>
                </div>
            )}
            renderForm={(item, onSave, onCancel) => (
                <ContactForm item={item} onSave={onSave} onCancel={onCancel} />
            )}
        />
    );
}
