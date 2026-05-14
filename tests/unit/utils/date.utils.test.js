import { describe, expect, it } from "vitest";
import { formatKickoffLong, formatKickoffShort } from "../../../src/lib/utils/date.utils.js";

describe("formatKickoffShort", () => {
  it("returns empty string for falsy input", () => {
    expect(formatKickoffShort("")).toBe("");
    expect(formatKickoffShort(null)).toBe("");
    expect(formatKickoffShort(undefined)).toBe("");
  });

  it("returns empty string for invalid date strings", () => {
    expect(formatKickoffShort("not-a-date")).toBe("");
  });

  it("formats a valid ISO timestamp with day-of-week and 24h time in de-DE", () => {
    const result = formatKickoffShort("2024-08-23T18:30:00Z");
    // de-DE outputs e.g. "Fr., 20:30" — exact punctuation varies by ICU version
    expect(result).toMatch(/[A-Za-zÄÖÜäöü]+\.?,?\s\d{2}:\d{2}/);
  });
});

describe("formatKickoffLong", () => {
  it("returns a long German date for valid input", () => {
    const result = formatKickoffLong("2024-08-23T18:30:00Z");
    expect(result).toContain("Aug");
    expect(result).toContain("2024");
  });
});
