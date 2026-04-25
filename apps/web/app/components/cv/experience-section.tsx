import type { WorkExperience } from "@/types/cv";
import { ExternalLink } from "./external-link";
import { SectionLayout, ItemRow } from "./section-layout";

interface ExperienceSectionProps {
    items: WorkExperience[];
}

function formatDateRange(start: string, end?: string): string {
    return end ? `${start} — ${end}` : `${start} — Present`;
}

export function ExperienceSection({ items }: ExperienceSectionProps) {
    if (items.length === 0) return null;

    return (
        <SectionLayout title="Work Experience">
            {items.map((item) => (
                <ItemRow key={item.id} date={formatDateRange(item.startDate, item.endDate)}>
                    <div className="flex flex-col gap-1">
                        <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
                            {item.role}
                            <span className="text-[var(--color-text-muted)]"> at </span>
                            {item.companyUrl ? (
                                <ExternalLink href={item.companyUrl} className="font-medium">
                                    {item.company}
                                </ExternalLink>
                            ) : (
                                item.company
                            )}
                        </p>
                        {item.location && (
                            <p className="text-[12px] text-[var(--color-text-muted)]">
                                {item.location}
                            </p>
                        )}
                        {item.description && (
                            <p className="mt-1 text-[14px] leading-[1.8] text-[var(--color-text-secondary)] whitespace-pre-line">
                                {item.description}
                            </p>
                        )}
                        {item.media && item.media.length > 0 && (
                            <div className="mt-3 flex gap-3 overflow-x-auto">
                                {item.media.map((m) => (
                                    <img
                                        key={m.url}
                                        src={m.url}
                                        alt={m.alt ?? `${item.company} media`}
                                        className="h-32 w-auto rounded-lg border border-[var(--color-border)] object-cover"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </ItemRow>
            ))}
        </SectionLayout>
    );
}
