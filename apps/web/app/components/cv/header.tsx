import type { Profile } from "@/types/cv";

interface HeaderProps {
    profile: Profile;
}

export function Header({ profile }: HeaderProps) {
    const hasPhoto = !!profile.avatarUrl;

    return (
        <header className={`cv-header ${hasPhoto ? "" : "cv-header-no-photo"}`}>
            {hasPhoto && (
                <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="cv-header-photo"
                />
            )}
            <div className="cv-header-text">
                <h1 className="cv-header-name">{profile.name}</h1>
                <p className="cv-header-subtitle">
                    {profile.profession}
                    {profile.location ? ` in ${profile.location}` : ""}
                </p>
            </div>
            {profile.websiteUrl && (
                <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cv-header-tag"
                >
                    {profile.websiteLabel ?? profile.websiteUrl.replace(/^https?:\/\//, "")}
                </a>
            )}
        </header>
    );
}
