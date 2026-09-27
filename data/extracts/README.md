# Published-table extracts

Small tables built from **published** NISR and government tables, so the team can build district and sector views before any microdata work. These are published aggregates, not microdata. Cite the source whenever you display them.

Every row carries a `status`:

- **observed**: an official published estimate.
- **model_estimate**: NISR small-area estimates.
- **projection**: NISR population projections.
- **calculated**: our own arithmetic, such as a rate × population.

## Files

| File | What it is | Built by |
| --- | --- | --- |
| `district_indicators_long.csv` | 30 districts × 63 indicators, with the NISR standard error and 95% CI where published (EICV7, LFS 2025) | `scripts/data/extract_published_tables.py` |
| `district_indicators_wide.csv` | Same values, one row per district (convenient for the web app) | script |
| `sector_census2022.csv` | All **416 sectors**: Census 2022 non-monetary poverty (non-poor / vulnerable / moderately / severely poor), census MPI (headcount, intensity, M0), population by sex | script |
| `sector_poverty_eicv7_sae.csv` | All **416 sectors**: EICV7 monetary poverty rate from NISR small-area estimation, transcribed from the district presentation maps (see caveats) | manual transcription, validated |
| `lfs_district_2017_2025.csv` | LFS district labour indicators per year, 2017–2025 (unemployment, NEET, earnings, participation, underutilisation…) | script |
| `vup_benefit_delivery_eicv7.csv` | VUP benefit amounts, payment channel and payment timeliness by component and poverty status | script |
| `eicv7_district_poverty_2024.csv` | District poverty 2024 and modelled 2017 (Poverty Profile Annex B). Superseded by the long file, which adds SE and CI | manual |
| `finscope2024_district_access_strand.csv` | FinScope 2024 district access strand, read from report Figure 13 | manual |
| `finscope2020_district_banked.csv` | FinScope 2020 adults using bank services by district (report Figure 17). **Includes over-the-counter users, so it is not comparable with 2024 "banked"**; see below | manual (text layer of the PDF) |
| `dhs2025_district_child_nutrition.csv` | DHS 2025 stunting, severe stunting, wasting, overweight and underweight by district (Table D.4) | manual, checked line by line against the PDF text |
| `cfsva2024_district_food_consumption.csv` | CFSVA 2024 poor and borderline food consumption by district (Figure 7.3 labels) | manual, read from the rendered chart |
| `cfsva2024_district_natural_hazards.csv` | CFSVA 2024 households affected by natural hazards by district, split by main hazard (Figure 8.4) | `scripts/data/digitize_cfsva2024_hazards.py` |
| `dhs2025_mobile_bank_by_group.csv` | DHS 2025 phone ownership, mobile-money use and bank accounts, by sex × age, residence, province, education and wealth quintile (Tables 15.5.1–15.5.2). Not by district | parsed from the PDF text |
| `vup_timeliness_trend.csv` | VUP payment timeliness as reported by beneficiaries, 2013/14, 2016/17 and 2023/24 | manual (EICV4 and EICV5 reports) + EICV7 tables |

Rebuild everything except the manual files:

```powershell
python scripts/data/download_nisr_public.py            # downloads to data/raw (gitignored)
pip install -r scripts/data/requirements.txt
python scripts/data/extract_published_tables.py
python scripts/data/build_web_data.py            # refreshes the website's JSON (apps/web/src/data/generated/)
```

## District indicators (`indicator_id` prefixes)

| Prefix | Source | Year | Notes |
| --- | --- | --- | --- |
| `eicv7_` | EICV7 Main Indicators report, district annex tables (A3.7, A5.12–A5.19, A6.20, A8.22, A9.23) | 2023/24 | Includes SE and CI. Tables A1.3, A2.4, A3.5, A3.6 and A4.8 stop at province level, so they are not included |
| `finscope_` | FinScope 2024 report, Figure 13 | 2024 | Integer chart labels. Nyarugenge's informal/excluded split is blank. About 400 adults per district, so roughly ±3 points |
| `census_` | RPHC5 Main Indicators and the Non-Monetary Poverty report | 2022 | Full count, no sampling error |
| `lfs_` | LFS 2025 annual tables and standard-errors annex | 2025 | Includes SE and CI (except median earnings) |
| `proj_` | NISR subnational population projections (single age) | 2024, 2026 | Adults 16+, women 16+, youth 16–30 |
| `rssb_`, `cbhi_` | Statistical Yearbook 2025, Tables 12.2.3 and 12.2.9 (RSSB data) | 2023/24, 2024/25 | Counts. RSSB = contributing formal-sector members |
| `ec_` | Establishment Census 2023 tables (2.1.4, 3.10, 3.18) | 2023 | Full count. Informal shares are our calculation from the published counts |
| `finscope2020_` | FinScope 2020 report, Figure 17 | 2020 | Bank users including over-the-counter users |
| `dhs_` | DHS 2025 final report, Table D.4 | 2025 | About 160–550 children per district, so expect a few points of sampling error |
| `cfsva_` | CFSVA 2024 report (WFP with MINAGRI and NISR), Figures 7.3 and 8.4 | 2024 (April) | % of households. Hazard values are digitized (about ±1 point) |
| `calc_` | IMBONIX calculations | – | For example, excluded adults ≈ FinScope rate × 2024 adult projection |

