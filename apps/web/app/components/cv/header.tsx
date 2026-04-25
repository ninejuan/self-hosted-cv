import type { Profile } from "@/types/cv";

interface HeaderProps {
    profile: Profile;
}

export function Header({ profile }: HeaderProps) {
    return (
        <header className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
            {profile.avatarUrl && (
                <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    width={80}
                    height={80}
                    className="size-20 shrink-0 rounded-full object-cover outline outline-1 outline-[var(--color-border)]"
                />
            )}
            <div className="flex flex-col gap-1.5">
                <h1 className="text-[20px] font-bold leading-[26px] text-[var(--color-text-primary)]">
                    {profile.name}
                </h1>
                <p className="text-[14px] text-[var(--color-text-secondary)]">
                    {profile.profession}
                    {profile.location && (
                        <>
                            <span className="mx-1.5 text-[var(--color-text-muted)]">—</span>
                            {profile.location}
                        </>
                    )}
                </p>
                {profile.websiteUrl && (
                    <a
                        href={profile.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex w-fit items-center rounded-xl bg-[var(--color-tag-bg)] px-3 py-1 text-[12px] text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-accent)]"
                    >
                        {profile.websiteLabel ?? profile.websiteUrl.replace(/^https?:\/\//, "")}
                    </a>
                )}
            </div>
        </header>
    );
}
