interface SectionLayoutProps {
    title: string;
    children: React.ReactNode;
}

export function SectionLayout({ title, children }: SectionLayoutProps) {
    return (
        <section className="cv-section cv-section-items-wrapper">
            <h2 className="cv-section-title">{title}</h2>
            <div className="cv-section-items">{children}</div>
        </section>
    );
}

interface ItemRowProps {
    date: string;
    children: React.ReactNode;
}

export function ItemRow({ date, children }: ItemRowProps) {
    return (
        <div className="cv-item-row">
            <div className="cv-date-column">{date}</div>
            <div className="cv-content-column">{children}</div>
        </div>
    );
}