**Checks passed**
- The census sector populations sum to 13,246,394, the national census total.
- The calculated financially excluded adults (29 districts) sum to 317,366, close to FinScope's national figure of about 317,000.
- Adults 16+ in 2024 total 8.43M, consistent with LFS.

**Spelling fixes in the source workbooks:** "goma" (RPHC5 Table 59) and "Nyahibu" (LFS Table 23) are mapped to Ngoma and Nyabihu.

## Values read from report charts and PDFs: method and checks

- **FinScope 2020, Figure 17.** Read from the PDF text layer (`pdftotext -table`). The bars are sorted, the values fall monotonically, and the text confirms the range (Gasabo 80%, Ngororero 8%) and that seven districts are at or above the 36% national figure.
  - **Definition trap.** The 36% counts adults with a bank account in their own name (22%) *plus* over-the-counter users without one (14%). FinScope 2024's "banked" (22%) counts own accounts only, and the 2024 report restates 2020 as 22%.
  - Putting the two district series side by side would show a false collapse (Gasabo 80% → 51%). Compare ranks at most (district Spearman ρ = 0.64). A like-for-like trend needs the 2020 microdata (NADA study 89).
- **DHS 2025, Table D.4.** Every value was checked against the PDF text by script (30 of 30 districts match).
- **CFSVA 2024, Figure 7.3.** The chart labels (poor and borderline %) were read from the page rendered at high resolution. The sums match the three districts quoted in the text (Nyamasheke 35%, Rubavu 31%, Rutsiro 28%). `cfsva_inadequate_food_consumption` adds two rounded labels, so it can differ by 1 point from an unrounded figure.
- **CFSVA 2024, Figure 8.4.** The chart has no value labels.
  - `digitize_cfsva2024_hazards.py` calibrates the axis from the gridlines, measures each bar's colour segments, and refuses to write output unless it matches the 11 values quoted in the report text. The largest difference is 0.7 points.
  - Categories are the household's main hazard, so the segments add up to the total.
  - The chart files Karongi under the Southern Province; the value belongs to Karongi (West).
- **DHS 2025, Tables 15.5.1–15.5.2.** Parsed from the PDF text. The final column is the weighted number of respondents. Ages are 15–49 (men also 50–59), which is not FinScope's 16+.
- **VUP timeliness trend.** Each row keeps its question.
  - EICV4 and EICV5 asked when payments *typically* arrive, in months. EICV7 asked the days of delay of the *last* payment.
  - Read the series as indicative. The on-time share barely moved (Direct Support 10.5% → 15.2% → 15.1%), but long delays fell sharply ("more than a month late" 86% and 76%; "more than 20 days" 6.4% in 2023/24).

## Sector monetary poverty (small-area estimates): read before using

- **Source.** Each district's EICV7 dissemination deck (July 2025) has a map titled *"Poverty rate by Sectors … Source: Small area estimation based on EICV7 and 2022 GPHC"*. The values in `sector_poverty_eicv7_sae.csv` were read from those map labels.
- **Validation.**
  - All 416 sector names match the census list for every district.
  - All values fall within the maps' legend range (1.1–69.7%).
  - Two hard-to-read labels were checked by enlarging the image: Gitega, whose first digit was set from its colour class, and Miyove. See the `note` column.
- **These estimates are not benchmarked to the EICV7 district estimates.** The population-weighted mean of a district's sectors differs from its direct district rate by −7.8 to +14.0 points.
  - Low-poverty districts sit higher; for example, Gicumbi's sectors average 26.3% against 13.3% direct.
  - High-poverty districts sit lower; for example, Kamonyi's sectors average 31.8% against 39.6% direct.
  - This is typical of model-based small-area estimates. **Use them to compare sectors within a district**, and use the direct district estimates for district comparisons.
- `calc_benchmarked_pct` rescales sectors so their population-weighted mean equals the direct district rate. It is our calculation, offered for sensitivity checks only, and is **not** an NISR figure.
- The decks also contain **cell-level** poverty maps (slide 11). These were not transcribed.

## General caveats

- **Units differ between sources:** % of people (EICV7 poverty), % of adults 16+ (FinScope), % of households (EICV7 phone ownership), and % of youth (NEET).
- **Comparisons across surveys are ecological.** They describe districts, not households.
- **Years differ:** census 2022, EICV7 2023/24, FinScope 2024, LFS 2025. Label the year beside every number.
- **Different surveys measure "inclusion" differently.**
  - FinScope (adults 16+) counts anyone using any formal or informal product: 96% included, and a gender gap of about 1 point.
  - DHS 2025 (ages 15–49) asks about personal use of a bank account or a phone for financial transactions in the last 12 months: 63.1% of women and 74.0% of men. Among the poorest fifth, the figures are 36.8% and 48.3%.
  - Both can be right. State which measure you show.
