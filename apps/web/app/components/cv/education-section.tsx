import type { Education } from "@/types/cv";
import { ExternalLink } from "./external-link";
import { SectionLayout, ItemRow } from "./section-layout";

interface EducationSectionProps {
    items: Education[];
}

function formatDateRange(start: string, end?: string): string {
    return end ? `${start} — ${end}` : `${start} — Present`;
}

export function EducationSection({ items }: EducationSectionProps) {
    if (items.length === 0) return null;

    return (
        <SectionLayout title="Education">
            {items.map((item) => (
                <ItemRow key={item.id} date={formatDateRange(item.startDate, item.endDate)}>
                    <div className="flex flex-col gap-1">
                        <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
                            {item.degree}
                            <span className="text-[var(--color-text-muted)]"> at </span>
                            {item.institutionUrl ? (
                                <ExternalLink href={item.institutionUrl} className="font-medium">
                                    {item.institution}
                                </ExternalLink>
                            ) : (
                                item.institution
                            )}
                        </p>
                        {item.location && (
                            <p className="text-[12px] text-[var(--color-text-muted)]">
                                {item.location}
                            </p>
                        )}
                    </div>
                </ItemRow>
            ))}
        </SectionLayout>
    );
}
