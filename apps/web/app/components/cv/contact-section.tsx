import type { SocialLink } from "@/types/cv";
import { ExternalLink } from "./external-link";
import { SectionLayout, ItemRow } from "./section-layout";

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

interface ContactSectionProps {
    links: SocialLink[];
}

export function ContactSection({ links }: ContactSectionProps) {
    if (links.length === 0) return null;

    return (
        <SectionLayout title="Contact">
            {links.map((link) => (
                <ItemRow key={link.platform} date={capitalize(link.platform)}>
                    <ExternalLink href={link.url}>{link.username}</ExternalLink>
                </ItemRow>
            ))}
        </SectionLayout>
    );
}
