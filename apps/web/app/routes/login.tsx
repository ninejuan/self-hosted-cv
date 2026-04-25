import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { getCsrfToken, clearCsrfToken } from "@/lib/admin-api";
import { Loader2 } from "lucide-react";

export function meta() {
    return [{ title: "Login — Self-Hosted CV" }];
}

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        clearCsrfToken();
        getCsrfToken().catch(() => {});
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!username || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const csrfToken = await getCsrfToken();
            const baseUrl = import.meta.env.VITE_API_URL ?? "";

            const res = await fetch(`${baseUrl}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken,
                },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message ?? "Invalid credentials");
            }

            navigate("/admin");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
            clearCsrfToken();
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            className="flex min-h-screen items-center justify-center px-4"
            style={{ backgroundColor: "var(--color-bg)" }}
        >
            <div className="w-full max-w-[340px]">
                <div className="mb-8 text-center">
                    <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">
                        Admin Login
                    </h1>
                    <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                        Sign in to manage your CV
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="username"
                            className="text-[12px] font-medium text-[var(--color-text-muted)]"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={cn(
                                "rounded-lg border bg-transparent px-3 py-2.5 text-[14px] text-[var(--color-text-primary)] outline-none transition-colors",
                                "placeholder:text-[var(--color-text-muted)]/50",
                                "focus:border-[var(--color-accent)]",
                                "border-[var(--color-border)]",
                            )}
                            placeholder="admin"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="password"
                            className="text-[12px] font-medium text-[var(--color-text-muted)]"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={cn(
                                "rounded-lg border bg-transparent px-3 py-2.5 text-[14px] text-[var(--color-text-primary)] outline-none transition-colors",
                                "placeholder:text-[var(--color-text-muted)]/50",
                                "focus:border-[var(--color-accent)]",
                                "border-[var(--color-border)]",
                            )}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="rounded-md bg-red-500/10 px-3 py-2 text-[13px] text-red-500">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "mt-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-medium transition-opacity",
                            "bg-[var(--color-accent)] text-[#111]",
                            loading ? "opacity-60" : "hover:opacity-80",
                        )}
                    >
                        {loading && <Loader2 className="size-4 animate-spin" />}
                        Sign In
                    </button>
                </form>
            </div>
        </main>
    );
}
