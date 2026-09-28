# Track 2 Data Inventory

Checked 26 September 2026 against the NISR Central Data Catalog (NADA) at https://microdata.statistics.gov.rw/index.php/catalog.
Variable names below were read from each study's public data dictionary.

**Access:** the catalog lists these studies as *Public use*, and each study's metadata calls its file an *"edited anonymous dataset for public distribution"*. Downloading needs a free NADA account and acceptance of each study's terms. The download page itself was not visible without logging in, so confirm the terms after registering. Never commit microdata: `data/raw/*` is gitignored.

**Step-by-step download, sample sizes known in advance, and validation checks:** [docs/data/microdata-access.md](microdata-access.md).
**Full variable lists** (`data/dictionaries/nada_<id>_variables.csv`):

| Study | ID | Variables |
| --- | --- | --- |
| FinScope 2024 | 120 | 2,500 |
| EICV7 | 119 | 838 |
| EICV7 VUP sample | 121 | 800 |
| FinScope 2020 | 89 | 1,312 |
| EICV5 VUP | 85 | 940 |
| LFS 2025 | 125 | 207 |
| CFSVA 2024 | 122 | 1,243 |
| Census 2022 public sample | 109 | 250 |
| Establishment Census 2023 | 112 | 68 |
| AHS 2024 | 123 | 730 |

Value labels for key variables are in `nada_key_variables.json`.

### The whole catalog at a glance (indexed 26 Sep 2026)

`python scripts/data/index_nada_catalog.py` rebuilds three files in `data/dictionaries/`:
- `nada_catalog.csv`: the **76 studies**, with access type, years, data files, cases, variables, coverage and sampling notes, and our Track 2 priority.
- `nada_catalog_files.csv`: the **527 data files**.
- `nada_catalog_docs.csv`: **448 documentation items**.

**Access types:**
- 69 studies are "Public use": a free account plus a short request form, one request per study.
- 4 are World Bank Enterprise Surveys hosted elsewhere.
- 3 have no microdata.
- **No dataset can be downloaded without an account.**

**Documentation is public** (questionnaires, reports, methodology notes). `--download-docs <ids>` has fetched 75 files (187 MB) for the 17 priority studies into gitignored `data/raw/nisr/nada-docs/`.

**Repeated rounds useful for trends:**
- FinScope: 2012, 2016, 2020, 2024
- EICV VUP samples: 2013/14, 2016/17, 2023/24 (plus the 2008 VUP baseline)
- LFS: every year 2017–2025
- CFSVA: 2006–2024
- DHS: 1992–2025
- Establishment Census: 2011–2023

---

## 1. NISR microdata (core)

### FinScope 2024 (catalog ID 120, `RWA-NISR-FINSCOPE-2024-v01`)

One file, **13,994 respondents × 2,500 variables**. Adults aged 16+. The design targets at least 400 adults per district.

| Purpose | Variables (verified) |
| --- | --- |
| Geography | `a1` province, `a2` **district**, `a6` urban/rural |
| Weights | `hh_wt` household weight, `pop_wt` individual weight (16+) |
| Person | `b1` age, `b2` sex, `c4c`/`c4d` disability, `c1e` dependants on household income |
| Social protection | `c13a` **Ubudehe category**, `c13b` category changed in past 2 years, `n1a_11` government grant / VUP cash transfer, `n1a_12` social protection, `n1a_18` **VUP public works**, `h3_07` loan from government (Ubudehe credit / VUP loan), `m5a_5` government subsidy scheme |
| Income | `n11` monthly personal income, `n12` annual income, `c5_4` how often went without cash income |
| Health insurance and pensions | `i5a_3` / `i5b_3` Mutuelle (CBHI), `i6_13` RSSB public pension, `i6_15` / `qf1_09` / `qf4_09` **Ejo Heza** (ever used / currently use) |
| Phone and access | `f2` phones in household, `f3` owns a phone, `f4d` phone type (smartphone / feature / basic), `f7_1` agent nearby, `f8_1`–`f8_5` agent problems (network down, float, menu difficulty), `k8a_12` distance to bank |
| Informal finance | `l1` belongs to an informal group, `l7` group helps manage money |
| Shocks | `i2_*` risk events, `cc2_*` repeated climate damage, `cc5_*_12` received government assistance per shock, `cc5_*_7/8` used formal / informal savings, `cc7_13` would seek government assistance |
| Gender norms | `e20_*` attitude items (for example `e20_10` "women should give income to partner") |
| Financial health | Not yet located as a ready-made variable. Rebuild from the questionnaire using report section 5.2: four equally weighted sub-indices (day-to-day, opportunities, resilience, control), scored 0–100 and cut at 25, 50 and 75. |

