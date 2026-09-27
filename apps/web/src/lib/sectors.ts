import sectorsJson from "@/data/generated/sectors.json";

export type SectorRow = {
  sector: string;
  population: number | null;
  nonpoor: number | null;
  vulnerable: number | null;
  moderatelyPoor: number | null;
  severelyPoor: number | null;
  mpiHeadcount: number | null;
  mpi: number | null;
  povertySae: number | null;
  d: string | null;
  bbox: [number, number, number, number] | null;
};

const SECTORS = sectorsJson as unknown as Record<string, SectorRow[]>;

/** Sectors of one district (server-side only: the full file is about 400 KB). */
export function sectorsOf(district: string): SectorRow[] {
  return SECTORS[district] ?? [];
}

export const SECTOR_MEASURES = [
  {
    id: "povertySae",
    label: "Poverty rate (small area estimate)",
    short: "Poverty (SAE)",
    source: "NISR EICV7 district presentations (small area estimation with the 2022 census), 2023/24",
    status: "model_estimate",
    note: "Model estimates, not adjusted to the district's survey figure. Use them to compare sectors within this district.",
  },
  {
    id: "mpiHeadcount",
    label: "Multidimensionally poor (census)",
    short: "MPI poor",
    source: "NISR RPHC5 Non-Monetary Poverty report, Table C.10, 2022",
    status: "observed",
    note: "Census full count: no sampling error.",
  },
  {
    id: "severelyPoor",
    label: "Severely poor, nonmonetary measure (census)",
    short: "Severely poor",
    source: "NISR RPHC5 Non-Monetary Poverty report, Table C.1, 2022",
    status: "observed",
    note: "Census full count: no sampling error.",
  },
] as const;

export type SectorMeasure = (typeof SECTOR_MEASURES)[number]["id"];
