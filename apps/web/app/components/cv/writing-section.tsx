import { formatDate } from "@/lib/date";
import type { Writing } from "@/types/cv";
import { ExternalLink } from "./external-link";
import { SectionLayout, ItemRow } from "./section-layout";

interface WritingSectionProps {
    items: Writing[];
}

export function WritingSection({ items }: WritingSectionProps) {
    if (items.length === 0) return null;

    return (
        <SectionLayout title="Writing">
            {items.map((item) => (
                <ItemRow key={item.id} date={formatDate(item.date)}>
                    {item.url ? (
                        <ExternalLink href={item.url}>{item.title}</ExternalLink>
                    ) : (
                        <span className="cv-item-title">{item.title}</span>
                    )}
                    {item.collaborators && (
                        <span className="cv-item-subtitle">{item.collaborators}</span>
                    )}
                    {(item.thumbnail || item.description) && (
                        <div className="cv-writing-card">
                            <div className="cv-writing-card-inner">
                                {item.thumbnail && (
                                    <div className="cv-writing-card-image">
                                        <img src={item.thumbnail.url} alt={item.thumbnail.alt ?? item.title} />
                                    </div>
                                )}
                                {item.description && (
                                    <div className="cv-writing-card-body">
                                        <span className="cv-item-subtitle">{item.description}</span>
                                        {item.readTime && (
                                            <span className="cv-item-subtitle" style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>
                                                {item.readTime}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </ItemRow>
            ))}
        </SectionLayout>
    );
}