Documentation in the catalog: questionnaire (29 June 2025 version), full report, presentation.

### EICV7 2023/24 cross-sectional sample (catalog ID 119, `RWA-NISR-EICV7-2023-2024-v01`)

21 files. District- and province-representative (54 clusters per district, 72 in Kigali). Fieldwork Oct 2023–Oct 2024.

| File | Key variables (verified) |
| --- | --- |
| F1 `CS_EICV7_poverty_file` | `hhid`, `clust`, `province`, `district`, `ur`, `weight` (household), `pop_wt` (population), `sol_jan` consumption per adult equivalent (Jan 2024 prices), `quintile`, `poverty` (welfare category), `pov_jan`, `epov_jan`, `Poverty_line`, `Extreme_line` |
| F19 `CS_S10A1_A2_credits` | `s10aq1` tried to get a loan, `s10aq2` **reason loan denied**, `s10aq3` owes money, `s10aq6` loan source, `s10aq7` purpose, `s10aq8` collateral required, `s10aq9` repaid, plus `strata_id`, `weight`, poverty variables |
| F21 `CS_S10C_Savings` | `s10cq1` **account ownership (bank / mobile money / tontine)**, `s10cq4` has an account, `s10cq5` institution, `s10cq6` account type, `s10cq7` earns interest, `s10cq8` in a tontine |
| F13 `CS_S9D1_Direct_Support` | `s9d1q1` any VUP component, `s9d1q2` in DS (+ month and year joined), `s9d1q3` reason, `s9d1q4` amount in last 12 months, `s9d1q5` **payment channel**, `s9d1q6_*` how the benefit was used (including `_K` savings in SACCO / VSLA / tontine, `_L` Ejo Heza), `s9d1q7` received full entitlement, `s9d1q8a/b/c` **days of delay for the last three payments** |
| F14–F17 | Classic PW, Expanded PW, NSDS, Financial Services modules (same structure; check exact names) |
| Others | F2 person, F3 household, F4 access to services, F5–F9 expenditure and food, F10/F11 transfers out/in, F18 other income, F20 durables |

### EICV7 VUP sample (catalog ID 121, `RWA-NISR-EICV7-VUP-2023-2024-V01`)

20 files with the same modules (`vup_s9d1_direct_support` … `vup_s9d5_financial_services`, `vup_s10a1_a2_credits`, `vup_s10c_savings`, household and person files). About 3,771 households.

- **Designed for national and per-component estimates only, not districts.** Report it by province or component.

### Other NISR studies in the catalog (contents verified from their data dictionaries)

