import { apiClient } from "./client";
import { ENDPOINTS } from "./config";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatResponse = {
  message?: string;
  data?: {
    response?: string | null;
  };
};

export interface SlidesSuccess {
  type: "slides_result";
  status: "success";
  downloadUrl?: string;
  slidePageCount?: number;
  themeClassification?: string;
  themeId?: string;
  mode?: string;
  confidenceScore?: string;
}

export interface SlidesError {
  type: "slides_result";
  status: "error";
  httpStatus?: number;
  error?: string;
}

export type SlidesResult = SlidesSuccess | SlidesError;

export type TaChatResponseContent =
  | { kind: "text"; text: string }
  | { kind: "slides_success"; slide: SlidesSuccess }
  | { kind: "slides_error"; slide: SlidesError };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isSlidesResult(obj: unknown): obj is SlidesResult {
  if (!isRecord(obj) || obj.type !== "slides_result") return false;

  return obj.status === "success" || obj.status === "error";
}

export function parseTaChatResponse(response?: string | null): TaChatResponseContent {
  if (!response) {
    return { kind: "text", text: "No response" };
  }

  try {
    const parsed: unknown = JSON.parse(response);
    if (isSlidesResult(parsed)) {
      return parsed.status === "success"
        ? { kind: "slides_success", slide: parsed }
        : { kind: "slides_error", slide: parsed };
    }
  } catch {
    // Fall back to the plain text flow.
  }

  return { kind: "text", text: response };
}

export async function sendChatMessage(message: string, history: ChatMessage[]) {
  return apiClient<ChatResponse>(ENDPOINTS.TA_CHAT, {
    method: "POST",
    body: { message, history } as unknown as Record<string, unknown>,
  });
}
