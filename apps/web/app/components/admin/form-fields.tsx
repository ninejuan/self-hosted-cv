import { cn } from "@/lib/utils";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export function TextInput({ label, error, className, id, ...props }: TextInputProps) {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <label htmlFor={inputId} className="text-[12px] font-medium text-[var(--color-text-muted)]">
                {label}
            </label>
            <input
                id={inputId}
                className={cn(
                    "rounded-lg border bg-transparent px-3 py-2 text-[14px] text-[var(--color-text-primary)] outline-none transition-colors",
                    "placeholder:text-[var(--color-text-muted)]/50",
                    "focus:border-[var(--color-accent)]",
                    error ? "border-red-500" : "border-[var(--color-border)]",
                )}
                {...props}
            />
            {error && <p className="text-[11px] text-red-500">{error}</p>}
        </div>
    );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

export function TextArea({ label, error, className, id, ...props }: TextAreaProps) {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <label htmlFor={inputId} className="text-[12px] font-medium text-[var(--color-text-muted)]">
                {label}
            </label>
            <textarea
                id={inputId}
                className={cn(
                    "rounded-lg border bg-transparent px-3 py-2 text-[14px] text-[var(--color-text-primary)] outline-none transition-colors resize-y min-h-[80px]",
                    "placeholder:text-[var(--color-text-muted)]/50",
                    "focus:border-[var(--color-accent)]",
                    error ? "border-red-500" : "border-[var(--color-border)]",
                )}
                {...props}
            />
            {error && <p className="text-[11px] text-red-500">{error}</p>}
        </div>
    );
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
    error?: string;
}

export function SelectField({ label, options, error, className, id, ...props }: SelectFieldProps) {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <label htmlFor={inputId} className="text-[12px] font-medium text-[var(--color-text-muted)]">
                {label}
            </label>
            <select
                id={inputId}
                className={cn(
                    "rounded-lg border bg-transparent px-3 py-2 text-[14px] text-[var(--color-text-primary)] outline-none transition-colors",
                    "focus:border-[var(--color-accent)]",
                    error ? "border-red-500" : "border-[var(--color-border)]",
                )}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-[11px] text-red-500">{error}</p>}
        </div>
    );
}

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    label: string;
    error?: string;
}

export function DateInput({ label, error, className, id, ...props }: DateInputProps) {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <label htmlFor={inputId} className="text-[12px] font-medium text-[var(--color-text-muted)]">
                {label}
            </label>
            <input
                type="date"
                id={inputId}
                className={cn(
                    "rounded-lg border bg-transparent px-3 py-2 text-[14px] text-[var(--color-text-primary)] outline-none transition-colors",
                    "focus:border-[var(--color-accent)]",
                    error ? "border-red-500" : "border-[var(--color-border)]",
                )}
                {...props}
            />
            {error && <p className="text-[11px] text-red-500">{error}</p>}
        </div>
    );
}
