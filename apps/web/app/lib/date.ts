export function formatDate(dateStr: string): string {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    return parts[0] ?? dateStr;
}

export function formatDateRange(start: string, end?: string): string {
    const s = formatDate(start);
    if (!end) return `${s} — Now`;
    return `${s} — ${formatDate(end)}`;
}
