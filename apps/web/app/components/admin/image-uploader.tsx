import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { adminFetch, adminUpload } from "@/lib/admin-api";
import type { PresignResponse } from "@/types/admin";

interface ImageUploaderProps {
    value?: string;
    onChange: (url: string) => void;
    purpose?: string;
    className?: string;
}

export function ImageUploader({ value, onChange, purpose = "avatar", className }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFile(file: File) {
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("File must be under 5MB");
            return;
        }

        setError(null);
        setUploading(true);
        setProgress(0);

        try {
            const presign = await adminFetch<PresignResponse>("/api/admin/media/presign", {
                method: "POST",
                body: { filename: file.name, content_type: file.type, purpose },
            });

            await adminUpload(presign.upload_url, file, setProgress);

            await adminFetch("/api/admin/media/confirm", {
                method: "POST",
                body: { key: presign.key },
            });

            onChange(presign.file_url);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
            />

            {value ? (
                <div className="group relative inline-block size-24">
                    <img
                        src={value}
                        alt="Uploaded"
                        className="size-24 rounded-xl border border-[var(--color-border)] object-cover outline outline-1 outline-black/5"
                    />
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg)] opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Remove image"
                    >
                        <X className="size-3" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className={cn(
                        "flex size-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition-colors",
                        "border-[var(--color-border)] text-[var(--color-text-muted)]",
                        "hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
                        uploading && "pointer-events-none opacity-60",
                    )}
                >
                    {uploading ? (
                        <span className="text-[12px] font-mono tabular-nums">{progress}%</span>
                    ) : (
                        <>
                            <ImageIcon className="size-5" />
                            <span className="text-[10px] font-medium">Upload</span>
                        </>
                    )}
                </button>
            )}

            {uploading && (
                <div className="h-1 w-24 overflow-hidden rounded-full bg-[var(--color-tag-bg)]">
                    <div
                        className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-200"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {error && (
                <p className="text-[12px] text-red-500">{error}</p>
            )}

            {value && (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex w-fit items-center gap-1 text-[12px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                >
                    <Upload className="size-3" />
                    Replace
                </button>
            )}
        </div>
    );
}
