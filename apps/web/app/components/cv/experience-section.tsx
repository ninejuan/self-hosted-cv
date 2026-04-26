import type { WorkExperience } from "@/types/cv";
import { formatDateRange } from "@/lib/date";
import { ExternalLink } from "./external-link";
import { SectionLayout, ItemRow } from "./section-layout";

interface ExperienceSectionProps {
    items: WorkExperience[];
}

export function ExperienceSection({ items }: ExperienceSectionProps) {
    if (items.length === 0) return null;

    return (
        <SectionLayout title="Work Experience">
            {items.map((item) => (
                <ItemRow key={item.id} date={formatDateRange(item.startDate, item.endDate)}>
                    {item.companyUrl && item.company ? (
                        <ExternalLink href={item.companyUrl}>
                            {item.company ? `${item.role} at ${item.company}` : item.role}
                        </ExternalLink>
                    ) : (
                        <span className="cv-item-title">
                            {item.company ? `${item.role} at ${item.company}` : item.role}
                        </span>
                    )}
                    {item.location && (
                        <span className="cv-item-subtitle">{item.location}</span>
                    )}
                    {item.description && (
                        <span className="cv-item-subtitle">{item.description}</span>
                    )}
                    {item.media && item.media.length > 0 && (
                        <div className="cv-item-images">
                            {item.media.map((m) => (
                                <div key={m.url} className="cv-item-image-wrapper">
                                    <img src={m.url} alt={m.alt ?? item.company} />
                                </div>
                            ))}
                        </div>
                    )}
                </ItemRow>
            ))}
        </SectionLayout>
    );
}
