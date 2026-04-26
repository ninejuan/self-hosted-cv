interface AboutProps {
    bio: string;
}

export function About({ bio }: AboutProps) {
    if (!bio) return null;

    return (
        <section className="cv-section cv-section-about">
            <h2 className="cv-section-title">About</h2>
            <p className="cv-about-text">{bio}</p>
        </section>
    );
}
