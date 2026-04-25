import { cn } from "@/lib/utils";
import { AlertTriangle, ExternalLink } from "lucide-react";
import type { UpdateCheckResponse } from "@/types/admin";

interface UpdateBannerProps {
    data: UpdateCheckResponse;
}

export function UpdateBanner({ data }: UpdateBannerProps) {
    if (!data.update_available) return null;

    return (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/8 px-4 py-2.5">
            <AlertTriangle className="size-4 shrink-0 text-[var(--color-accent)]" />
            <p className="flex-1 text-[13px] text-[var(--color-text-secondary)]">
                Version <span className="font-medium text-[var(--color-text-primary)]">{data.latest_version}</span> is available.
                You are running <span className="font-mono text-[12px]">{data.current_version}</span>.
            </p>
            {data.release_url && (
                <a
                    href={data.release_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium",
                        "bg-[var(--color-accent)] text-[#111] transition-opacity hover:opacity-80",
                    )}
                >
                    View Release
                    <ExternalLink className="size-3" />
                </a>
            )}
        </div>
    );
}
