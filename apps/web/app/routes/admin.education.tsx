import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-api";
import { SectionEditor } from "@/components/admin/section-editor";
import { TextInput, DateInput } from "@/components/admin/form-fields";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Education } from "@/types/admin";
import { AdminListSkeleton } from "@/components/ui/skeleton";

export function meta() {
    return [{ title: "Education — Self-Hosted CV" }];
}

function EducationForm({
    item,
    onSave,
    onCancel,
}: {
    item: Education | null;
    onSave: (data: Omit<Education, "id"> | Education) => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState({
        degree: item?.degree ?? "",
        institution: item?.institution ?? "",
        institutionUrl: item?.institutionUrl ?? "",
        location: item?.location ?? "",
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
            onSave(form as Omit<Education, "id">);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Degree" value={form.degree} onChange={(e) => set("degree", e.target.value)} required />
                <TextInput label="Institution" value={form.institution} onChange={(e) => set("institution", e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Institution URL" value={form.institutionUrl} onChange={(e) => set("institutionUrl", e.target.value)} type="url" placeholder="https://" />
                <TextInput label="Location" value={form.location} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <DateInput label="Start Date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} required />
                <DateInput label="End Date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
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

export default function EducationEditor() {
    const [items, setItems] = useState<Education[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminFetch<Education[]>("/api/admin/educations")
            .then(setItems)
            .catch(() => toast.error("Failed to load education"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <AdminListSkeleton />;
    }

    return (
        <SectionEditor<Education>
            title="Education"
            apiPath="/api/admin/educations"
            items={items}
            onItemsChange={setItems}
            createEmpty={() => ({ degree: "", institution: "", startDate: "" } as Omit<Education, "id">)}
            renderListItem={(item) => (
                <div>
                    <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{item.degree}</p>
                    <p className="text-[12px] text-[var(--color-text-muted)]">
                        {item.institution} · {item.startDate} — {item.endDate || "Present"}
                    </p>
                </div>
            )}
            renderForm={(item, onSave, onCancel) => (
                <EducationForm item={item} onSave={onSave} onCancel={onCancel} />
            )}
        />
    );
}
