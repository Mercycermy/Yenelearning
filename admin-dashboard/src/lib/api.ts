export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                window.location.href = "/login";
            }
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.statusText}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
}
