import type { SideProject } from "@/types/cv";
import { formatDateRange } from "@/lib/date";
import { ExternalLink } from "./external-link";
import { SectionLayout, ItemRow } from "./section-layout";

interface ProjectsSectionProps {
    items: SideProject[];
}

export function ProjectsSection({ items }: ProjectsSectionProps) {
    if (items.length === 0) return null;

    return (
        <SectionLayout title="Side Projects">
            {items.map((item) => (
                <ItemRow key={item.id} date={formatDateRange(item.startDate, item.endDate)}>
                    {item.url ? (
                        <ExternalLink href={item.url}>{item.name}</ExternalLink>
                    ) : (
                        <span className="cv-item-title">{item.name}</span>
                    )}
                    {item.description && (
                        <span className="cv-item-subtitle">{item.description}</span>
                    )}
                    {item.media && item.media.length > 0 && (
                        <div className="cv-item-images">
                            {item.media.map((m) => (
                                <div key={m.url} className="cv-item-image-wrapper">
                                    <img src={m.url} alt={m.alt ?? item.name} />
                                </div>
                            ))}
                        </div>
                    )}
                </ItemRow>
            ))}
        </SectionLayout>
    );
}
