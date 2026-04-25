export enum ProfileStatus {
    Available = 'available',
    Busy = 'busy',
    Away = 'away',
    None = 'none',
}

export enum ProfileTheme {
    Light = 'light',
    Dark = 'dark',
    System = 'system',
}

export enum SectionType {
    WorkExperience = 'work_experience',
    Writing = 'writing',
    Speaking = 'speaking',
    SideProject = 'side_project',
    Education = 'education',
    Contact = 'contact',
}

export enum SocialPlatform {
    Threads = 'threads',
    Figma = 'figma',
    Instagram = 'instagram',
    Bluesky = 'bluesky',
    Mastodon = 'mastodon',
    X = 'x',
    Github = 'github',
    Linkedin = 'linkedin',
    Website = 'website',
    Other = 'other',
}

export enum MediaStatus {
    Pending = 'pending',
    Uploaded = 'uploaded',
    Attached = 'attached',
    Deleted = 'deleted',
}

export enum AuditAction {
    Create = 'create',
    Update = 'update',
    Delete = 'delete',
    Login = 'login',
    Logout = 'logout',
    LoginFailed = 'login_failed',
    TwoFactorSetup = '2fa_setup',
    TwoFactorVerify = '2fa_verify',
}
