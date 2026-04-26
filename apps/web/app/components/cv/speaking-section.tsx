import { formatDate } from "@/lib/date";
import type { Speaking } from "@/types/cv";
import { ExternalLink } from "./external-link";
import { SectionLayout, ItemRow } from "./section-layout";

interface SpeakingSectionProps {
    items: Speaking[];
}

export function SpeakingSection({ items }: SpeakingSectionProps) {
    if (items.length === 0) return null;

    return (
        <SectionLayout title="Speaking">
            {items.map((item) => (
                <ItemRow key={item.id} date={formatDate(item.date)}>
                    {item.url ? (
                        <ExternalLink href={item.url}>{item.title}</ExternalLink>
                    ) : (
                        <span className="cv-item-title">{item.title}</span>
                    )}
                    {item.event && (
                        <span className="cv-item-subtitle">{item.event}</span>
                    )}
                    {item.location && (
                        <span className="cv-item-subtitle">{item.location}</span>
                    )}
                    {item.media && item.media.length > 0 && (
                        <div className="cv-item-images">
                            {item.media.map((m) => (
                                <div key={m.url} className="cv-item-image-wrapper">
                                    <img src={m.url} alt={m.alt ?? item.title} />
                                </div>
                            ))}
                        </div>
                    )}
                </ItemRow>
            ))}
        </SectionLayout>
    );
}
