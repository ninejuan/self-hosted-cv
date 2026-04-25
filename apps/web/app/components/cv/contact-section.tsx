import type { SocialLink } from "@/types/cv";
import { ExternalLink } from "./external-link";
import { SectionLayout, ItemRow } from "./section-layout";

interface ContactSectionProps {
    links: SocialLink[];
}

export function ContactSection({ links }: ContactSectionProps) {
    if (links.length === 0) return null;

    return (
        <SectionLayout title="Contact">
            {links.map((link) => (
                <ItemRow key={link.platform} date={link.platform}>
                    <ExternalLink href={link.url} className="text-[14px] text-[var(--color-text-primary)]">
                        {link.username}
                    </ExternalLink>
                </ItemRow>
            ))}
        </SectionLayout>
    );
}