| Study (ID) | Geography the design supports | Key verified variables | Use for Track 2 |
| --- | --- | --- | --- |
| **Census 2022 public sample (109)** | **Sector.** NISR's user statement says analysis "can be done up to the sector level". 10% self-weighted sample: 1,313,015 people, 331,606 households, about 800 households per sector | `ml01`–`ml03` province, district, **sector**; `p14` medical insurance; `p15b`–`p20b` disability; `p34`/`p35` internet use and access; `p36c` phone type; `p46`–`p49` employment; `h01`–`h28` housing, assets, livestock; `HH_weight`, `Pop_weight` | **Sector-level digital readiness** (not published by NISR). Covariates for a model-based sector estimate of financial exclusion (FinScope model applied to the census) |
| **DHS 2025 (126)** | Province, and district "for some indicators". About 480 households, 475 women and 220 men per district | `sdistrict`/`shdistrict` district; `v005`/`mv005`/`hv005` weights; `v169a`/`v169b` phone ownership and mobile-money use; `v170` bank account; `v177` account use; `hv247` household bank account; `hv263` household mobile money; `v190`/`hv270` wealth quintile; `v481` health insurance; `v739` who decides on her earnings; `v745a`/`b` owns house or land | Gender gap in account use by district and wealth; women's economic agency |
| **FinScope 2020 (89)** | National, urban/rural **and district** (per its metadata). 12,480 adults | `A2` district; `Individuals_Weight`; `C13A` Ubudehe; `C13D` VUP direct cash transfer; `D1A7`/`D1A14` distance to SACCO and to a mobile-money agent; `QF1`–`QF6` use by provider | **Like-for-like district trend 2020→2024**: rebuild "own-account banked" for 2020 (the published district figure includes OTC users) |
| **CFSVA 2024 (122)** | District (stratified by district). 9,000 households | `S0_D_Dist`; `FinalWeight`; `FCS`, `rCSI`, `Max_coping_behaviour`, `WI_cat`; **VUP receipt by component** (`S11_05_SMT_1`–`8`) and months received; loans and refusals (`S6_01`–`S6_04`); what mobile money is used for (`S6_0_1_*`); top-3 shocks with coping (spent savings, borrowed) | Shock and coping layer; **VUP coverage by district** (the EICV7 VUP sample cannot give this) |
| **LFS 2025 (125)** | National; district for employment and participation. 100,852 people | `code_dis`; `weight2`; `D14_1` monthly earnings; `D09A` RSSB contributions; `IEV2` formal/informal; `F05` main income source; `disable`; `neetyouth` | Earnings and informality by district and sex |
| **Establishment Census 2023 (112)** | Full count, all 30 districts. 269,194 establishments | `q1_2` district; `q6_1` ISIC section; `FI` formal/informal; `q15_1` keeps accounts; `q20` turnover; `q22*` registrations | **Financial-service establishments (ISIC K) per district**, which the published tables do not cross-tabulate |
| AHS 2024 (123) | District allocation (600 EAs) | `AHS2024_Credits` (loan attempts, refusal reasons, source, purpose); `AHS2024_Saving` (bank, mobile-money and tontine accounts); `district` | Farm households' credit and savings |
| EICV5 VUP 2016/17 (85) / EICV4 VUP 2013/14 (73) | National and per component | 35 and 29 files; VUP/Ubudehe scheme modules (`vup_S9C*`), credits, savings/tontine | VUP delivery trend (published timeliness already extracted) |
| EICV3 & 4 panel (74) | National | 1 file, 8,310 cases, 33 variables | Only household panel for poverty *dynamics* (2010/11–2013/14; dated) |
| FinScope 2016 / 2012 (71 / 57) | 2012 was designed for districts | – | Long-run trend (check definitions) |
| Seasonal Agricultural Survey 2025 (124) | District key indicators | – | Farm shocks (overlaps Track 1) |

---

## 2. Published NISR and government tables (no login needed)

**Downloaded and extracted (26 Sep 2026).**
- `scripts/data/download_nisr_public.py` fetches the 170 public files listed in [`data/dictionaries/nisr-public-files.json`](../../data/dictionaries/nisr-public-files.json): 123 core, about 320 MB, into gitignored `data/raw/nisr/published/`.
- `scripts/data/extract_published_tables.py` turns them into tidy CSVs in [`extracts/`](../../data/extracts/README.md).

| Dataset in `extracts/` | Coverage | Source |
| --- | --- | --- |
| `district_indicators_long.csv` / `_wide.csv` | 30 districts × 63 indicators, with SE/CI where published | EICV7 annex tables, FinScope 2024 Fig. 13 and 2020 Fig. 17, RPHC5, LFS 2025, projections, Statistical Yearbook 2025, Establishment Census 2023, DHS 2025 (child nutrition), CFSVA 2024 (food consumption, natural hazards) |
| `dhs2025_mobile_bank_by_group.csv` | Phone, mobile-money and bank-account use by sex × age, residence, province, education, wealth | DHS 2025 Tables 15.5.1–15.5.2 |
| `vup_timeliness_trend.csv` | VUP payment timeliness 2013/14, 2016/17, 2023/24 | EICV4 SP report, EICV5 VUP report, EICV7 VUP tables |
| `sector_census2022.csv` | 416 sectors: non-monetary poverty, MPI, population | RPHC5 Non-Monetary Poverty report (Tables C.1, C.10) and Main Indicators (Tables 96–100) |
| `sector_poverty_eicv7_sae.csv` | 416 sectors: monetary poverty (NISR small-area estimates) | EICV7 district presentation decks (map labels). **Not benchmarked; see the README** |
| `lfs_district_2017_2025.csv` | 30 districts × LFS indicators × 9 years | LFS 2025 annual tables 21–25 |
| `vup_benefit_delivery_eicv7.csv` | VUP amounts, channel and timeliness by component × poverty status | EICV7 VUP thematic tables 4.2, 4.5, 4.8, 4.11 |

