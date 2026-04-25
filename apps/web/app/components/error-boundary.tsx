import { isRouteErrorResponse } from "react-router";

export function ErrorBoundaryView({
    error,
    title = "Something went wrong",
}: {
    error: unknown;
    title?: string;
}) {
    let message = "Please try again. If the problem persists, check the server logs.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404
            ? "The requested page could not be found."
            : error.statusText || message;
    } else if (error instanceof Error) {
        message = error.message;
        stack = import.meta.env.DEV ? error.stack : undefined;
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6 py-16 text-[var(--color-text-primary)]">
            <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
                    Error
                </p>
                <h1 className="mt-3 text-balance text-[22px] font-bold">
                    {title}
                </h1>
                <p className="mt-2 text-pretty text-[14px] leading-6 text-[var(--color-text-muted)]">
                    {message}
                </p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-5 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-[13px] font-semibold text-[#111] transition-opacity hover:opacity-80"
                >
                    Retry
                </button>
                {stack && (
                    <pre className="mt-5 max-h-52 overflow-auto rounded-lg bg-[var(--color-tag-bg)] p-3 text-[11px] text-[var(--color-text-secondary)]">
                        <code>{stack}</code>
                    </pre>
                )}
            </div>
        </main>
    );
}
