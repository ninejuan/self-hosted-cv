import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-api";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextInput, SelectField } from "@/components/admin/form-fields";
import type { AuditLogEntry, AuditLogResponse } from "@/types/admin";

export function meta() {
    return [{ title: "Audit Log — Self-Hosted CV" }];
}

const ACTION_OPTIONS = [
    { value: "", label: "All Actions" },
    { value: "login", label: "Login" },
    { value: "logout", label: "Logout" },
    { value: "create", label: "Create" },
    { value: "update", label: "Update" },
    { value: "delete", label: "Delete" },
    { value: "reorder", label: "Reorder" },
    { value: "import", label: "Import" },
];

export default function AuditLogViewer() {
    const [entries, setEntries] = useState<AuditLogEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const limit = 20;

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(limit) });
            if (actionFilter) params.set("action", actionFilter);
            if (dateFrom) params.set("from", dateFrom);
            if (dateTo) params.set("to", dateTo);

            const data = await adminFetch<AuditLogResponse>(`/api/admin/audit-logs?${params}`);
            setEntries(data.items ?? []);
            setTotal(data.total ?? 0);
        } catch {
            toast.error("Failed to load audit logs");
        } finally {
            setLoading(false);
        }
    }, [page, actionFilter, dateFrom, dateTo]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    function formatTimestamp(ts: string) {
        return new Date(ts).toLocaleString();
    }

    return (
        <div>
            <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">Audit Log</h1>
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                Activity history
            </p>

            <div className="mt-4 flex flex-wrap items-end gap-3">
                <SelectField
                    label="Action"
                    options={ACTION_OPTIONS}
                    value={actionFilter}
                    onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                    className="w-40"
                />
                <TextInput
                    label="From"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                    className="w-40"
                />
                <TextInput
                    label="To"
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                    className="w-40"
                />
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--color-border)]">
                <table className="w-full text-left text-[13px]">
                    <thead>
                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-tag-bg)]">
                            <th className="px-4 py-2.5 font-medium text-[var(--color-text-muted)]">Timestamp</th>
                            <th className="px-4 py-2.5 font-medium text-[var(--color-text-muted)]">Action</th>
                            <th className="px-4 py-2.5 font-medium text-[var(--color-text-muted)]">Entity</th>
                            <th className="px-4 py-2.5 font-medium text-[var(--color-text-muted)]">Entity ID</th>
                            <th className="px-4 py-2.5 font-medium text-[var(--color-text-muted)]">IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center">
                                    <Loader2 className="mx-auto size-5 animate-spin text-[var(--color-text-muted)]" />
                                </td>
                            </tr>
                        ) : entries.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-[var(--color-text-muted)]">
                                    No entries found
                                </td>
                            </tr>
                        ) : (
                            entries.map((entry) => (
                                <tr key={entry.id} className="border-b border-[var(--color-border)] last:border-0">
                                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[12px] text-[var(--color-text-secondary)]">
                                        {formatTimestamp(entry.createdAt)}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span className="inline-block rounded-md bg-[var(--color-tag-bg)] px-2 py-0.5 text-[12px] font-medium text-[var(--color-text-primary)]">
                                            {entry.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">{entry.entityType}</td>
                                    <td className="px-4 py-2.5 font-mono text-[12px] text-[var(--color-text-muted)]">{entry.entityId ?? "—"}</td>
                                    <td className="px-4 py-2.5 font-mono text-[12px] text-[var(--color-text-muted)]">{entry.ip}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-3 flex items-center justify-between text-[13px]">
                <p className="text-[var(--color-text-muted)] tabular-nums">
                    {total} entries · Page {page} of {totalPages}
                </p>
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className={cn(
                            "rounded-md border border-[var(--color-border)] p-1.5 transition-colors",
                            page <= 1 ? "opacity-40" : "hover:bg-[var(--color-tag-bg)]",
                        )}
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="size-4 text-[var(--color-text-secondary)]" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className={cn(
                            "rounded-md border border-[var(--color-border)] p-1.5 transition-colors",
                            page >= totalPages ? "opacity-40" : "hover:bg-[var(--color-tag-bg)]",
                        )}
                        aria-label="Next page"
                    >
                        <ChevronRight className="size-4 text-[var(--color-text-secondary)]" />
                    </button>
                </div>
            </div>
        </div>
    );
}
