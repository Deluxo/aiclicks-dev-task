import type { MentionsRequest, MentionsResponse, TrendsRequest, TrendsResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw new Error(`Request to ${path} failed with status ${res.status}`);
  return res.json() as Promise<T>;
}

export function fetchMentions(req: MentionsRequest, signal?: AbortSignal): Promise<MentionsResponse> {
  return post("/mentions", req, signal);
}

export function fetchTrends(req: TrendsRequest, signal?: AbortSignal): Promise<TrendsResponse> {
  return post("/mentions/trends", req, signal);
}
