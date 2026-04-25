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
                <ItemRow key={item.id} date={item.date}>
                    <div className="flex flex-col gap-1">
                        <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
                            {item.url ? (
                                <ExternalLink href={item.url} className="font-medium">
                                    {item.title}
                                </ExternalLink>
                            ) : (
                                item.title
                            )}
                        </p>
                        {item.collaborators && (
                            <p className="text-[12px] text-[var(--color-text-muted)]">
                                {item.collaborators}
                            </p>
                        )}
                        {(item.thumbnail || item.description) && (
                            <div className="mt-2 flex gap-3">
                                {item.thumbnail && (
                                    <img
                                        src={item.thumbnail.url}
                                        alt={item.thumbnail.alt ?? item.title}
                                        className="h-20 w-28 shrink-0 rounded-lg border border-[var(--color-border)] object-cover"
                                    />
                                )}
                                <div className="flex flex-col gap-1">
                                    {item.description && (
                                        <p className="text-[13px] leading-[1.6] text-[var(--color-text-secondary)]">
                                            {item.description}
                                        </p>
                                    )}
                                    {item.readTime && (
                                        <span className="text-[11px] text-[var(--color-text-muted)]">
                                            {item.readTime}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </ItemRow>
            ))}
        </SectionLayout>
    );
}
