export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

const SESSION_KEY = "student_management_session";
const AUTH_SESSION_INVALIDATED_EVENT =
  "student-management:auth-session-invalidated";

const invalidateSession = () => {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_SESSION_INVALIDATED_EVENT));
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const headers = new Headers(options.headers);

  const body =
    options.body === undefined
      ? undefined
      : typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);

  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Lấy JWT từ session
  if (typeof window !== "undefined") {
    const sessionData =
      localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);

    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);

        if (session.token) {
          headers.set("Authorization", `Bearer ${session.token}`);
        }
      } catch {
        // Ignore invalid session
      }
    }
  }

  const endpoint = path.replace(/^\/+/, "");

  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    ...options,
    headers,
    body,
  });

  if (!response.ok) {
    const message = await response.text();

    if (response.status === 401) {
      invalidateSession();
    }

    throw new ApiError(
      message || `API request failed with status ${response.status}.`,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
