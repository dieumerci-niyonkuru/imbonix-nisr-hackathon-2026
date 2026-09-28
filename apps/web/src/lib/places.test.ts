import { describe, expect, it } from "vitest";
import places from "@/data/generated/places.json";
import { foldText, listPlaces, placeAddress, placeHref, placeMatchScore, type Place, type PlaceIndex } from "@/lib/places";

const index: PlaceIndex = {
  sectors: [
    ["Bumbogo", "gasabo"],
    ["Kagarama", "kicukiro"],
  ],
  cells: [
    ["Musave", 0],
    ["Kanserege", 1],
  ],
  villages: [
    ["Rugando", 0],
    ["Kagarama", 1],
  ],
};
const districtNames = { gasabo: "Gasabo", kicukiro: "Kicukiro" };
const listed = listPlaces(index, districtNames);
const find = (kind: Place["kind"], name: string) => listed.find((place) => place.kind === kind && place.name === name)!;
const search = (query: string) => {
  const folded = foldText(query);
  const words = folded.split(/\s+/);
  return listed.filter((place) => placeMatchScore(place, folded, words) !== undefined).map((place) => place.key);
};

describe("place index", () => {
  it("lists every sector, cell and village with the units it lies in", () => {
    expect(listed).toHaveLength(6);
    const village = find("village", "Rugando");
    expect(village).toMatchObject({ sector: "Bumbogo", cell: "Musave", districtName: "Gasabo" });
    expect(placeAddress(village)).toBe("Musave cell, Bumbogo sector, Gasabo district");
    expect(placeAddress(find("cell", "Kanserege"))).toBe("Kagarama sector, Kicukiro district");
  });

  it("links a place to its district page with its sector selected", () => {
    expect(placeHref(find("sector", "Bumbogo"))).toBe("/districts/gasabo?sector=Bumbogo#sectors");
    expect(placeHref(find("village", "Rugando"))).toBe("/districts/gasabo?sector=Bumbogo&cell=Musave&village=Rugando#sectors");
  });

  it("finds a place by its own name, and narrows by the units it lies in", () => {
    expect(search("rugando")).toEqual(["village:0"]);
    expect(search("kagarama")).toEqual(["sector:1", "village:1"]);
    expect(search("kagarama kanserege")).toEqual(["cell:1", "village:1"]);
    // A district name alone does not list every place inside it.
    expect(search("gasabo")).toEqual([]);
  });

  it("covers the whole country", () => {
    expect(places.counts).toEqual({ sectors: 416, cells: 2148, villages: 14815 });
    expect(places.sectors).toHaveLength(416);
    expect(places.villages).toHaveLength(14815);
  });
});
