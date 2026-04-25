import { useState, useRef } from "react";
import { adminFetch } from "@/lib/admin-api";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle2, FileArchive } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LinkedInPreview } from "@/types/admin";

export function meta() {
    return [{ title: "LinkedIn Import — Self-Hosted CV" }];
}

type Step = "upload" | "preview" | "done";

export default function LinkedInImport() {
    const [step, setStep] = useState<Step>("upload");
    const [uploading, setUploading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [preview, setPreview] = useState<LinkedInPreview | null>(null);
    const [importedCount, setImportedCount] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleUpload(file: File) {
        if (!file.name.endsWith(".zip")) {
            toast.error("Please upload a ZIP file");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const csrfToken = await (await import("@/lib/admin-api")).getCsrfToken();
            const baseUrl = import.meta.env.VITE_API_URL ?? "";

            const res = await fetch(`${baseUrl}/api/admin/linkedin/preview`, {
                method: "POST",
                headers: { "X-CSRF-Token": csrfToken },
                credentials: "include",
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to parse LinkedIn data");

            const data: LinkedInPreview = await res.json();
            setPreview(data);
            setStep("preview");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    }

    async function handleConfirmImport() {
        if (!preview) return;
        setImporting(true);
        try {
            const result = await adminFetch<{ imported: number }>("/api/admin/linkedin/import", {
                method: "POST",
                body: preview,
            });
            setImportedCount(result.imported);
            setStep("done");
            toast.success("Import completed");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Import failed");
        } finally {
            setImporting(false);
        }
    }

    function reset() {
        setStep("upload");
        setPreview(null);
        setImportedCount(0);
    }

    return (
        <div>
            <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">LinkedIn Import</h1>
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                Import your data from a LinkedIn export ZIP
            </p>

            <div className="mt-6">
                {step === "upload" && (
                    <div>
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".zip"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUpload(file);
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                            className={cn(
                                "flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[var(--color-border)] px-6 py-12 transition-colors",
                                "hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5",
                                uploading && "pointer-events-none opacity-60",
                            )}
                        >
                            {uploading ? (
                                <Loader2 className="size-8 animate-spin text-[var(--color-text-muted)]" />
                            ) : (
                                <FileArchive className="size-8 text-[var(--color-text-muted)]" />
                            )}
                            <div className="text-center">
                                <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
                                    {uploading ? "Processing..." : "Upload LinkedIn ZIP"}
                                </p>
                                <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                                    Download your data from LinkedIn Settings → Get a copy of your data
                                </p>
                            </div>
                        </button>
                    </div>
                )}

                {step === "preview" && preview && (
                    <div className="flex flex-col gap-4">
                        <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
                            <table className="w-full text-left text-[13px]">
                                <thead>
                                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-tag-bg)]">
                                        <th className="px-4 py-2.5 font-medium text-[var(--color-text-muted)]">Section</th>
                                        <th className="px-4 py-2.5 font-medium text-[var(--color-text-muted)]">Items</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.experience.length > 0 && (
                                        <tr className="border-b border-[var(--color-border)]">
                                            <td className="px-4 py-2.5 text-[var(--color-text-primary)]">Experience</td>
                                            <td className="px-4 py-2.5 tabular-nums text-[var(--color-text-secondary)]">{preview.experience.length}</td>
                                        </tr>
                                    )}
                                    {preview.education.length > 0 && (
                                        <tr className="border-b border-[var(--color-border)]">
                                            <td className="px-4 py-2.5 text-[var(--color-text-primary)]">Education</td>
                                            <td className="px-4 py-2.5 tabular-nums text-[var(--color-text-secondary)]">{preview.education.length}</td>
                                        </tr>
                                    )}
                                    {preview.projects.length > 0 && (
                                        <tr className="border-b border-[var(--color-border)] last:border-0">
                                            <td className="px-4 py-2.5 text-[var(--color-text-primary)]">Projects</td>
                                            <td className="px-4 py-2.5 tabular-nums text-[var(--color-text-secondary)]">{preview.projects.length}</td>
                                        </tr>
                                    )}
                                    {preview.profile.name && (
                                        <tr className="last:border-0">
                                            <td className="px-4 py-2.5 text-[var(--color-text-primary)]">Profile</td>
                                            <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">{preview.profile.name}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={reset}
                                className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-tag-bg)]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmImport}
                                disabled={importing}
                                className={cn(
                                    "inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-[13px] font-medium transition-opacity",
                                    "bg-[var(--color-accent)] text-[#111]",
                                    importing ? "opacity-60" : "hover:opacity-80",
                                )}
                            >
                                {importing && <Loader2 className="size-3.5 animate-spin" />}
                                Confirm Import
                            </button>
                        </div>
                    </div>
                )}

                {step === "done" && (
                    <div className="flex flex-col items-center gap-4 rounded-xl border border-[var(--color-border)] px-6 py-12 text-center">
                        <CheckCircle2 className="size-10 text-[var(--color-accent)]" />
                        <div>
                            <p className="text-[16px] font-semibold text-[var(--color-text-primary)]">
                                Import Complete
                            </p>
                            <p className="mt-1 text-[13px] text-[var(--color-text-muted)] tabular-nums">
                                {importedCount} items imported successfully
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={reset}
                            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-tag-bg)]"
                        >
                            Import Another
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
