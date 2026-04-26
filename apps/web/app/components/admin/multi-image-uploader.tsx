import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { adminFetch, adminUpload } from "@/lib/admin-api";
import type { PresignResponse } from "@/types/admin";

interface MultiImageUploaderProps {
    images: string[];
    onChange: (urls: string[]) => void;
    purpose?: string;
    maxImages?: number;
}

export function MultiImageUploader({
    images,
    onChange,
    purpose = "media",
    maxImages = 10,
}: MultiImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFile(file: File) {
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError("File must be under 10MB");
            return;
        }
        if (images.length >= maxImages) {
            setError(`Maximum ${maxImages} images`);
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

            onChange([...images, presign.file_url]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    function removeImage(index: number) {
        onChange(images.filter((_, i) => i !== index));
    }

    return (
        <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[var(--color-text-muted)]">Images</label>
            <div className="flex flex-wrap gap-2">
                {images.map((url, i) => (
                    <div key={url} className="group relative">
                        <img
                            src={url}
                            alt={`Image ${i + 1}`}
                            className="h-16 w-24 rounded-lg border border-[var(--color-border)] object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg)] opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="Remove"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                ))}

                {images.length < maxImages && (
                    <>
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
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                            className={cn(
                                "flex h-16 w-24 flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed transition-colors",
                                "border-[var(--color-border)] text-[var(--color-text-muted)]",
                                "hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
                                uploading && "pointer-events-none opacity-60",
                            )}
                        >
                            {uploading ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="size-4" />
                                    <span className="text-[10px]">Add</span>
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>

            {uploading && (
                <div className="h-1 w-24 overflow-hidden rounded-full bg-[var(--color-tag-bg)]">
                    <div
                        className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-200"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {error && <p className="text-[12px] text-red-500">{error}</p>}
        </div>
    );
}
