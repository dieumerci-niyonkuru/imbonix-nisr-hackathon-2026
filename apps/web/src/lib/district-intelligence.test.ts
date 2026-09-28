import { describe, expect, it } from "vitest";
import { DISTRICTS, districtBySlug } from "@/lib/data";
import { actionsFor, limitationsFor, needOf, priorityFor, stepsFor } from "@/lib/district-intelligence";

describe("district intelligence", () => {
  it("splits the 30 districts into thirds of need by rank", () => {
    expect(needOf({ rank: 1, of: 30 })).toBe("high");
    expect(needOf({ rank: 10, of: 30 })).toBe("high");
    expect(needOf({ rank: 11, of: 30 })).toBe("moderate");
    expect(needOf({ rank: 20, of: 30 })).toBe("moderate");
    expect(needOf({ rank: 21, of: 30 })).toBe("low");
    expect(needOf(undefined)).toBeUndefined();
  });

  it("gives every district the four steps, each with its readings", () => {
    for (const district of DISTRICTS) {
      const steps = stepsFor(district);
      expect(steps.map((step) => step.id)).toEqual(["access", "poverty", "vulnerability", "protection"]);
      for (const step of steps) expect(step.readings.length, `${district.name} ${step.id}`).toBeGreaterThan(0);
    }
  });

  it("spreads the districts across the three priority levels under the stated rule", () => {
    const levels = DISTRICTS.map((district) => priorityFor(district).level);
    expect(levels.filter((level) => level === "High")).toHaveLength(11);
    expect(levels.filter((level) => level === "Moderate")).toHaveLength(12);
    expect(levels.filter((level) => level === "Lower")).toHaveLength(7);
  });

  it("explains Nyamagabe's priority by the dimensions that put it among the 10 most affected", () => {
    const nyamagabe = districtBySlug("nyamagabe")!;
    const priority = priorityFor(nyamagabe);
    expect(priority.level).toBe("High");
    expect(priority.dimensions).toEqual(["poverty", "natural hazards"]);
    expect(priority.reason).toContain("2 of the 4 core dimensions");
  });

  it("rates access by the weaker of formal inclusion and smartphones", () => {
    // Nyamagabe is well served formally but has the fewest smartphones of all 30 districts.
    const access = stepsFor(districtBySlug("nyamagabe")!).find((step) => step.id === "access")!;
    expect(access.level).toBe("Low");
    expect(access.summary).toContain("smartphone");
  });

  it("recommends only levers the evidence flags, and always states the limits", () => {
    const nyarugenge = districtBySlug("nyarugenge")!;
    expect(actionsFor(nyarugenge)).toHaveLength(0);
    expect(actionsFor(districtBySlug("nyamagabe")!).map((action) => action.lever.id)).toContain("income");
    expect(limitationsFor(nyarugenge).some((line) => line.includes("associations, not causes"))).toBe(true);
  });
});
