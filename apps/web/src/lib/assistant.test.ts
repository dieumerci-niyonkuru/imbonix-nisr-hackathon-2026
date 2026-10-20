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
    expect(answerQuery("").heading.toLowerCase()).toContain("help");
    expect(answerQuery("hello there").links?.length).toBeGreaterThan(0);
  });

  it("never invents a figure: every stat comes from a known answer shape", () => {
    const answer = answerQuery("unemployment in Nyamasheke");
    expect(answer.source).toBeTruthy();
    expect(answer.heading.toLowerCase()).toContain("nyamasheke");
  });

  it("explains financial health versus access from FinScope", () => {
    const answer = answerQuery("Explain financial health vs. access");
    expect(answer.rows?.some((row) => row.label === "Financially healthy")).toBe(true);
    expect(answer.source).toContain("FinScope");
  });

  it("describes the datasets it is built on, without linking the catalogue page", () => {
    const answer = answerQuery("What datasets do you have?");
    expect(answer.heading.toLowerCase()).toContain("data");
    expect(answer.links?.some((link) => link.href === "/data/catalog")).toBe(false);
    expect(answer.links?.some((link) => link.href === "/data/key-figures")).toBe(true);
  });

  it("welcomes a greeting with links instead of a blank fallback", () => {
    const answer = answerQuery("hi");
    expect(answer.heading.toLowerCase()).toContain("hello");
    expect(answer.links?.length).toBeGreaterThan(0);
    expect(answerQuery("thanks!").links?.length).toBeGreaterThan(0);
    // Small talk gets the warm greeting, not the generic fallback.
    expect(answerQuery("how are you?").heading.toLowerCase()).toContain("hello");
  });

  it("defines a NISR term without inventing a figure", () => {
    const answer = answerQuery("What is multidimensional poverty?");
    expect(answer.heading.toLowerCase()).toContain("multidimensional");
    expect(answer.body.length).toBeGreaterThan(20);
  });

  it("finds the poorest district as an extreme on poverty", () => {
    const answer = answerQuery("Which is the poorest district?");
    expect(answer.heading.toLowerCase()).toContain("highest");
    expect(answer.rows?.length).toBeGreaterThan(0);
    expect(answer.source).toBeTruthy();
  });

  it("answers a 'how many' question from the site's own counts", () => {
    const answer = answerQuery("How many districts are there?");
    expect(answer.heading).toContain("30");
    expect(answer.heading.toLowerCase()).toContain("district");
  });

  it("explains how social protection (VUP) reaches people", () => {
    const answer = answerQuery("How does VUP reach people?");
    expect(answer.heading).toContain("VUP");
    expect(answer.rows?.length).toBeGreaterThan(0);
    expect(answer.source).toBeTruthy();
  });

  it("gives a national snapshot for a broad question", () => {
    const answer = answerQuery("How is Rwanda doing overall?");
    expect(answer.stats?.length).toBeGreaterThan(0);
    expect(answer.links?.some((link) => link.href === "/data/key-figures")).toBe(true);
  });

  it("recommends what to prioritise in a district, with a feasible focus", () => {
    const answer = answerQuery("What should be prioritised in Rulindo?");
    expect(answer.heading.toLowerCase()).toContain("rulindo");
    expect(answer.rows?.length).toBeGreaterThan(0);
    expect(
      answer.links?.some(
        (link) =>
          link.href === "/social-protection/intervention-planner" || link.href === "/social-protection/priority-districts",
      ),
    ).toBe(true);
  });

  it("names where to act first nationally", () => {
    const answer = answerQuery("Which districts should be prioritised?");
    expect(answer.heading.toLowerCase()).toContain("act");
    expect(answer.rows?.length).toBeGreaterThan(0);
    expect(answer.links?.some((link) => link.href === "/social-protection/priority-districts")).toBe(true);
  });

  it("explains the challenge IMBONIX answers and its solution", () => {
    const answer = answerQuery("What problem does IMBONIX solve?");
    expect(answer.body.toLowerCase()).toMatch(/financial|poverty|social protection/);
    expect(answer.links?.length).toBeGreaterThan(0);
  });

  it("answers every supported measure and intent without ever throwing", () => {
    const probes = [
      // measures (national, highest/lowest, and per-district) that go through meta()/reference()/extremes()
      "formally included",
      "food insecurity",
      "female-headed households",
      "disability",
      "wasting",
      "labour force participation",
      "where is wasting highest",
      "where is disability lowest",
      "food insecurity in Nyamasheke",
      "formally included in Gasabo",
      "poorest district",
      "richest district",
      "which district has the most underweight children",
      // definitions, counts, social protection, priorities, about, greetings, national
      "what is a SACCO",
      "what is mobile money",
      "what is NEET",
      "define extreme poverty",
      "what does small area estimation mean",
      "how many villages are there",
      "how many provinces",
      "how many studies",
      "tell me about VUP",
      "social protection",
      "where should we act first",
      "what should be prioritised in Rulindo",
      "what problem does IMBONIX solve",
      "hello",
      "thanks a lot",
      "how is Rwanda doing overall",
    ];
    for (const probe of probes) {
      const answer = answerQuery(probe);
      expect(answer.heading.length, `"${probe}" should return a heading`).toBeGreaterThan(0);
    }
  });
});
