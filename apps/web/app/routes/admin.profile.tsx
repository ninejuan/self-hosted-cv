import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-api";
import { TextInput, TextArea, SelectField } from "@/components/admin/form-fields";
import { ImageUploader } from "@/components/admin/image-uploader";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminProfile } from "@/types/admin";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DEFAULT_CV_TEMPLATE,
    FALLBACK_CV_TEMPLATES,
    type CVTemplateMetadata,
} from "@/lib/cv-templates";

export function meta() {
    return [{ title: "Profile — Self-Hosted CV" }];
}

const STATUS_OPTIONS = [
    { value: "available", label: "Available" },
    { value: "busy", label: "Busy" },
    { value: "away", label: "Away" },
    { value: "none", label: "None" },
];

const THEME_OPTIONS = [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
];

export default function ProfileEditor() {
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [templates, setTemplates] = useState<CVTemplateMetadata[]>([...FALLBACK_CV_TEMPLATES]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([
            adminFetch<AdminProfile>("/api/admin/profile"),
            adminFetch<CVTemplateMetadata[]>("/api/admin/templates").catch(() => [...FALLBACK_CV_TEMPLATES]),
        ])
            .then(([profileData, templateData]) => {
                const availableTemplates = templateData.length > 0 ? templateData : [...FALLBACK_CV_TEMPLATES];
                setTemplates(availableTemplates);
                setProfile(normalizeAdminProfileTemplate(profileData, availableTemplates));
            })
            .catch(() => toast.error("Failed to load profile"));
    }, []);

    function update(field: keyof AdminProfile, value: string) {
        if (!profile) return;
        setProfile({ ...profile, [field]: value });
    }

    async function handleSave(e: { preventDefault: () => void }) {
        e.preventDefault();
        if (!profile) return;
        setSaving(true);
        try {
            const { name, profession, location, bio, avatarUrl, slug, status, theme, cvTemplateId } = profile;
            const updatedProfile = await adminFetch<AdminProfile>("/api/admin/profile", {
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
                    ...(isUuid(cvTemplateId) ? { cvTemplateId } : {}),
                },
            });
            setProfile(normalizeAdminProfileTemplate(updatedProfile, templates));
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
                        value={profile.status ?? "available"}
                        onChange={(e) => update("status", e.target.value)}
                    />
                    <SelectField
                        label="Theme"
                        options={THEME_OPTIONS}
                        value={profile.theme ?? "system"}
                        onChange={(e) => update("theme", e.target.value)}
                    />
                    <SelectField
                        label="Default CV Template"
                        options={templates.map((template) => ({
                            value: template.id,
                            label: template.label,
                        }))}
                        value={profile.cvTemplateId ?? templates.find((template) => template.key === DEFAULT_CV_TEMPLATE)?.id ?? ""}
                        onChange={(e) => update("cvTemplateId", e.target.value)}
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

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string | undefined): value is string {
    return typeof value === "string" && UUID_PATTERN.test(value);
}

function normalizeAdminProfileTemplate(
    profile: AdminProfile,
    templates: CVTemplateMetadata[],
): AdminProfile {
    const cvTemplateObj = typeof profile.cvTemplate === "object" ? profile.cvTemplate : null;
    const currentKey = cvTemplateObj?.key ?? (typeof profile.cvTemplate === "string" ? profile.cvTemplate : undefined);

    const matchedTemplate =
        templates.find((t) => t.id === profile.cvTemplateId)
        ?? (currentKey ? templates.find((t) => t.key === currentKey) : undefined)
        ?? templates.find((t) => t.key === DEFAULT_CV_TEMPLATE);

    return {
        ...profile,
        cvTemplateId: matchedTemplate?.id ?? profile.cvTemplateId,
        cvTemplate: matchedTemplate?.key ?? currentKey ?? DEFAULT_CV_TEMPLATE,
    };
}
