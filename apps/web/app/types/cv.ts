export interface Media {
    url: string;
    alt?: string;
    caption?: string;
}

export interface SocialLink {
    platform: string;
    url: string;
    username: string;
}

export interface Profile {
    name: string;
    profession: string;
    location: string;
    bio: string;
    avatarUrl?: string;
    websiteUrl?: string;
    websiteLabel?: string;
    socialLinks: SocialLink[];
}

export interface WorkExperience {
    id: string;
    role: string;
    company: string;
    companyUrl?: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description?: string;
    media?: Media[];
}

export interface Writing {
    id: string;
    title: string;
    url?: string;
    date: string;
    collaborators?: string;
    description?: string;
    readTime?: string;
    thumbnail?: Media;
}

export interface Speaking {
    id: string;
    title: string;
    url?: string;
    event?: string;
    location?: string;
    date: string;
    media?: Media[];
}

export interface SideProject {
    id: string;
    name: string;
    url?: string;
    description?: string;
    startDate: string;
    endDate?: string;
    media?: Media[];
}

export interface Education {
    id: string;
    degree: string;
    institution: string;
    institutionUrl?: string;
    location?: string;
    startDate: string;
    endDate?: string;
}

export interface CVData {
    profile: Profile;
    experience: WorkExperience[];
    writing: Writing[];
    speaking: Speaking[];
    projects: SideProject[];
    education: Education[];
}
