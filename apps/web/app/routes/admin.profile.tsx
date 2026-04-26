import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-api";
import { TextInput, TextArea, SelectField } from "@/components/admin/form-fields";
import { ImageUploader } from "@/components/admin/image-uploader";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminProfile } from "@/types/admin";
import { Skeleton } from "@/components/ui/skeleton";

export function meta() {
    return [{ title: "Profile — Self-Hosted CV" }];
}

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "archived", label: "Archived" },
];

const THEME_OPTIONS = [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
];

export default function ProfileEditor() {
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        adminFetch<AdminProfile>("/api/admin/profile")
            .then(setProfile)
            .catch(() => toast.error("Failed to load profile"));
    }, []);

    function update(field: keyof AdminProfile, value: string) {
        if (!profile) return;
        setProfile({ ...profile, [field]: value });
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!profile) return;
        setSaving(true);
        try {
            const { name, profession, location, bio, avatarUrl, slug, status, theme } = profile;
            await adminFetch("/api/admin/profile", {
                method: "PUT",
                body: {
                    name,
                    profession,
                    location,
                    website: profile.websiteUrl ?? null,
                    bio,
                    avatarUrl,
                    slug,
                    metaTitle: profile.meta_title ?? null,
                    metaDescription: profile.meta_description ?? null,
                    status,
                    theme,
                },
            });
            toast.success("Profile saved");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Save failed");
        } finally {
            setSaving(false);
        }
    }

    if (!profile) {
        return (
            <div>
                <Skeleton className="h-7 w-28" />
                <Skeleton className="mt-2 h-4 w-48" />
                <div className="mt-6 flex flex-col gap-5">
                    <Skeleton className="size-24 rounded-2xl" />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Skeleton className="h-11 w-full" />
                        <Skeleton className="h-11 w-full" />
                    </div>
                    <Skeleton className="h-28 w-full" />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Skeleton className="h-11 w-full" />
                        <Skeleton className="h-11 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">Profile</h1>
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                Edit your personal information
            </p>

            <form onSubmit={handleSave} className="mt-6 flex flex-col gap-5">
                <ImageUploader
                    value={profile.avatarUrl}
                    onChange={(url) => update("avatarUrl", url)}
                    purpose="avatar"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput
                        label="Name"
                        value={profile.name}
                        onChange={(e) => update("name", e.target.value)}
                        required
                    />
                    <TextInput
                        label="Profession"
                        value={profile.profession}
                        onChange={(e) => update("profession", e.target.value)}
                        required
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput
                        label="Location"
                        value={profile.location}
                        onChange={(e) => update("location", e.target.value)}
                    />
                    <TextInput
                        label="Website URL"
                        value={profile.websiteUrl ?? ""}
                        onChange={(e) => update("websiteUrl", e.target.value)}
                        type="url"
                        placeholder="https://"
                    />
                </div>

                <TextArea
                    label="Bio"
                    value={profile.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    rows={4}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField
                        label="Status"
                        options={STATUS_OPTIONS}
                        value={profile.status ?? "active"}
                        onChange={(e) => update("status", e.target.value)}
                    />
                    <SelectField
                        label="Theme"
                        options={THEME_OPTIONS}
                        value={profile.theme ?? "system"}
                        onChange={(e) => update("theme", e.target.value)}
                    />
                </div>

                <div className="mt-2 border-t border-[var(--color-border)] pt-5">
                    <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        SEO
                    </p>
                    <div className="flex flex-col gap-4">
                        <TextInput
                            label="Slug"
                            value={profile.slug ?? ""}
                            onChange={(e) => update("slug", e.target.value)}
                            placeholder="my-cv"
                        />
                        <TextInput
                            label="Meta Title"
                            value={profile.meta_title ?? ""}
                            onChange={(e) => update("meta_title", e.target.value)}
                        />
                        <TextArea
                            label="Meta Description"
                            value={profile.meta_description ?? ""}
                            onChange={(e) => update("meta_description", e.target.value)}
                            rows={2}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
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
            </form>
        </div>
    );
}
