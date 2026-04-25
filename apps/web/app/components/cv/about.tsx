interface AboutProps {
    bio: string;
}

export function About({ bio }: AboutProps) {
    if (!bio) return null;

    return (
        <section className="cv-section">
            <h2 className="cv-section-title">About</h2>
            <p className="text-[14px] leading-[1.8] text-[var(--color-text-secondary)] whitespace-pre-line">
                {bio}
            </p>
        </section>
    );
}
