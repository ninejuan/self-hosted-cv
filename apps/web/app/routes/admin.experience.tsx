import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-api";
import { SectionEditor } from "@/components/admin/section-editor";
import { TextInput, TextArea, DateInput } from "@/components/admin/form-fields";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkExperience } from "@/types/admin";

export function meta() {
    return [{ title: "Experience — Self-Hosted CV" }];
}

function ExperienceForm({
    item,
    onSave,
    onCancel,
}: {
    item: WorkExperience | null;
    onSave: (data: Omit<WorkExperience, "id"> | WorkExperience) => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState({
        role: item?.role ?? "",
        company: item?.company ?? "",
        companyUrl: item?.companyUrl ?? "",
        location: item?.location ?? "",
        startDate: item?.startDate ?? "",
        endDate: item?.endDate ?? "",
        description: item?.description ?? "",
    });

    function set(field: string, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (item) {
            onSave({ ...item, ...form });
        } else {
            onSave(form as Omit<WorkExperience, "id">);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Role" value={form.role} onChange={(e) => set("role", e.target.value)} required />
                <TextInput label="Company" value={form.company} onChange={(e) => set("company", e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Company URL" value={form.companyUrl} onChange={(e) => set("companyUrl", e.target.value)} type="url" placeholder="https://" />
                <TextInput label="Location" value={form.location} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <DateInput label="Start Date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} required />
                <DateInput label="End Date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
            </div>
            <TextArea label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} />
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

export default function ExperienceEditor() {
    const [items, setItems] = useState<WorkExperience[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminFetch<WorkExperience[]>("/api/admin/experience")
            .then(setItems)
            .catch(() => toast.error("Failed to load experience"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="size-5 animate-spin text-[var(--color-text-muted)]" />
            </div>
        );
    }

    return (
        <SectionEditor<WorkExperience>
            title="Experience"
            apiPath="/api/admin/experience"
            items={items}
            onItemsChange={setItems}
            createEmpty={() => ({ role: "", company: "", startDate: "" } as Omit<WorkExperience, "id">)}
            renderListItem={(item) => (
                <div>
                    <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
                        {item.role} <span className="text-[var(--color-text-muted)]">at</span> {item.company}
                    </p>
                    <p className="text-[12px] text-[var(--color-text-muted)]">
                        {item.startDate} — {item.endDate || "Present"}
                    </p>
                </div>
            )}
            renderForm={(item, onSave, onCancel) => (
                <ExperienceForm item={item} onSave={onSave} onCancel={onCancel} />
            )}
        />
    );
}
