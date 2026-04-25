import { Sun, Moon, Monitor } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "system";

function getStoredTheme(): Theme {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("theme") as Theme) ?? "system";
}

function applyTheme(theme: Theme) {
    const isDark =
        theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
}

const CYCLE: Theme[] = ["light", "dark", "system"];

export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>("system");

    useEffect(() => {
        setTheme(getStoredTheme());
    }, []);

    useEffect(() => {
        if (theme !== "system") return;

        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => applyTheme("system");
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [theme]);

    const cycle = useCallback(() => {
        const next = CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length];
        setTheme(next);
        applyTheme(next);
    }, [theme]);

    const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
    const label =
        theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

    return (
        <button
            type="button"
            onClick={cycle}
            aria-label={`Theme: ${label}. Click to change.`}
            title={`Theme: ${label}`}
            className="print:hidden flex items-center justify-center size-8 rounded-lg text-[var(--color-text-muted)] transition-colors duration-150 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-tag-bg)]"
        >
            <Icon size={16} aria-hidden="true" />
        </button>
    );
}
