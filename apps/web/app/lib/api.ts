import type { CVData } from "@/types/cv";

function getBaseUrl(isServer: boolean): string {
    if (isServer) {
        return process.env.API_INTERNAL_URL ?? "http://localhost:3000";
    }
    return import.meta.env.VITE_API_URL ?? "";
}

export async function fetchCV(): Promise<CVData> {
    const isServer = typeof window === "undefined";
    const baseUrl = getBaseUrl(isServer);

    const res = await fetch(`${baseUrl}/api/cv`, {
        headers: { Accept: "application/json" },
    });

    if (!res.ok) {
        throw new Response("Failed to fetch CV data", { status: res.status });
    }

    return res.json();
}
