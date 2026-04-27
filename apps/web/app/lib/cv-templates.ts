export const FALLBACK_CV_TEMPLATES = [
    {
        id: "readcv",
        key: "readcv",
        label: "ReadCV",
        description: "Spacious portfolio-style CV for web reading.",
        previewImageUrl: null,
        isActive: true,
        visibility: "public",
        version: "1.0.0",
        sortOrder: 0,
    },
    {
        id: "ats",
        key: "ats",
        label: "ATS Classic",
        description: "Single-column, parser-friendly resume layout.",
        previewImageUrl: null,
        isActive: true,
        visibility: "public",
        version: "1.0.0",
        sortOrder: 1,
    },
    {
        id: "compact",
        key: "compact",
        label: "Compact",
        description: "Dense one-page resume inspired by traditional PDF resumes.",
        previewImageUrl: null,
        isActive: true,
        visibility: "public",
        version: "1.0.0",
        sortOrder: 2,
    },
    {
        id: "academic",
        key: "academic",
        label: "Academic",
        description: "Formal CV layout for research and education-heavy profiles.",
        previewImageUrl: null,
        isActive: true,
        visibility: "public",
        version: "1.0.0",
        sortOrder: 3,
    },
    {
        id: "executive",
        key: "executive",
        label: "Executive",
        description: "Polished leadership resume with stronger hierarchy.",
        previewImageUrl: null,
        isActive: true,
        visibility: "public",
        version: "1.0.0",
        sortOrder: 4,
    },
    {
        id: "portfolio",
        key: "portfolio",
        label: "Portfolio",
        description: "Visual-forward layout for projects, writing, and speaking.",
        previewImageUrl: null,
        isActive: true,
        visibility: "public",
        version: "1.0.0",
        sortOrder: 5,
    },
    {
        id: "timeline",
        key: "timeline",
        label: "Timeline",
        description: "Career-story layout with a timeline-like date rail.",
        previewImageUrl: null,
        isActive: true,
        visibility: "public",
        version: "1.0.0",
        sortOrder: 6,
    },
    {
        id: "skills",
        key: "skills",
        label: "Skills-first",
        description: "Functional resume layout that emphasizes capabilities.",
        previewImageUrl: null,
        isActive: true,
        visibility: "public",
        version: "1.0.0",
        sortOrder: 7,
    },
] as const;

export type CVTemplateKey = (typeof FALLBACK_CV_TEMPLATES)[number]["key"];

export interface CVTemplateMetadata {
    id: string;
    key: string;
    label: string;
    description: string;
    previewImageUrl: string | null;
    isActive: boolean;
    visibility: string;
    version: string;
    sortOrder: number;
}

export const DEFAULT_CV_TEMPLATE: CVTemplateKey = "readcv";

const FALLBACK_TEMPLATE_KEYS = new Set<string>(FALLBACK_CV_TEMPLATES.map((template) => template.key));

export function parseCVTemplateKey(
    value: string | null | undefined,
    templates: readonly CVTemplateMetadata[] = FALLBACK_CV_TEMPLATES,
): CVTemplateKey {
    const availableKeys = new Set(templates.map((template) => template.key));
    if (value && availableKeys.has(value) && FALLBACK_TEMPLATE_KEYS.has(value)) {
        return value as CVTemplateKey;
    }

    return DEFAULT_CV_TEMPLATE;
}

export function getTemplateClassName(template: CVTemplateKey): string {
    return `cv-template-${template}`;
}
