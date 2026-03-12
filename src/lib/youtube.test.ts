import { describe, it, expect } from "vitest";
import { extractYoutubeVideoId } from "./youtube";

describe("extractYoutubeVideoId", () => {
  it("extracts ID from standard watch URL", () => {
    expect(
      extractYoutubeVideoId("https://www.youtube.com/watch?v=BckNzo1ufDw"),
    ).toBe("BckNzo1ufDw");
  });

  it("extracts ID from watch URL without www", () => {
    expect(
      extractYoutubeVideoId("https://youtube.com/watch?v=BckNzo1ufDw"),
    ).toBe("BckNzo1ufDw");
  });

  it("extracts ID from watch URL with extra params", () => {
    expect(
      extractYoutubeVideoId(
        "https://www.youtube.com/watch?v=BckNzo1ufDw&list=PLxyz&t=120",
      ),
    ).toBe("BckNzo1ufDw");
  });

  it("extracts ID from youtu.be short URL", () => {
    expect(extractYoutubeVideoId("https://youtu.be/BckNzo1ufDw")).toBe(
      "BckNzo1ufDw",
    );
  });

  it("extracts ID from youtu.be with query params", () => {
    expect(extractYoutubeVideoId("https://youtu.be/BckNzo1ufDw?t=30")).toBe(
      "BckNzo1ufDw",
    );
  });

  it("extracts ID from embed URL", () => {
    expect(
      extractYoutubeVideoId("https://www.youtube.com/embed/BckNzo1ufDw"),
    ).toBe("BckNzo1ufDw");
  });

  it("extracts ID from embed URL with params", () => {
    expect(
      extractYoutubeVideoId(
        "https://www.youtube.com/embed/BckNzo1ufDw?autoplay=1&rel=0",
      ),
    ).toBe("BckNzo1ufDw");
  });

  it("returns null for empty string", () => {
    expect(extractYoutubeVideoId("")).toBeNull();
  });

  it("returns null for invalid URL", () => {
    expect(extractYoutubeVideoId("not-a-url")).toBeNull();
  });

  it("returns null for non-YouTube URL", () => {
    expect(extractYoutubeVideoId("https://vimeo.com/123456789")).toBeNull();
  });

  it("returns null for YouTube URL without video ID", () => {
    expect(extractYoutubeVideoId("https://www.youtube.com/")).toBeNull();
  });

  it("returns null for YouTube channel URL", () => {
    expect(
      extractYoutubeVideoId("https://www.youtube.com/channel/UCxyz"),
    ).toBeNull();
  });
});
