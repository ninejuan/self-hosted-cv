import { ArrowUpRight } from "lucide-react";

interface ExternalLinkProps {
    href: string;
    children: React.ReactNode;
}

export function ExternalLink({ href, children }: ExternalLinkProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="cv-item-link"
        >
            {children}
            <span className="cv-link-arrow">
                <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
            </span>
        </a>
    );
}
