import type { Profile, WorkExperience, Writing, Speaking, SideProject, Education, SocialLink } from "./cv";

export interface AdminProfile extends Profile {
    slug?: string;
    status?: "active" | "draft" | "archived";
    theme?: "light" | "dark" | "system";
    meta_title?: string;
    meta_description?: string;
}

export interface SectionConfig {
    id: string;
    type: string;
    title: string;
    visible: boolean;
    order: number;
}

export interface AuditLogEntry {
    id: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    ip: string;
    user_agent?: string;
    details?: Record<string, unknown>;
    created_at: string;
}

export interface AuditLogResponse {
    data: AuditLogEntry[];
    total: number;
    page: number;
    limit: number;
}

export interface PresignResponse {
    upload_url: string;
    file_url: string;
    key: string;
}

export interface UpdateCheckResponse {
    current_version: string;
    latest_version: string;
    update_available: boolean;
    release_url?: string;
}

export interface LinkedInPreview {
    experience: WorkExperience[];
    education: Education[];
    projects: SideProject[];
    profile: Partial<Profile>;
}

export type { WorkExperience, Writing, Speaking, SideProject, Education, SocialLink };
