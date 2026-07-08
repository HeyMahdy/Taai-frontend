import { describe, expect, it } from "vitest";
import { isSlidesResult, parseTaChatResponse } from "./chat";

describe("parseTaChatResponse", () => {
  it("keeps plain text responses unchanged", () => {
    expect(parseTaChatResponse("Hello from TA")).toEqual({ kind: "text", text: "Hello from TA" });
  });

  it("parses slides success payloads", () => {
    const payload = JSON.stringify({
      type: "slides_result",
      status: "success",
      downloadUrl: "https://example.com/slides.pptx",
      slidePageCount: 10,
      themeClassification: "roadmap",
      themeId: "theme-123",
      mode: "sync",
      confidenceScore: "5/5",
    });

    const result = parseTaChatResponse(payload);

    expect(result).toEqual({
      kind: "slides_success",
      slide: {
        type: "slides_result",
        status: "success",
        downloadUrl: "https://example.com/slides.pptx",
        slidePageCount: 10,
        themeClassification: "roadmap",
        themeId: "theme-123",
        mode: "sync",
        confidenceScore: "5/5",
      },
    });
  });

  it("parses slides error payloads", () => {
    const payload = JSON.stringify({
      type: "slides_result",
      status: "error",
      httpStatus: 400,
      error: "Invalid slide request",
    });

    const result = parseTaChatResponse(payload);

    expect(result).toEqual({
      kind: "slides_error",
      slide: {
        type: "slides_result",
        status: "error",
        httpStatus: 400,
        error: "Invalid slide request",
      },
    });
  });

  it("falls back to text for malformed JSON", () => {
    expect(parseTaChatResponse("{not-json")).toEqual({ kind: "text", text: "{not-json" });
  });
});

describe("isSlidesResult", () => {
  it("accepts valid slides results", () => {
    expect(isSlidesResult({ type: "slides_result", status: "success" })).toBe(true);
    expect(isSlidesResult({ type: "slides_result", status: "error" })).toBe(true);
  });

  it("rejects non-slide objects", () => {
    expect(isSlidesResult({ type: "text", status: "success" })).toBe(false);
    expect(isSlidesResult(null)).toBe(false);
  });
});