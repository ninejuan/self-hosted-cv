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
                        {item.event && (
                            <p className="text-[12px] text-[var(--color-text-muted)]">
                                {item.event}
                            </p>
                        )}
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
