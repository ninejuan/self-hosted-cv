const BASE_URL = typeof window !== "undefined"
    ? (import.meta.env.VITE_API_URL ?? "")
    : (process.env.API_INTERNAL_URL ?? "http://localhost:3000");

let csrfToken: string | null = null;

export class AdminFetchError extends Error {
    readonly name = "AdminFetchError";

    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
    }
}

export type AdminBlobResponse = {
    readonly blob: Blob;
    readonly headers: Headers;
};

export async function getCsrfToken(): Promise<string> {
    if (csrfToken) return csrfToken;
    const res = await fetch(`${BASE_URL}/api/auth/csrf-token`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch CSRF token");
    const data = await res.json();
    csrfToken = data.csrfToken as string;
    return csrfToken!;
}

export function clearCsrfToken() {
    csrfToken = null;
}

interface FetchOptions extends Omit<RequestInit, "body"> {
    body?: unknown;
    responseType?: "blob" | "json";
}

export function adminFetch(
    path: string,
    options: FetchOptions & { responseType: "blob" },
): Promise<AdminBlobResponse>;
export function adminFetch<T = unknown>(
    path: string,
    options?: FetchOptions & { responseType?: "json" },
): Promise<T>;
export async function adminFetch<T = unknown>(
    path: string,
    options: FetchOptions = {},
): Promise<AdminBlobResponse | T> {
    const { body, headers: customHeaders, responseType = "json", ...rest } = options;
    const method = rest.method ?? "GET";

    const headers: Record<string, string> = {
        Accept: "application/json",
        ...(customHeaders as Record<string, string>),
    };

    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    if (method !== "GET" && method !== "HEAD") {
        const token = await getCsrfToken();
        headers["X-CSRF-Token"] = token;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        ...rest,
        method,
        headers,
        credentials: "include",
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
        clearCsrfToken();
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        throw new AdminFetchError("Unauthorized", res.status);
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new AdminFetchError(
            err.message ?? `Request failed: ${res.status}`,
            res.status,
        );
    }

    if (res.status === 204) return undefined as T;
    if (responseType === "blob") {
        return { blob: await res.blob(), headers: res.headers };
    }
    return res.json();
}

export async function adminUpload(
    url: string,
    file: File,
    onProgress?: (pct: number) => void,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        });

        xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
            } else {
                reject(new Error(`Upload failed: ${xhr.status}`));
            }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.send(file);
    });
}

export async function checkAuth(cookie?: string): Promise<{ authenticated: boolean; user?: unknown }> {
    try {
        const headers: Record<string, string> = { Accept: "application/json" };
        if (cookie) headers["Cookie"] = cookie;

        const isServer = typeof window === "undefined";
        const baseUrl = isServer
            ? (process.env.API_INTERNAL_URL ?? "http://localhost:3000")
            : (import.meta.env.VITE_API_URL ?? "");

        const res = await fetch(`${baseUrl}/api/auth/me`, {
            headers,
            credentials: "include",
        });

        if (!res.ok) return { authenticated: false };
        const user = await res.json();
        return { authenticated: true, user };
    } catch {
        return { authenticated: false };
    }
}
