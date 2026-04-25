import { Printer } from "lucide-react";

export function PrintButton() {
    return (
        <button
            type="button"
            onClick={() => window.print()}
            aria-label="PDF로 저장"
            title="PDF로 저장"
            className="print:hidden flex items-center justify-center size-8 rounded-lg text-[var(--color-text-muted)] transition-colors duration-150 hover:text-[var(--color-accent)] hover:bg-[var(--color-tag-bg)]"
        >
            <Printer size={16} aria-hidden="true" />
        </button>
    );
}
