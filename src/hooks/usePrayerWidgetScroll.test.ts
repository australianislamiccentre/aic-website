import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePrayerWidgetScroll } from "./usePrayerWidgetScroll";

describe("usePrayerWidgetScroll", () => {
  beforeEach(() => {
    window.scrollY = 0;
    // Default matchMedia mock returns matches: false (reduced motion disabled)
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function dispatchScroll(y: number) {
    window.scrollY = y;
    window.dispatchEvent(new Event("scroll"));
  }

  it("returns false initially", () => {
    const { result } = renderHook(() => usePrayerWidgetScroll());
    expect(result.current).toBe(false);
  });

  it("hides when scrolling down past the 80px threshold", () => {
    const { result } = renderHook(() => usePrayerWidgetScroll());
    act(() => dispatchScroll(200));
    expect(result.current).toBe(true);
  });

  it("reveals when scrolling up", () => {
    const { result } = renderHook(() => usePrayerWidgetScroll());
    act(() => dispatchScroll(200));
    expect(result.current).toBe(true);
    act(() => dispatchScroll(100));
    expect(result.current).toBe(false);
  });

  it("stays visible when within 80px of top regardless of direction", () => {
    const { result } = renderHook(() => usePrayerWidgetScroll());
    act(() => dispatchScroll(40));
    expect(result.current).toBe(false);
    act(() => dispatchScroll(10));
    expect(result.current).toBe(false);
  });

  it("stays visible when paused", () => {
    const { result } = renderHook(() => usePrayerWidgetScroll(true));
    act(() => dispatchScroll(300));
    expect(result.current).toBe(false);
  });

  it("stays visible when prefers-reduced-motion is set", () => {
    const matchMediaMock = vi.fn().mockImplementation((q: string) => ({
      matches: q.includes("prefers-reduced-motion"),
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }));
    Object.defineProperty(window, "matchMedia", { writable: true, value: matchMediaMock });

    const { result } = renderHook(() => usePrayerWidgetScroll());
    act(() => dispatchScroll(300));
    expect(result.current).toBe(false);
  });

  it("removes scroll listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => usePrayerWidgetScroll());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
  });
});
