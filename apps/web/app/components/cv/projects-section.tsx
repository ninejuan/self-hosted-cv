import type { SideProject } from "@/types/cv";
import { ExternalLink } from "./external-link";
import { SectionLayout, ItemRow } from "./section-layout";

interface ProjectsSectionProps {
    items: SideProject[];
}

function formatDateRange(start: string, end?: string): string {
    return end ? `${start} — ${end}` : start;
}

export function ProjectsSection({ items }: ProjectsSectionProps) {
    if (items.length === 0) return null;

    return (
        <SectionLayout title="Side Projects">
            {items.map((item) => (
                <ItemRow key={item.id} date={formatDateRange(item.startDate, item.endDate)}>
                    <div className="flex flex-col gap-1">
                        <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
                            {item.url ? (
                                <ExternalLink href={item.url} className="font-medium">
                                    {item.name}
                                </ExternalLink>
                            ) : (
                                item.name
                            )}
                        </p>
                        {item.description && (
                            <p className="text-[13px] leading-[1.6] text-[var(--color-text-secondary)]">
                                {item.description}
                            </p>
                        )}
                    </div>
                </ItemRow>
            ))}
        </SectionLayout>
    );
}
