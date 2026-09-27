"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { ArrowRightIcon, ChevronDownIcon, MapPinIcon } from "@heroicons/react/20/solid";

export type FinderProvince = { label: string; districts: { name: string; slug: string }[] };

/** Choose a district and open its profile. With none chosen, the button opens the list of all districts. */
export function DistrictFinder({ provinces }: { provinces: FinderProvince[] }) {
  const router = useRouter();
  const selectId = useId();
  const [districtSlug, setDistrictSlug] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        router.push(districtSlug ? `/districts/${districtSlug}` : "/districts");
      }}
      className="flex w-full flex-col gap-2 sm:flex-row"
    >
      <label htmlFor={selectId} className="sr-only">
        Choose a district
      </label>
      <div className="relative flex-1">
        <MapPinIcon
          className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-royal"
          aria-hidden="true"
        />
        <select
          id={selectId}
          value={districtSlug}
          onChange={(event) => setDistrictSlug(event.target.value)}
          className="h-12 w-full appearance-none rounded-xl bg-white pl-11 pr-10 text-[15px] font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        >
          <option value="">Choose a district</option>
          {provinces.map((province) => (
            <optgroup key={province.label} label={province.label}>
              {province.districts.map((district) => (
                <option key={district.slug} value={district.slug}>
                  {district.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <ChevronDownIcon
          className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan px-5 text-[15px] font-bold text-navy-900 transition-colors hover:bg-cyan-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {districtSlug ? "Open profile" : "All districts"}
        <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
