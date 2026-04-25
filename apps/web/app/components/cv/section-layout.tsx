import { cn } from "@/lib/utils";

interface SectionLayoutProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function SectionLayout({ title, children, className }: SectionLayoutProps) {
    return (
        <section className={cn("cv-section", className)}>
            <h2 className="cv-section-title">{title}</h2>
            <div className="cv-section-items">{children}</div>
        </section>
    );
}

interface ItemRowProps {
    date: string;
    children: React.ReactNode;
    className?: string;
}

export function ItemRow({ date, children, className }: ItemRowProps) {
    return (
        <div className={cn("cv-item-row", className)}>
            <div className="cv-date-column">
                <span className="font-mono text-[12px] leading-none text-[var(--color-text-muted)]">
                    {date}
                </span>
            </div>
            <div className="cv-content-column">{children}</div>
        </div>
    );
}
