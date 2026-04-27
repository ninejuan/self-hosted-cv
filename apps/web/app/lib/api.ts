import type { CVData } from "@/types/cv";
import {
    FALLBACK_CV_TEMPLATES,
    parseCVTemplateKey,
    type CVTemplateMetadata,
} from "@/lib/cv-templates";

type ServerSection = {
    section?: { type?: string };
    items?: Array<Record<string, unknown>>;
};

type ServerCVResponse = {
    profile?: Record<string, unknown> | null;
    sections?: ServerSection[];
};

type ServerTemplate = Record<string, unknown>;

function getBaseUrl(isServer: boolean): string {
    if (isServer) {
        return process.env.API_INTERNAL_URL ?? "http://localhost:3000";
    }
    return import.meta.env.VITE_API_URL ?? "";
}

export async function fetchCV(): Promise<CVData | null> {
    const isServer = typeof window === "undefined";
    const baseUrl = getBaseUrl(isServer);

    try {
        const res = await fetch(`${baseUrl}/api/cv`, {
            headers: { Accept: "application/json" },
        });

        if (res.status === 404) {
            return null;
        }

        if (!res.ok) {
            return null;
        }

        const data = await res.json() as ServerCVResponse;
        if (!data?.profile) {
            return null;
        }

        return normalizeCV(data);
    } catch {
        return null;
    }
}

export async function fetchTemplates(): Promise<CVTemplateMetadata[]> {
    const isServer = typeof window === "undefined";
    const baseUrl = getBaseUrl(isServer);

    try {
        const res = await fetch(`${baseUrl}/api/templates`, {
            headers: { Accept: "application/json" },
        });

        if (!res.ok) {
            return [...FALLBACK_CV_TEMPLATES];
        }

        const data = await res.json() as ServerTemplate[];
        const templates = data.map(normalizeTemplate).filter((template) => template.isActive);
        return templates.length > 0 ? templates : [...FALLBACK_CV_TEMPLATES];
    } catch {
        return [...FALLBACK_CV_TEMPLATES];
    }
}

function normalizeCV(data: ServerCVResponse): CVData {
    const profile = data.profile ?? {};
    const sections = data.sections ?? [];
    const templateMeta = recordValue(profile.cvTemplate)
        ?? recordValue(profile.template)
        ?? recordValue(profile.cv_template);
    const templateKey = parseCVTemplateKey(
        optionalString(templateMeta?.key)
            ?? optionalString(profile.cvTemplate)
            ?? optionalString(profile.cvTemplateKey)
            ?? optionalString(profile.templateKey),
    );

    return {
        profile: {
            name: stringValue(profile.name),
            profession: stringValue(profile.profession),
            location: stringValue(profile.location),
            bio: stringValue(profile.bio),
            avatarUrl: optionalString(profile.avatarUrl),
            websiteUrl: optionalString(profile.website),
            websiteLabel: optionalString(profile.website)?.replace(/^https?:\/\//, ""),
            cvTemplateId: optionalString(profile.cvTemplateId),
            cvTemplate: templateKey,
            cvTemplateMeta: templateMeta ? normalizeTemplate(templateMeta) : undefined,
            socialLinks: sectionItems(sections, "contact").map((item) => ({
                platform: stringValue(item.platform),
                url: stringValue(item.url),
                username: stringValue(item.username),
            })),
        },
        experience: sectionItems(sections, "work_experience").map((item) => ({
            id: stringValue(item.id),
            role: stringValue(item.role),
            company: stringValue(item.company),
            companyUrl: optionalString(item.url),
            location: optionalString(item.location),
            startDate: stringValue(item.startDate),
            endDate: optionalString(item.endDate),
            description: optionalString(item.description),
            media: Array.isArray(item.media) ? (item.media as Array<Record<string, unknown>>).map((m) => ({
                url: stringValue(m.url),
                alt: optionalString(m.alt),
            })) : [],
        })),
        writing: sectionItems(sections, "writing").map((item) => ({
            id: stringValue(item.id),
            title: stringValue(item.title),
            url: optionalString(item.url),
            date: stringValue(item.publishedDate),
            collaborators: optionalString(item.collaborators),
            description: optionalString(item.description),
            readTime: optionalString(item.readTime),
            thumbnail: optionalString(item.thumbnailUrl)
                ? { url: stringValue(item.thumbnailUrl), alt: stringValue(item.title) }
                : undefined,
        })),
        speaking: sectionItems(sections, "speaking").map((item) => ({
            id: stringValue(item.id),
            title: stringValue(item.title),
            url: optionalString(item.url),
            location: optionalString(item.location),
            date: stringValue(item.date),
            media: Array.isArray(item.media) ? (item.media as Array<Record<string, unknown>>).map((m) => ({
                url: stringValue(m.url),
                alt: optionalString(m.alt),
            })) : [],
        })),
        projects: sectionItems(sections, "side_project").map((item) => ({
            id: stringValue(item.id),
            name: stringValue(item.name),
            url: optionalString(item.url),
            description: optionalString(item.description),
            startDate: stringValue(item.date),
            media: Array.isArray(item.media) ? (item.media as Array<Record<string, unknown>>).map((m) => ({
                url: stringValue(m.url),
                alt: optionalString(m.alt),
            })) : [],
        })),
        education: sectionItems(sections, "education").map((item) => ({
            id: stringValue(item.id),
            degree: stringValue(item.degree),
            institution: stringValue(item.institution),
            institutionUrl: optionalString(item.url),
            location: optionalString(item.location),
            startDate: stringValue(item.startDate),
            endDate: optionalString(item.endDate),
        })),
    };
}

function normalizeTemplate(template: ServerTemplate): CVTemplateMetadata {
    return {
        id: stringValue(template.id) || stringValue(template.key),
        key: stringValue(template.key),
        label: stringValue(template.label),
        description: stringValue(template.description),
        previewImageUrl: optionalString(template.previewImageUrl) ?? null,
        isActive: typeof template.isActive === "boolean" ? template.isActive : true,
        visibility: stringValue(template.visibility) || "public",
        version: stringValue(template.version) || "1.0.0",
        sortOrder: typeof template.sortOrder === "number" ? template.sortOrder : 0,
    };
}

function sectionItems(sections: ServerSection[], type: string): Array<Record<string, unknown>> {
    return sections.find((entry) => entry.section?.type === type)?.items ?? [];
}

function stringValue(value: unknown): string {
    return typeof value === "string" ? value : "";
}

function optionalString(value: unknown): string | undefined {
    return typeof value === "string" && value.length > 0 ? value : undefined;
}

function recordValue(value: unknown): Record<string, unknown> | undefined {
    return value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : undefined;
}
