import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { useRef, useEffect } from "react";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    destructive?: boolean;
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Delete",
    onConfirm,
    onCancel,
    destructive = true,
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const el = dialogRef.current;
        if (!el) return;
        if (open && !el.open) el.showModal();
        else if (!open && el.open) el.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            onClose={onCancel}
            className="m-auto max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-0 shadow-lg backdrop:bg-black/40"
        >
            <div className="flex flex-col gap-4 p-6">
                <div className="flex items-start gap-3">
                    {destructive && (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                            <AlertTriangle className="size-4 text-red-500" />
                        </div>
                    )}
                    <div className="flex flex-col gap-1">
                        <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                            {title}
                        </h3>
                        <p className="text-[13px] text-[var(--color-text-secondary)]">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-tag-bg)]"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={cn(
                            "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                            destructive
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-[var(--color-accent)] text-[#111] hover:opacity-80",
                        )}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </dialog>
    );
}
