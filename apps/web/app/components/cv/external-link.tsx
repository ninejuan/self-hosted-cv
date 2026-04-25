import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExternalLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    showIcon?: boolean;
}

export function ExternalLink({
    href,
    children,
    className,
    showIcon = true,
}: ExternalLinkProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "inline-flex items-center gap-0.5 transition-colors duration-150 ease-in-out",
                "hover:text-[var(--color-accent)]",
                className,
            )}
        >
            {children}
            {showIcon && (
                <ArrowUpRight
                    size={14}
                    className="shrink-0 opacity-50"
                    aria-hidden="true"
                />
            )}
        </a>
    );
}
