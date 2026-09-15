import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import { ErrorBoundaryView } from "@/components/error-boundary";
import "./app.css";

const GOOGLE_ANALYTICS_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;

export async function loader() {
    const isServer = typeof window === "undefined";
    const baseUrl = isServer
        ? (process.env.API_INTERNAL_URL ?? "http://localhost:47300")
        : "";

    try {
        const res = await fetch(`${baseUrl}/api/site-settings`, {
            headers: { Accept: "application/json" },
        });
        if (!res.ok) return { site: null };
        const site = await res.json();
        return { site };
    } catch {
        return { site: null };
    }
}

interface SiteSettings {
    siteTitle?: string;
    siteDescription?: string;
    faviconUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImageUrl?: string;
    themeColor?: string;
    googleAnalyticsId?: string;
    customCss?: string;
}

export const meta: Route.MetaFunction = ({ data }) => {
    const site = (data as { site?: SiteSettings } | undefined)?.site;
    const title = site?.siteTitle || "Self-Hosted CV";
    const description = site?.siteDescription || "Self-hosted CV/portfolio platform";
    const ogTitle = site?.ogTitle || title;
    const ogDescription = site?.ogDescription || description;
    const themeColor = site?.themeColor || "#A8E765";

    return [
        { title },
        { name: "description", content: description },
        { name: "theme-color", content: themeColor },
        { property: "og:title", content: ogTitle },
        { property: "og:description", content: ogDescription },
        { property: "og:type", content: "website" },
        ...(site?.ogImageUrl ? [{ property: "og:image", content: site.ogImageUrl }] : []),
    ];
};

function SiteHead() {
    const data = useRouteLoaderData("root") as { site?: SiteSettings } | undefined;
    const site = data?.site;
    if (!site) return null;
    const googleAnalyticsId = site.googleAnalyticsId;
    const analyticsEnabled =
        googleAnalyticsId !== undefined &&
        GOOGLE_ANALYTICS_ID_PATTERN.test(googleAnalyticsId);

    return (
        <>
            {site.faviconUrl && <link rel="icon" type="image/png" href={site.faviconUrl} />}
            {site.customCss && <style dangerouslySetInnerHTML={{ __html: site.customCss }} />}
            {analyticsEnabled && (
                <script
                    async
                    src="/google-analytics.js"
                    data-measurement-id={googleAnalyticsId}
                />
            )}
        </>
    );
}

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <SiteHead />
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
