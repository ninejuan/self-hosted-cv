import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { ErrorBoundaryView } from "@/components/error-boundary";
import "./app.css";

export const meta: Route.MetaFunction = () => [
    { title: "Self-Hosted CV" },
    { name: "description", content: "Self-hosted CV/portfolio platform inspired by ReadCV" },
    { name: "theme-color", content: "#A8E765" },
    { property: "og:title", content: "Self-Hosted CV" },
    { property: "og:description", content: "Self-hosted CV/portfolio platform inspired by ReadCV" },
    { property: "og:type", content: "website" },
];

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                var theme = localStorage.getItem('theme');
                                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                                    document.documentElement.classList.add('dark');
                                }
                            })();
                        `,
                    }}
                />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    return <ErrorBoundaryView error={error} />;
}