**Where things live on the NISR site** (useful for finding more):
- **Survey hubs:** `/data-sources/surveys/<Survey>/…`. Each EICV7 report page carries an Excel table file.
- **District pages:** `/district-statistics/<province>`. Each district has its EICV7 deck, Census 2022 profile, single-age projections 2023–2032, and Gender profile 2023.
- **Census 2022 thematic reports:** `/data-sources/censuses/Population-and-Housing-Census/fifth-population-and-housing-census-2022/rphc5-thematic-reports`. Each has Excel tables.
- **Kinyarwanda summaries:** `/statistical-publications/incamake-ubushakashatsi-kinyarwanda` (EICV7, LFS and census booklets). Useful for Kinyarwanda UI wording.
- **Not captured:** the certificate for `www.statistics.gov.rw` is invalid, so use `statistics.gov.rw`. MINALOC's certificate had expired on 26 Sep, so the Imibereho SOP had to be fetched manually.

| Other published source | Where | In repo |
| --- | --- | --- |
| Roadmap KPI baselines and targets | National Financial Inclusion Roadmap 2025–2030, Annex 2 | See the dossier, section 2.5 |
| Social-protection targets | SP-SSP 2024–2029, Annex 2; NST2 results matrix | See the dossier, section 2.5 |
| CPI by COICOP group, urban / rural / national, monthly | `CPI_time_series_August 2026.xls` | Downloaded; see dossier update for y/y figures |
| Cell-level poverty maps (EICV7 small-area estimates) | Slide 11 of each district deck | Not transcribed (about 2,100 cells) |

---

## 3. External open data

| Source | What it adds | Status |
| --- | --- | --- |
| HDX Rwanda subnational boundaries (from NISR): https://data.humdata.org/dataset/cod-ab-rwa | Province, district and sector polygons (cell level incomplete) for maps | Verified listing |
| geoBoundaries RWA (gbOpen, from NISR open geodata, CC BY 4.0) | District (30) and sector (416) outlines, 2012 units | **Used by the website** (`scripts/data/build_web_data.py`); all 416 sectors matched to census names |
| geoBoundaries RWA ADM4 and ADM5 (gbOpen; cells from Open Data Rwanda, villages from the World Bank; CC BY 4.0) | Cell (2,148) and village (14,815) names and outlines, 2012 units | **Used by the site search** (`scripts/data/build_place_index.py`): each cell placed in its sector and each village in its cell by the outlines; names only, no statistics |
| Meta Relative Wealth Index: https://data.humdata.org/dataset/relative-wealth-index | 2.4 km wealth estimates; covariate for small-area work; cite Chi et al. 2022 (PNAS) | Verified listing |
| NBR Financial Inclusion Dashboard | Weekly supply-side active accounts by gender, age and location | Launched 2025 and reported as public. Check the URL and whether data can be exported |
| CHIRPS rainfall (UCSB Climate Hazards Center) | Rainfall anomalies for Shock Watch | To verify |
| WorldPop | Gridded population | To verify |
| OpenStreetMap | Bank and ATM points of interest (agent coverage likely incomplete) | To verify |

---

## 4. Validation targets

Reproduce these published figures before building on the data.

| Check | Expected | Source |
| --- | --- | --- |
| National poverty headcount (people, `pop_wt`, `pov_jan`) | 27.4% | EICV7 |
| Extreme poverty | 5.4% | EICV7 |
| Financially excluded adults (`pop_wt`) | 4% | FinScope 2024 |
| Formally included adults | 92% | FinScope 2024 |
| DS beneficiaries paid on time (last payment delay = 0) | 15% | EICV7 VUP Thematic Report |
| VUP households in poverty (VUP sample) | 41% | EICV7 VUP Thematic Report |

If a figure does not match, check the weights, the unit (people / households / adults), and the definitions before changing anything else.
