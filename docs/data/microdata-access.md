# Getting the NISR microdata

Microdata needs a personal account, so a team member must do this step. Nothing here should be committed. `data/raw/*` is gitignored.

## 1. Register and download

1. Go to https://microdata.statistics.gov.rw and choose **Register**. Confirm your email, then log in.
2. For each study below, open it, go to **Get Microdata**, read and accept the terms, and describe your use honestly. For example: *"University team research for the NISR 2026 Big Data Hackathon, Track 2 (financial inclusion and poverty). Aggregate outputs only; no redistribution of microdata."*
3. Choose Stata (`.dta`) or CSV, and save the files to `data/raw/nisr/microdata/<study-id>/`.

| Priority | Study | Catalog ID | Why |
| --- | --- | --- | --- |
| 1 | FinScope 2024 | 120 | Financial access, financial health, Ubudehe category and VUP income for 13,994 adults, with a district code |
| 1 | EICV7 cross-section 2023/24 | 119 | Poverty, consumption, savings, credit, and VUP payment channel and delays, with district codes |
| 1 | EICV7 VUP sample 2023/24 | 121 | About 3,771 VUP households: delivery by component |
| 2 | Census 2022 public sample | 109 | **Has the sector code.** A 10% sample (about 800 households per sector) for sector-level digital readiness and small-area covariates |
| 2 | FinScope 2020 | 89 | District-representative. Needed for a like-for-like 2020→2024 district trend |
| 2 | DHS 2025 | 126 | Women's and men's bank-account and mobile-money use, with district code and wealth quintile |
| 2 | CFSVA 2024 | 122 | District shocks, coping, and VUP coverage by district |
| 3 | LFS 2025 | 125 | Earnings, informality, youth |
| 3 | Establishment Census 2023 | 112 | Financial-service establishments (ISIC K) by district |

Each study needs its own request on NADA. The full list of 76 studies, with access type and contents, is in `data/dictionaries/nada_catalog.csv`. Their questionnaires and reports are public; the priority ones are already in `data/raw/nisr/nada-docs/<id>/` (run `python scripts/data/index_nada_catalog.py --download-docs <ids>` to refresh them).

Variable lists for 120, 119, 121, 89, 85, 125, 122, 109, 112 and 123 are in `data/dictionaries/nada_<id>_variables.csv`. Add any other study with `python scripts/data/fetch_nada_dictionary.py --studies <id>`. Value labels and unweighted counts for key variables are in `data/dictionaries/nada_key_variables.json` (`--details`).

## 2. What the public metadata already tells us

All counts below are **unweighted sample counts** from NADA, not population estimates.

- **FinScope district samples** range from 399 to 848 adults (Gasabo 848, Nyagatare 639, Kamonyi 623; most others about 400). District estimates therefore carry roughly ±3–5 points of uncertainty.
- **FinScope social-protection respondents are few.**
  - 449 name a government/VUP cash transfer as an income source (`n1a_11`), 183 name VUP public works (`n1a_18`), and 117 name "social protection" (`n1a_12`).
  - 89 got a VUP/Ubudehe loan (`h3_07`).
  - Compare recipients with non-recipients **nationally**, or at most by urban/rural. Never by district.
- **FinScope Ubudehe self-report (`c13a`):** category 1 = 1,372; category 2 = 6,476; category 3 = 5,880; category 4 = 38; don't know = 172. This gives a usable poverty proxy for comparing financial behaviour.
- **FinScope phone ownership (`f3`):** 9,545 respondents own a phone and 4,449 do not.
- **EICV7 Direct Support module:**
  - Cross-section: 439 beneficiaries. VUP sample: 1,003 beneficiaries, of whom 846 are paid via SACCO and 157 via mobile money (unweighted).
  - `s9d1q8a–c` record the days of delay for the last three payments (range 0–68).
  - Because of these sample sizes, report delivery by component and province, not district.
- **EICV7 loans (`s10aq6`, `s10aq7`, 15,770 loans, unweighted):** tontines 49%, relatives 30%, SACCO 5%, bank 4%; VUP FS loans 2%. **Food purchase is the most common loan purpose (34%).** Weighted figures may differ.
- **EICV7 loan denials (`s10aq2`):** unclear purpose 26%, insufficient collateral 25%, insufficient income 21%.

## 3. First checks after download

Reproduce these published figures before any analysis. If one fails, check weights, units and definitions first.

| Check | Expected |
| --- | --- |
| EICV7 poverty headcount (`pov_jan`, weight `pop_wt`) | 27.4% |
| EICV7 extreme poverty (`epov_jan`) | 5.4% |
| EICV7 Nyamagabe poverty | 51.4% (95% CI 45.1–57.7) |
| FinScope financially excluded adults (weight `pop_wt`) | 4% |
| FinScope formally included | 92% |
| VUP Direct Support paid on time (delay = 0), VUP sample | 15.1% |
| VUP ePW, extremely poor waiting more than 20 days | 40.2% |
| Census 2022 public sample: people (unweighted / `Pop_weight`) | 1,313,015 / 13,245,753 |
| DHS 2025 women 15–49 who have and use a bank account or used a phone for financial transactions (`v005`) | 63.1% (men 15–49: 74.0%) |
| DHS 2025 stunting, children under 5 | 26.8% |
| FinScope 2020 banked including OTC / own account only | 36% / 22% |
| CFSVA 2024 households with inadequate food consumption | 17% |
