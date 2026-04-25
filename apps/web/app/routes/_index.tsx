export function meta() {
    return [
        { title: "Self-Hosted CV" },
        { name: "description", content: "Self-hosted CV/portfolio platform" },
    ];
}

export default function Index() {
    return (
        <main className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
            <div className="container mx-auto px-4 py-16">
                <p style={{ color: "var(--color-text-muted)" }}>CV page — coming soon</p>
            </div>
        </main>
    );
}
