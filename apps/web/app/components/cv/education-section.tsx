import type { Education } from "@/types/cv";
import { formatDateRange } from "@/lib/date";
import { ExternalLink } from "./external-link";
import { SectionLayout, ItemRow } from "./section-layout";

interface EducationSectionProps {
    items: Education[];
}

export function EducationSection({ items }: EducationSectionProps) {
    if (items.length === 0) return null;

    return (
        <SectionLayout title="Education">
            {items.map((item) => (
                <ItemRow key={item.id} date={formatDateRange(item.startDate, item.endDate)}>
                    {item.institutionUrl ? (
                        <ExternalLink href={item.institutionUrl}>
                            {item.degree} at {item.institution}
                        </ExternalLink>
                    ) : (
                        <span className="cv-item-title">{item.degree} at {item.institution}</span>
                    )}
                    {item.location && (
                        <span className="cv-item-subtitle">{item.location}</span>
                    )}
                </ItemRow>
            ))}
        </SectionLayout>
    );
}
