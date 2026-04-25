import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-[var(--color-tag-bg)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]",
                className,
            )}
            aria-hidden="true"
            {...props}
        />
    );
}

export function AdminListSkeleton({ rows = 4 }: { rows?: number }) {
    const rowKeys = Array.from({ length: rows }, (_, index) => `admin-list-skeleton-${index}`);

    return (
        <div className="space-y-3">
            <Skeleton className="h-7 w-40" />
            {rowKeys.map((key) => (
                <div
                    key={key}
                    className="rounded-xl border border-[var(--color-border)] p-4"
                >
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="mt-2 h-3 w-1/3" />
                </div>
            ))}
        </div>
    );
}
