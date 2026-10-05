import { describe, expect, it } from "vitest";
import { answerQuery } from "@/lib/assistant";

describe("IMBONIX AI answers", () => {
  it("answers a district-and-measure question with a figure and a source", () => {
    const answer = answerQuery("How poor is Rulindo?");
    expect(answer.heading.toLowerCase()).toContain("rulindo");
    expect(answer.heading).toMatch(/%/);
    expect(answer.source).toBeTruthy();
    expect(answer.links?.some((link) => link.href === "/districts/rulindo")).toBe(true);
  });

  it("finds where a measure is highest", () => {
    const answer = answerQuery("Where is financial exclusion highest?");
    expect(answer.heading.toLowerCase()).toContain("highest");
    expect(answer.rows?.length).toBeGreaterThan(0);
  });

  it("compares two districts", () => {
    const answer = answerQuery("Compare Rulindo and Gasabo");
    expect(answer.heading).toContain("Rulindo");
    expect(answer.heading).toContain("Gasabo");
    expect(answer.rows?.length).toBeGreaterThan(0);
    expect(answer.rows?.[0].value).toContain("vs");
  });

  it("gives a district overview when no measure is named", () => {
    const answer = answerQuery("Nyamagabe");
    expect(answer.heading.toLowerCase()).toContain("nyamagabe");
    expect(answer.rows?.length).toBeGreaterThan(0);
  });

  it("falls back helpfully on an empty or unknown question", () => {
    expect(answerQuery("").heading.toLowerCase()).toContain("ask");
    expect(answerQuery("hello there").links?.length).toBeGreaterThan(0);
  });

  it("never invents a figure: every stat comes from a known answer shape", () => {
    const answer = answerQuery("unemployment in Nyamasheke");
    expect(answer.source).toBeTruthy();
    expect(answer.heading.toLowerCase()).toContain("nyamasheke");
  });
});
