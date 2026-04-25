import { Outlet } from "react-router";

export default function AdminLayout() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
            <nav
                className="border-b px-4 py-3"
                style={{ borderColor: "var(--color-border)" }}
            >
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Admin
                </span>
            </nav>
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
}
