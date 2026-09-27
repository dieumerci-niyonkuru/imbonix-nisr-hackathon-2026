# Track 2 Research Dossier: Financial Inclusion & Poverty Reduction

Researched 26 September 2026 for IMBONIX (NISR 2026 Big Data Hackathon, Track 2).
Figures are quoted from the primary sources listed at the end. Anything we computed ourselves is marked **calculated**. Re-check every number against its source before it goes into the app or the submission.

Companion files:

- [Competition brief](nisr-hackathon-2026-brief.md): rules, dates, scoring
- [Data inventory](../data/track2-data-inventory.md): datasets, access, verified variable names
- [District and sector extracts](../../data/extracts/README.md): 47 district indicators, 416 sectors, LFS series, VUP delivery
- [Microdata access guide](../data/microdata-access.md): the NADA download step, known sample sizes, validation checks

---

## 1. The story in one paragraph

Rwanda has nearly solved **access** to finance: 96% of adults use a financial service and 92% use a formal one (FinScope 2024). It has not solved **resilience**. Only 10% of adults are financially healthy and 34% are financially vulnerable or extremely vulnerable. 88% ran out of money for food or other essentials in the past year. When a shock hits, only 1% claim on insurance. Meanwhile 27.4% of people are poor (EICV7, 2023/24). Social protection reaches about 10–11% of the population, against an NST2 target of 20% by 2029. The National Financial Inclusion Roadmap 2025–2030 names the policy shift directly: **"from access to impact"**.

A Track 2 tool that shows **where** households are financially fragile, **why**, and **which lever fits** would sit exactly on that shift. The levers are income support, better benefit delivery, savings and insurance, or last-mile access.

---

## 2. Evidence base

### 2.1 Financial inclusion and financial health: FinScope 2024

Adults aged 16 and over, about 14,000 sampled, fieldwork 6 Sep–8 Oct 2024. The design targets at least 400 adults per district.

| Indicator | Value |
| --- | --- |
| Financially included (formal or informal) | **96%** (7.8M adults) |
| Formally included | **92%** (7.5M) |
| Banked | **22%**, flat since 2020 |
| Use informal services (savings groups, ibimina) | 72% |
| Financially excluded | **4%** (about 317,000 adults) |
| Registered mobile money account | 77% |
| Save through any channel | 85%. 52% save in groups; 11% (about 900k) save through Ejo Heza |
| Formal borrowing / insurance (excl. CBHI) | 24% / 27% |
| **Financial health**: healthy / coping / vulnerable / extremely vulnerable | **10% / 57% / 31% / 3%** |
| Ran out of money for food or essentials (past 12 months) | **88%** (50% often) |
| Had a major risk event (past 12 months) | 72%. Most common: serious illness 33%, price increases 25% |
| How people coped with that event | 37% cut spending or did nothing, 27% borrowed (mainly from savings groups), 12% sold something, **1% claimed insurance** |
| Had a climate-related event | 69% (floods 56%, pests 27%, drought 25%) |
| …of whom took steps to protect their finances | 30% |
| Would handle a future climate shock by seeking government help | 33% |
| Receive income in cash / prefer to spend in cash | 76% / 92%. Only 18% receive income digitally |
| Main barrier to banking | Insufficient income (83% of the unbanked) |
| Main barrier to mobile money | No mobile phone (62% of non-users) |
| Main barriers to credit | No need 30%, fear of not repaying 24%, no collateral 19% |
| Financial-health sub-score "achieving goals" | Fell from 2.3 (2020) to 1.2 (2024) |

**Women, rural and youth (FinScope 2024 Gender Thematic Report)**
- 37% of women are financially vulnerable, against 30% of men.
- 17% of women are banked, against 27% of men. Only **9% of rural women** are banked, against 32% of urban women.
- Phone ownership has a 15-point gender gap. 73% of women have a mobile money account, against 81% of men.

**Districts (FinScope 2024, Figure 13)**
- 12 districts are above the national 4% exclusion rate. The highest are **Nyaruguru (10%)**, then Ngoma, Rulindo, Nyabihu and Gakenke (8% each).
- Gicumbi relies most on informal-only services (11%).
- Only Kicukiro (62%), Nyarugenge (59%) and Gasabo (51%) are bank-led.
- Full table: [extracts](../../data/extracts/finscope2024_district_access_strand.csv).

**Supply side (NBR data, June 2025, quoted in the Roadmap)**
- About 6.96M adults (about 80%) have an **active** transactional account.
- Women hold only 45% of those accounts, although they are 52% of the population.
- There are 1,958 mobile money agents per 100,000 adults, against 9 bank or MFI branches.
- Agents are concentrated in urban areas: Nyarugenge is the most served district and Ngororero the least.

### 2.2 Poverty: EICV7, 2023/24

- **Poverty rate:** 27.4% (95% CI 26.4–28.4). Extreme poverty is 5.4%. Under the new method, 2016/17 is modelled at 39.8% and 11.3%.
- **Poverty lines** (per adult equivalent per year, January 2024 prices): Rwf 356,432 for food / extreme poverty, Rwf 560,127 for total poverty.
- **By province:** West 37.4%, South 34.7%, East 26.8%, North 20.2%, Kigali 9.1%.
- **By district:** highest are Nyamagabe 51.4%, Gisagara 45.6% and Rusizi 44.2%; lowest is Nyarugenge 6.8%. **14 of 30 districts** are above the national rate.
  - Slowest progress since 2017: Kicukiro (−1.3 points), Ngoma (−3.1), Burera (−3.5), Nyanza (−3.6).
  - Full table: [extracts](../../data/extracts/eicv7_district_poverty_2024.csv).
- **Inequality:** Gini 0.37.
- **Multidimensional poverty (EICV7):** incidence 30.5% (rural 36.7%, urban 14.8%). The largest deprivations are cooking fuel (29.2%), housing materials (28.1%), drinking water (17.4%) and health insurance (15.1%).
- **Food security (CFSVA 2024):** 83% of households are food secure. Food insecurity is highest in the West (23%) and South (16%).

### 2.3 Social protection

**VUP beneficiaries: EICV7 VUP Thematic Report (household survey, 2023/24)**

- **Reach:** about **391,000 households, 1.6M people**. The Nutrition-Sensitive Direct Support component (NSDS) is the largest, followed by Direct Support (DS), then classic and expanded public works (cPW, ePW) and Financial Services (FS).
- **Poverty status:** **41%** of VUP households are poor (9% extreme, 32% moderate). Poverty is highest among cPW (48.5%) and ePW (43.5%) participants.
  - Caveat: consumption is measured *after* the household received support, so being non-poor at survey time can reflect programme effect or graduation, not only targeting error.
- **Payments arrive late** (as reported by beneficiaries, for their most recent payment):

  | Component | Paid on time | Waited more than 20 days |
  | --- | --- | --- |
  | Direct Support | 15% | 6% (12% of extremely poor) |
  | Classic Public Works | 10% | 13% (21% of extremely poor) |
  | Expanded Public Works | **7%** | 18% (**40% of extremely poor**) |
  | Nutrition-Sensitive DS | 17% | 13% (19% of extremely poor) |

- **Incomplete payment:** only 39% of extremely poor ePW workers received full payment, against 75–77% of other ePW workers.
- **Payment channel:** mostly **Umurenge SACCO** — 76% for DS, cPW and ePW; 82% for NSDS, rising to 98% among extremely poor NSDS recipients.
- **Phones:** 72% of VUP households own a mobile phone, but only 48% in DS (96% in FS). Only 14.5% have a smartphone.
- **Benefit amounts:**
  - DS: Rwf 128,572 a year.
  - cPW: Rwf 87,994 a year (Rwf 1,580 a day).
  - ePW: Rwf 149,422 a year.
  - NSDS: Rwf 31,128 a quarter.
  - FS loans: about Rwf 100,000.
- **Saving:** 55% of cPW earners save. 58% of ePW workers and 55% of NSDS recipients save through Ejo Heza.
- **Who benefits:** 74% of VUP beneficiaries are women (EICV7 Main Indicators).

**Administrative view: Social Protection Sector Strategic Plan (SP-SSP) 2024–2029, MINALOC**

- **"Payments delivered on time: 96.6%"** on average (DS 97%, cPW 90%, ePW 96%).
  - The EICV7 VUP survey for the same year has beneficiaries reporting **7–17%** on time. The two probably measure different things: when the payment is released versus when the person receives it. Present the gap as a measurement finding, not an accusation.
- **Coverage:** social security and income support reached 8.7% of the population in 2016/17 and **10%** in 2023/24. This **missed the 17.7% target**.
- **Children** are the least covered: 7% of pre-school and 8% of school-age children, against 26% of older persons.
- **Ejo Heza:** 3,811,618 enrolled in 2023/24, but FinScope finds only about 11% (about 0.9M) of adults *saving* through it. Definitions differ, but enrolment is clearly not usage.
  - Targets: 6.1M enrolled and Rwf 127.3bn saved by 2028/29, up from Rwf 41.2bn.
  - 80% of the informal workforce is still without long-term savings cover.
- **Shock response:** 1,911,553 households received short-term assistance, typically a **one-time Rwf 35,000**.
- **Health insurance:** Community Based Health Insurance (CBHI) coverage is 87.9%, with a target of 100% by 2029.

**Targeting: the Imibereho Dynamic Social Registry**
- Launched 29 February 2024, replacing Ubudehe categories for targeting. Ubudehe is now kept only for planning and research.
- It ranks households with a **Household Welfare Scorecard**, a proxy for welfare built from assets, housing, livestock, household composition and similar data. The formula is not public.
- It covers about 13.8M people. Citizens check and update their data via **\*195#**.
- It is interoperable with the national ID, civil registration (CRVS), land, health, education, VUP and CBHI systems.

### 2.4 Labour and prices

- **LFS 2025:**
  - Unemployment: women 14.2%, men 10.8%; youth 14.7%, adults 10.8%.
  - Labour underutilisation: 56%. Employment-to-population ratio: 55.9%.
  - 4.8M employed, 676k unemployed, 3.1M out of the labour force.
- **CPI:** inflation was **15.7% year on year in August 2026** (NISR release, 10 September 2026). FinScope already ranked price increases as the second most common household shock.

### 2.5 Official targets to align with

| Indicator | Baseline | Target | Source |
| --- | --- | --- | --- |
| Financially vulnerable adults | 31% | **10%** (2030) | Roadmap 2025–2030 |
| Extremely financially vulnerable | 3% | **0%** | Roadmap |
| Financially healthy / coping | 10% / 57% | 20% / 70% | Roadmap |
| Adults with savings skills | 14% | 50% | Roadmap |
| Adults using more than one formal product category | 41% | 65% | Roadmap |
| Insured adults (supply side) | 7.5% | 15% | Roadmap |
| Adults with a formal loan | 12.7% | 20% | Roadmap |
| Youth (16–30) with formal credit | 8.8% | 12% | Roadmap |
| Women / youth formally included (supply side) | 80.2% / 51.9% | 87% / 60% | Roadmap |
| Active mobile money users | 68.5% | 80% | Roadmap |
| Poor and vulnerable covered by social protection | 11% | 16% (2026/27), **20%** (2028/29) | NST2 |
| Graduation participants who exit poverty | – | 70% | NST2 / SP-SSP |
| Households receiving the full graduation package (includes financial literacy and a savings group) | 0 | **250,000** (2028/29) | SP-SSP |
| Graduation participants trained in financial literacy in year 1 | 19.6% | 100% | SP-SSP |
| Ejo Heza enrolled | 3.81M | 6.1M | SP-SSP |
| National savings rate (% of GDP) | 12.4% | 25.9% | NST2 |
| CBHI coverage | 87.9% | 100% | SP-SSP |

Suggested pitch line: *"IMBONIX tracks the Roadmap's financial-health target (vulnerable adults 31% → 10%) and NST2's social-protection coverage target (11% → 20%) in one place, down to district level."*

### 2.6 Second pass: full sweep of NISR public data (26 Sep 2026)

Built from the downloaded Excel tables and district decks; see [extracts](../../data/extracts/README.md). "Calculated" means our arithmetic on published figures.

**Sector level is now possible (416 sectors)**
- **Monetary poverty, NISR small-area estimates.** The poorest sectors are Bweyeye 69.7%, Bugarama 61.4% and Butare 59.8% (all Rusizi), then Nyabirasi 57.7% (Rutsiro), Uwinkingi 57.6% (Nyamagabe), Muhanda 56.4% (Ngororero) and Nkombo 55.8% (Rusizi).
  - Several of the poorest sectors border Nyungwe forest: Bweyeye, Butare, Uwinkingi, Gatare and Nyabimata. This is an observation, not a cause.
  - These sector estimates are **not benchmarked** to district direct estimates. Use them to rank sectors within a district.
- **District averages hide extremes.**
  - Rusizi runs from Kamembe 18.2% to Bweyeye 69.7%.
  - Rubavu runs from Gisenyi 4.4% to Busasamana 52.0%.
  - Bugesera runs from Nyamata 14.1% to Ngeruka 44.8%.
- **Census non-monetary poverty and multidimensional poverty** exist for every sector. At sector level they agree with monetary poverty (ρ = 0.68), but not perfectly, so show both.

**What goes with formal finance across districts** (calculated, ecological, n = 29–30; describes districts, not people)
- **Banked share:** internet use ρ = +0.72, smartphone ownership +0.68, LFS median earnings +0.55, household phone ownership +0.54. By comparison, poverty is only −0.38.
- **Exclusion:** low internet use ρ = −0.50, low earnings −0.38, youth NEET +0.31.
- **Informal-only reliance:** households sending transfers ρ = +0.48, female-headed households +0.43, youth NEET +0.43.
- **Takeaway:** digital access and earnings track formal finance more closely than monetary poverty does. This supports a **"digital readiness"** layer in IMBONIX.

**Digital divide by district**
- Households with a smartphone: from 15.1% (Nyamagabe, Gisagara) to 73.7% (Kicukiro).
- Adults 16+ who used the internet (census): from 6.1% (Ngororero) to 52.5% (Kicukiro).

**Labour (LFS 2025, with standard errors)**
- **Youth NEET:** 24.5% nationally (women 30.5%, men 18.3%). The district range runs from Nyabihu 17.5% to **Gisagara 35.5%** and Nyaruguru 32.9%.
- **Unemployment:** from 7.0% (Nyabihu, Gakenke) to 18.4% (Nyamasheke) and 18.1% (Gicumbi).
- **Median monthly earnings at main job:** Rwf 26,000 in Gakenke, Gatsibo and Gisagara, against Rwf 100,000 in Kicukiro.

**Prices and real earnings (calculated)**
- **CPI, August 2026 year on year:**
  - Overall: urban 15.7%, rural 16.0%, national 15.9%.
  - Food: 16.3% urban, 16.8% rural. Meat: +37% urban, +29% rural.
  - **Rural communication: +54.8%** (urban +3.2%). Phone and data costs matter for mobile money.
- **Rural consumer prices rose 76.5% between 2017 and 2025** (annual averages); urban prices rose 64.2%.
- **Real median earnings fell in 19 of 30 districts** over 2017–2025, after deflating LFS nominal medians by the rural CPI (urban CPI for Kigali). Examples: Nyanza −24%; Gisagara, Kirehe and Nyagatare −19%.
- This is indicative only: LFS medians are coarse and heaped at round values. It is still consistent with FinScope's liquidity stress (88% ran short of money).

**VUP delivery details (EICV7 VUP tables)**
- **Mobile money is already used, unevenly.** Extremely poor Direct Support households are *more* likely to be paid by mobile money (30%) than non-poor ones (23%). Among extremely poor NSDS recipients, 98% are paid at SACCO.
- **Classic public works:** only 2.6% of extremely poor participants were paid on time, against about 11% of others.

**How people borrow (EICV7 metadata, unweighted counts)**
- **Food purchase is the most common loan purpose (34%)**, ahead of business expansion (15%). Borrowing is largely for consumption smoothing.
- Tontines provide 49% of loans and relatives 30%.

**Coverage proxies**
- **RSSB contributing members per 100 adults:** Nyarugenge 62.6 and Gasabo 44.4, against 2.2–2.4 in Nyagatare, Gatsibo and Ngororero. This reflects where employers are located, not only where people live.
- **Financially excluded adults (calculated, FinScope rate × 2024 projection):** Gicumbi ≈ 20,100, Ngoma ≈ 19,800, Nyaruguru ≈ 18,800. The national total, about 317,000, matches FinScope's published figure.

**Design implications**
- **FinScope has about 700 social-protection-income respondents nationally** (unweighted counts: 449 VUP/government cash transfer, 183 VUP public works, 117 "social protection"). Compare recipients nationally only.
- The VUP sample supports component- and province-level results.
- District maps should use EICV7, LFS, FinScope district figures and the census. Sector maps should use the census and the small-area estimates.

### 2.7 Third pass: the whole microdata catalog and four more surveys (26 Sep 2026)

This pass covers:
- the NISR microdata catalog (all 76 studies indexed);
- the DHS 2025, CFSVA 2024 and FinScope 2020 reports;
- the EICV4 and EICV5 VUP reports;
- the Establishment Census 2023 tables.

Details and methods are in the [data inventory](../data/track2-data-inventory.md) and the [extracts README](../../data/extracts/README.md). Correlations below are district-level (ecological), n = 27–30.

**What the catalog adds**
- **No dataset is open without an account.** Everything Track 2 needs is "public use": a free account plus one request per study. The documentation is open and already downloaded.
- **Sector-level microdata exists.** The Census 2022 public sample is a 10% sample, about 800 households per sector. It carries the sector code with internet use, phone type, health insurance, disability, employment and assets. NISR states it supports analysis "up to the sector level". This opens two things:
  1. a sector digital-readiness map, which NISR does not publish;
  2. a **model-based sector estimate of financial exclusion**: fit a model on FinScope 2024 using variables the two surveys share, apply it to the census sample, and benchmark it to FinScope's district figures. It must be labelled as a model estimate and carry its uncertainty.
- **DHS 2025 has district codes and account-use questions for both women and men.** This allows gender gaps by district.
- **CFSVA 2024 is district-representative and records VUP receipt by component.** It gives VUP coverage by district, plus shocks and coping.
- **FinScope 2020 was designed for district estimates.** A like-for-like 2020→2024 district trend is possible with its microdata.

**"Included" is not "using": DHS 2025 against FinScope 2024** (published tables)
- FinScope counts 96% of adults as included, with a gender gap of about 1 point.
- DHS 2025 asks people aged 15–49 whether they had and used a bank account, or used a phone for financial transactions, in the past 12 months:

| | Women | Men |
| --- | --- | --- |
| Bank account or phone financial use | 63.1% | 74.0% |
| Bank account | 30.9% | 38.0% |
| Poorest fifth (bank account or phone) | 36.8% (bank account alone: 13.5%) | 48.3% |
| Richest fifth (bank account or phone) | 85.5% | 89.2% |

- The groups least likely to use an account are rural women (55.3%), women with no schooling (43.1%) and girls aged 15–19 (30.4%).
- The two surveys measure different things: FinScope counts any product, including informal ones; DHS asks about personal, active use. Both can be right. The gap is in **active use**, concentrated among poor, rural, less-educated and young women. This strengthens G7.

**Nutrition and shocks form maps of their own**
- **DHS 2025 stunting** is 26.8% nationally, from Nyarugenge 8.7% to **Gicumbi 38.8%**, Burera 37.6% and Ngororero 35.8%.
  - Gicumbi has one of the lowest poverty rates (13.3%) but the highest stunting.
  - Outside Kigali, stunting and monetary poverty are unrelated (r = −0.03, n = 27). Stunting does go with census multidimensional poverty (r = +0.70 across all 30).
- **CFSVA 2024 natural hazards** (digitized, about ±1 point): Rubavu 84%, Gisagara 81%, Burera 80% and Nyamagabe 80% of households were affected, against 16–20% in Kigali.
  - The main hazard differs by district: landslides in Nyabihu (52%) and Ngororero (51%), floods in Burera (59%), drought in Gatsibo (58%) and Nyanza (51%).
- **Inadequate food consumption:** Nyamasheke 35%, Rubavu 31%, Rutsiro 28% and Nyamagabe 27%, against Kicukiro 3%.
  - Hazard exposure tracks food consumption (r = 0.56) more than monetary poverty (r = 0.45 across all 30; 0.17 outside Kigali).
- **Implication:** a "resilience" view needs at least four layers shown side by side, not merged into one opaque score:
  - monetary poverty;
  - financial access and use;
  - nutrition;
  - shock exposure.

**VUP payments: ten years of beneficiary reports** (indicative, because the questions changed)
- Direct Support paid regularly or on time: 10.5% (2013/14), 15.2% (2016/17), 15.1% (2023/24).
- **Long delays fell sharply.** "More than a month late" went from 86% to 76%. In 2023/24, 6.4% waited more than 20 days (17.7% in expanded public works).
- **Framing:** payments are faster but still rarely on time, and far from the 96.6% administrative on-time figure. This gives the Benefit Delivery Monitor a historical baseline.

**FinScope 2020 district figures: a definition trap**
- The 2020 district "banked" figure includes over-the-counter users (36% nationally); the 2024 figure counts own accounts only (22%).
- Side by side, they would show a false collapse (Gasabo 80% → 51%).
- District ranks are fairly stable (Spearman ρ = 0.64). A true trend needs the 2020 microdata.

**Supply side and informality (Establishment Census 2023, full count)**
- There are 269,326 establishments. Informal enterprises make up 80% (Huye, Gisagara, Nyarugenge) to 95% (Rutsiro, Burera) by district.
- Establishments per 1,000 adults range from 18.8 (Gisagara) to 86.6 (Nyarugenge). This density goes with the banked share (ρ = 0.47).
- The published tables do not give financial-service outlets by district. The EC microdata (ISIC K) can.

---

## 3. Seven gaps worth solving

Each gap below includes the evidence, who can act on it, and the policy it aligns with.

### G1. Access without resilience
- **Evidence:** 92% are formally included, yet 34% are financially vulnerable or extremely vulnerable and 88% had a cash shortfall. After shocks, only 1% claimed insurance. The "achieving goals" score halved between 2020 and 2024.
- **Who acts:** the National Bank of Rwanda (NBR), MINECOFIN, Access to Finance Rwanda (AFR), financial service providers.
- **Alignment:** Roadmap financial-health outcomes (vulnerable adults 31% → 10%).

### G2. The poverty map is not the exclusion map (calculated)
Using the two published district tables:
- District poverty and financial exclusion are only weakly related (**Spearman ρ = 0.26**, n = 29).
- Poorer districts are less banked (ρ = −0.38) and rely more on mobile money and SACCOs (ρ = +0.43).

The districts fall into four types (cut at the national rates: 27.4% poverty, 4% exclusion). The exclusion figures carry roughly ±3 points of uncertainty, so treat borderline districts as uncertain.

| Type | Districts (poverty %, exclusion %) | Suggested lever |
| --- | --- | --- |
| **Poor and excluded** | Nyaruguru (39.7, 10), Ngoma (30.9, 8), Ngororero (30.2, 7), Rusizi (44.2, 6), Nyamasheke (42.8, 6), Rutsiro (40.8, 6), Kayonza (36.6, 5) | Income support **and** last-mile access |
| **Included but poor** | Nyamagabe (51.4, 1), Gisagara (45.6, 4), Nyanza (43.3, 4), Kamonyi (39.7, 3), Rubavu (38.8, 3), Karongi (38.2, 3), Nyagatare (36.4, 3) | Accounts exist; focus on income, usage, savings and insurance |
| **Access gap** | Gakenke (24.5, 8), Rulindo (21.6, 8), Nyabihu (20.2, 8), Gicumbi (13.3, 7, informal-only 11), Huye (24.2, 6) | Agents, phones, informal-to-formal pathways |
| **Relatively better off** | Rwamagana, Bugesera, Burera, Musanze, Gatsibo, Ruhango, Muhanga, Kirehe, Gasabo, Kicukiro | Deepen usage (credit, insurance, pensions) |

- **Implication:** one national prescription does not fit every district.
- **Caveat:** this is an ecological, district-level comparison. Confirm with household microdata before drawing household-level conclusions.

### G3. Benefits arrive late, mostly at SACCO counters
- **Evidence:**
  - Beneficiaries report 7–17% of payments on time, against 96.6% in administrative data.
  - 76–98% of payments are collected at Umurenge SACCO.
  - 28% of VUP households have no phone (52% in DS).
  - Ten years of beneficiary reports: the Direct Support on-time share was 10.5% (2013/14), 15.2% (2016/17) and 15.1% (2023/24), while long delays fell sharply (section 2.7).
- **External evidence:** digital delivery reduced delays and collection time elsewhere.
  - India: biometric smartcards meant payments arrived 6–10 days sooner, with 20% less collection time.
  - Niger: mobile transfers saved time, and diet diversity was 9–16% higher.
- **Policy hook:** the Roadmap lists "use of electronic payments in public income support programs", led by the Local Administrative Entities Development Agency (LODA). BNR's eKash national payment switch now links mobile money and banks.
- **Who acts:** LODA, MINALOC, BNR.

### G4. Coverage is thin and targeting is changing
- **Evidence:**
  - Social-protection coverage is 10–11%, against a 20% target.
  - 59% of VUP households were above the poverty line at survey time; read this carefully (see the caveat in section 2.3).
  - Children are the least covered group.
  - The Imibereho scorecard replaced Ubudehe in 2024, and its formula is not public.
- **Opportunity:** an independent, transparent evaluation of how well simple observable proxies identify the poor. It would show the trade-off between wrongly including the non-poor and wrongly excluding the poor, using EICV7. This must be **research, not an eligibility tool**.

### G5. Enrolment is not usage
- **Evidence:**
  - 3.8M are enrolled in Ejo Heza, but about 0.9M adults say they save through it.
  - Banking has been flat at 22% since 2020, even though banks hold 67.5% of financial-sector assets.
  - NBR now counts only **active** accounts.
- **Who acts:** the Rwanda Social Security Board (RSSB, runs Ejo Heza) and NBR.
- **Limit:** administrative usage data is not public, so this works best as a supporting insight rather than a module.

### G6. Shocks meet thin buffers
- **Evidence:**
  - 72% had a risk event and 69% a climate event, but only 30% took protective steps.
  - 33% would wait for government help after a climate shock.
  - Government shock aid is typically a one-time Rwf 35,000.
  - Inflation is 15.7%, and the West is the most food-insecure region.
  - CFSVA 2024: 16–84% of households per district were hit by a natural hazard in the past year. Hazard exposure tracks inadequate food consumption across districts (r = 0.56).
- **Alignment:** SP-SSP Outcome 5 (shock-responsive cash) and NST2 priority area PA-38.

### G7. Women, rural areas and youth carry the deficit
- **Evidence:**
  - Financial vulnerability is 37% for women against 30% for men.
  - Only 9% of rural women are banked, and the phone-ownership gender gap is 15 points.
  - Women hold 45% of active accounts, yet 74% of VUP beneficiaries are women.
  - Youth unemployment is 14.7%, and only 8.8% of youth have formal credit.
  - DHS 2025, ages 15–49: 63.1% of women used a bank account or mobile money in the past year, against 74.0% of men. Among the poorest fifth of women it was 36.8%, and among girls aged 15–19, 30.4%.

---

## 4. Project ideas, scored

Each idea is scored 1–5 against the five judging criteria (20 points each), plus feasibility by 30 October.

| # | Idea | Problem | Data & method | Tech innovation | Usability | Impact | Feasible by 30 Oct |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **District Financial Resilience Map** | 5 | 4 | 3 | 5 | 5 | 5 |
| 2 | **Explainable model of what drives financial vulnerability** | 4 | 5 | 5 | 3 | 4 | 4 |
| 3 | **Benefit Delivery Monitor** (VUP payment reliability and channels) | 5 | 4 | 3 | 4 | 5 | 4 |
| 4 | Graduation Pathways Explorer | 4 | 4 | 4 | 3 | 4 | 3 |
| 5 | Targeting Accuracy Lab (transparent proxy-means test) | 4 | 5 | 5 | 3 | 4 | 3 |
| 6 | Shock Watch alerts (rainfall + prices × household buffers) | 4 | 3 | 5 | 4 | 4 | 3 |
| 7 | Gender and youth gap decomposition | 4 | 4 | 3 | 3 | 3 | 4 |
| 8 | Household Financial Health Check (citizen tool) | 3 | 2 | 3 | 5 | 3 | 4 |
| 9 | Enrolment-to-usage tracker (Ejo Heza, accounts) | 4 | 2 | 2 | 3 | 3 | 2 |
| 10 | Sector-level poverty and access estimates (small-area estimation) | 4 | 5 | 5 | 3 | 5 | 1 |
| – | Cost-of-living navigator | 3 | 3 | 3 | 4 | 3 | 4 |

The last row is already being built by another Track 2 team (see section 7), so avoid it as your core.

### Idea notes

1. **District Financial Resilience Map.** A district map layering EICV7 poverty, FinScope exclusion, banking and informal-only shares, weighted financial health, and social-protection receipt. Each district gets a typology card (section 3, G2) with a *suggested lever*, drawn from published evidence and labelled as decision support.
   - Users: district planners, LODA, AFR, NBR.
   - Risk: ecological inference. Mitigate with estimates from FinScope microdata, shown with confidence intervals.

2. **Drivers of financial vulnerability (machine learning).**
   - Target: FinScope "financially vulnerable or extremely vulnerable". Rebuild the four-part index (day-to-day, opportunities, resilience, control) from the questionnaire if it is not in the file.
   - Model: survey-weighted gradient boosting with SHAP explanations. Show drivers overall and by group (sex, urban/rural, district type).
   - Evaluate on held-out clusters, check calibration and fairness, and document it in a model card.
   - Only group-level "what-if" views. No individual scoring screen.
   - The judges list "predictive models" under tech innovation.

3. **Benefit Delivery Monitor.**
   - Data: EICV7 cross-section and VUP microdata. For each component, poverty status and province: delay days for the last three payments (`s9d1q8a–c` for DS), payment channel (`s9d1q5`), full-entitlement receipt, and phone ownership.
   - Shows the beneficiary-reported figures side by side with the administrative 96.6% figure, with a clear explanation of how the definitions differ.
   - Adds a **"digital readiness"** view: which late-paid groups already own phones and could move to mobile payment now.
   - Users: LODA, MINALOC.

4. **Graduation Pathways Explorer.** Profiles of VUP households above and below the poverty line (assets, savings, Ejo Heza, phone, education, health insurance). Linked to the SP-SSP targets of 250,000 full-package households and 70% graduation. The data is cross-sectional, so present profiles, not trajectories.

5. **Targeting Accuracy Lab.** Fit a transparent proxy-means test on EICV7 using variables like the Imibereho scorecard's (housing materials, livestock, household composition, durables).
   - Show inclusion and exclusion error curves by coverage budget, with fairness by gender, disability and district.
   - Strong on methods, but sensitive. Frame it as research on trade-offs, never as eligibility.

6. **Shock Watch.** Monthly CPI plus rainfall anomalies (for example CHIRPS, to be verified) layered on district buffers from FinScope (savings, insurance, informal groups, climate coping). It raises an "alert" when exposure is high and buffers are thin. Fits the judges' "alert systems" example and the SP-SSP shock-responsive cash agenda. The work is in cleaning and linking external data.

7. **Gap decomposition.** Split the gender gap in banking and financial health into the part explained by education, income source and phone ownership, and the unexplained remainder (Oaxaca–Blinder or Fairlie method), using FinScope microdata.

8. **Household Financial Health Check.** About ten FinScope-style questions produce a segment and plain-language pointers (Ejo Heza, savings groups, CBHI, insurance). Store nothing. Adding Kinyarwanda raises usability. It relies weakly on NISR data, so use it as a feature, not the core.

9. **Enrolment-to-usage tracker.** Administrative data (RSSB, NBR) is not public. Use it as an insight card only.

10. **Sector-level estimates.** The Census 2022 public sample carries the sector code, and NISR endorses sector-level analysis. That splits this idea in two:
    - **Low risk:** direct sector estimates of digital readiness (internet use, phone type), health insurance and disability from the 10% sample. About 800 households per sector gives tight intervals.
    - **Stretch:** a model-based sector estimate of financial exclusion. Fit on FinScope 2024 with covariates the two surveys share (age, sex, education, phone type, internet use, employment, urban/rural, district), predict on the census sample, and benchmark to FinScope district figures. Publish only with uncertainty and a "model estimate" label. Fay–Herriot with the Meta Relative Wealth Index remains an alternative.

---

## 5. Recommended scope for IMBONIX

Build **one product with three modules**. This fits the existing Next.js, API and `ml/` structure.

- **A. Resilience Map** (idea 1): the landing view. It replaces the placeholder districts with real published or calculated values and their status labels.
  - Data is ready: [`district_indicators_wide.csv`](../../data/extracts/district_indicators_wide.csv) has 63 indicators, with CIs where published.
  - Clicking a district should open its **416-sector drill-down**: census non-monetary poverty plus the small-area poverty estimates, with the benchmarking caveat.
  - Add a **digital readiness** layer (smartphone ownership, internet use, household phones). Across districts it tracks formal finance more closely than poverty does. With the census public sample, it can go down to sector level.
  - Show the **four resilience layers side by side**: monetary poverty; financial access and use; nutrition (DHS 2025 stunting); shock exposure (CFSVA 2024 hazards and food consumption). They do not line up (section 2.7), which is the point.
- **B. Drivers** (idea 2): the explainable model and "what is associated with financial vulnerability" by group.
- **C. Benefit Delivery** (idea 3): the signature insight judges will remember.
- **Optional D. Household Health Check** (idea 8), if time allows.
- **Stretch E. Shock Watch** alerts (idea 6), if time allows.

**3-minute demo storyline**

1. "96% of Rwandans are included, but only 1 in 10 is financially healthy, and among the poorest fifth of women aged 15–49 only 37% used a bank account or mobile money in the past year (DHS 2025)."
2. Map: "Nyamagabe and Gicumbi have different problems: Nyamagabe is poor and shock-exposed; Gicumbi is less poor but has the highest child stunting. They need different levers."
3. Drivers: "These factors are most strongly associated with vulnerability, overall and for rural women."
4. Delivery: "Beneficiaries report 7–17% of VUP payments on time, and most are collected at SACCO counters. Long delays have fallen over ten years, but the on-time share has stayed near 15%. X% of late-paid households already own a phone."
5. Targets: "Here is progress toward the Roadmap goal (31% → 10% vulnerable) and the NST2 goal (11% → 20% coverage)."

**What not to claim**
- No causal impact of VUP or of any product.
- No household eligibility.
- No official NISR endorsement.
- No district ranking finer than the confidence intervals allow.

---

## 6. Methods checklist (survey data done right)

- **Weights**
  - FinScope: `pop_wt` for adults, `hh_wt` for households.
  - EICV7: `weight` for households, `pop_wt` for people.
- **Standard errors:** use the survey design. EICV7 files include `clust` and `strata_id`. Find the FinScope cluster variable in the dictionary. Tools: R `survey`/`srvyr`, or Python `samplics`.
- **Validate before building.** Reproduce three published numbers first: EICV7 poverty 27.4%, FinScope exclusion 4%, and VUP DS on time 15%.
- **Suppress weak estimates.** Flag or hide estimates with fewer than 30 observations or a coefficient of variation above 30% (NISR's annex tables report coefficients of variation).
- **Match analysis to sample design.**
  - FinScope: at least 400 adults per district, so district figures are fine.
  - EICV7: 54 clusters per district (72 in Kigali), so district figures are fine.
  - **The VUP sample is designed for national and per-component estimates, not districts.** Report it by province or component.
- **Units:** keep people, households and adults (16+) separate.
- **Language:** cross-sectional data means "associated with", never "caused".
- **Machine learning:**
  - Use weights in both training and evaluation.
  - Use cluster-grouped cross-validation to avoid leakage.
  - Check calibration and SHAP explanations.
  - Compare performance by sex, urban/rural and disability.
  - Document all of this in `docs/model/`.
- **Reproducibility:** scripts live in `ml/src/`, and microdata stays out of git (`data/raw/*` is already ignored). Publish only suppressed aggregates.

---

## 7. Competition landscape (public repos seen on 26 Sep 2026)

- **Rwanda Cost-of-Living Navigator** (Track 2, 2026). Uses CPI and EICV7 for a personal inflation calculator, a business cost-trends view and a district pressure index. Early stage: about 31 commits and no deployment link seen.
  https://github.com/kuradusengesamuel-create/rwanda-cost-of-living-navigator
- **Aguka-access-360** (Track 2, 2026). A financial inclusion dashboard: a Python `app.py` reading `data.csv`, about 11 commits.
  https://github.com/Muhanga1/Aguka-access-360
- **Past editions:** mostly visualisation dashboards (GDP, CPI, LFS, SAS), for example a 2023 Dash app on GDP and CPI.

**How IMBONIX differs:**
- It links finance, poverty and social protection.
- It uses weighted microdata with uncertainty shown.
- It includes an explainable model.
- It has a benefit-delivery lens nobody else is covering.
- It tracks official targets.

Don't make cost-of-living the core.

---

## 8. Ethics, privacy and rules

- Use only the anonymised public-use files in NISR's microdata catalog (NADA). Register, accept each study's terms, and cite NISR. Do not commit or redistribute microdata.
- No household-level scores or eligibility outputs. Imibereho is the official targeting system; IMBONIX is decision support.
- Present administrative and survey differences as questions of definition and measurement.
- Disclose AI use (competition rule). Human team members verify every number.
- **Entering transfers all IP to NISR.** Both team members must accept this knowingly.

---

## 9. Plan to 30 October (today is 26 September)

| Week | Dates | Deliverables |
| --- | --- | --- |
| 1 | 26 Sep–3 Oct | ✅ Team registration (done by the team). ✅ Public-data sweep, district and sector datasets, and variable dictionaries (done 26 Sep). ✅ Whole microdata catalog indexed, documentation downloaded, 63 district indicators (done 26 Sep). **Still to do:** create NADA accounts and request FinScope 2024 (120), EICV7 cross-section (119) and EICV7 VUP (121), then the priority-2 studies (Census sample 109, FinScope 2020 89, DHS 2025 126, CFSVA 2024 122), following [microdata-access.md](../data/microdata-access.md). Then reproduce the validation numbers. |
| 2 | 4–10 Oct | District aggregates with confidence intervals. Typology. JSON export for the web app. Replace the placeholder districts. |
| 3 | 11–17 Oct | Drivers model with SHAP, calibration and fairness. Benefit Delivery analysis. |
| 4 | 18–24 Oct | **Registration closes 20 Oct.** UI integration, map (HDX boundaries), plain-language copy, tests. |
| 5 | 25–30 Oct | Deploy, README, methodology note, model card, AI disclosure, demo script. Freeze on 29 Oct; submit before **30 Oct, 23:59**. |

---

## 10. Open questions for the team

1. Is the team exactly two students, with at least one Rwandan citizen? Is registration submitted?
2. Who creates the NADA account and accepts the data terms?
3. Which analysis language: Python (fits `ml/`) or R (`survey` package)?
4. Sector level: direct census-sample estimates (low risk, recommended) only, or also a model-based sector estimate of financial exclusion (stretch)?
5. Include the citizen-facing Health Check and a Kinyarwanda toggle?
6. Have both members read and accepted the IP-transfer clause?

---

## Sources

**NISR**
- 2026 Hackathon: https://statistics.gov.rw/about/hackathon/2026-hackathon-competition
- EICV7 Poverty Profile: https://statistics.gov.rw/sites/default/files/documents/2025-04/EICV7_Poverty%20Profile.pdf
- EICV7 Main Indicators: https://statistics.gov.rw/sites/default/files/documents/2025-07/EICV7_Main%20Indicator%20Report.pdf
- EICV7 VUP Thematic Report: https://microdata.statistics.gov.rw/index.php/catalog/121/download/1095
- EICV7 Multidimensional Poverty: https://statistics.gov.rw/sites/default/files/documents/2025-07/EICV7_Multidimensional_Poverty_Thematic_Report.pdf
- EICV7 Methodological Note: https://statistics.gov.rw/sites/default/files/documents/2025-07/EICV7_Methodological%20Note.pdf
- EICV7 district presentations (sector-level poverty): https://www.statistics.gov.rw/node/698
- FinScope 2024 report: https://statistics.gov.rw/sites/default/files/documents/2024-09/Rwanda-Finscope-2024-Report_compressed.pdf
- LFS 2025 annual report: https://statistics.gov.rw/data-sources/surveys/Labour-Force-Survey/labour-force-survey-2025/labour-force-survey-annual-report-2025
- CFSVA 2024: http://www.statistics.gov.rw/sites/default/files/documents/2025-07/Rwanda%20CFSVA%202024.pdf
- NISR home page (CPI August 2026): https://statistics.gov.rw/
- Microdata catalog: https://microdata.statistics.gov.rw/index.php/catalog
- EICV7 district presentations (sector and cell poverty maps): https://statistics.gov.rw/data-sources/surveys/EICV/integrated-household-living-conditions-survey-7-eicv-7/eicv7-district-disseminations-powerpoint
- District statistics pages (decks, census profiles, projections, gender profiles): https://statistics.gov.rw/district-statistics/southern-province (and the other four provinces)
- EICV7 Main Indicators tables (district annexes with SE/CI): https://statistics.gov.rw/sites/default/files/documents/2025-04/EICV7_Tables_MainIndicatorReport.xlsx
- EICV7 VUP thematic tables: https://statistics.gov.rw/sites/default/files/documents/2025-07/Final_EICV7_VUP_Thematic_Report_Tables.xlsx
- RPHC5 Non-Monetary Poverty tables (sector level): https://statistics.gov.rw/sites/default/files/documents/2025-02/Non%20Monetary%20Poverty%20Thematic%20Report.xls
- RPHC5 Main Indicators tables: https://statistics.gov.rw/sites/default/files/documents/2025-02/PHC5-2022_Main_Indicators.xlsx
- LFS 2025 annual tables and standard errors: https://statistics.gov.rw/sites/default/files/documents/2026-05/RWLFS_Annual_Tables_LFS2025.xlsx and https://statistics.gov.rw/sites/default/files/documents/2026-05/RWLFS2025_STD_ERRORS.xlsx
- CPI time series (August 2026): https://statistics.gov.rw/sites/default/files/documents/2026-09/CPI_time_series_August%202026.xls
- Rwanda Statistical Yearbook 2025 tables: https://statistics.gov.rw/sites/default/files/documents/2026-01/Rwanda_Statistical_Yearbook_2025.xlsx
- Rwanda DHS 2025 final report (Tables 15.5.1–15.5.2, D.4): https://microdata.statistics.gov.rw/index.php/catalog/126/download/1133
- FinScope 2020 main report (Figure 17): https://microdata.statistics.gov.rw/index.php/catalog/89/download/832
- EICV5 VUP thematic report 2016/17 (Tables 4.2–4.3): https://microdata.statistics.gov.rw/index.php/catalog/85/download/802
- EICV4 social protection and VUP thematic report 2013/14 (Tables 3.11, 3.15): https://microdata.statistics.gov.rw/index.php/catalog/73/download/685
- Census 2022 public-use sample statement: https://microdata.statistics.gov.rw/index.php/catalog/109/download/1031
- Establishment Census 2023 tables: https://statistics.gov.rw/sites/default/files/documents/2024-10/EC%202023%20Tables_Report_Final%200n%209%20july%202024_%20%281%29.xlsx

**Government strategy**
- National Financial Inclusion Roadmap 2025–2030 (NBR / MINECOFIN): https://www.bnr.rw/documents/National_Financial_Inclusion_Roadmap_2026-2030.pdf
- FinScope 2024 Gender Thematic Report: https://www.bnr.rw/documents/Rwanda-FinScope-2024-Gender-Thematic-Report3.pdf
- NST2 2024–2029: https://www.minecofin.gov.rw/index.php?eID=dumpFile&t=f&f=112653&token=dbe8e7d0faf00f43ce4605a42bfaa0fd795a5bb8
- Social Protection Sector Strategic Plan 2024–2029: https://minecofin.gov.rw/index.php?eID=dumpFile&f=113402&t=f&token=dcf0020be749bda1c818d68fc4a5e7406882aad9
- MINALOC, Overview on Social Protection (Nov 2025): https://sdgs.un.org/sites/default/files/2025-12/Overview_Social_Protection_Ministry_of_Local_Govt_Rwanda_0.pdf
- Imibereho SOPs (Mar 2025): https://www.minaloc.gov.rw/fileadmin/user_upload/Minaloc/Publications/Useful_Documents/Social_Protection/Imibereho_DSR_SoP.pdf
- Imibereho launch: https://www.minaloc.gov.rw/news-detail/imibereho-dynamic-social-registry-launched
- NBR Financial Inclusion Dashboard (launch news): https://afi-global.org/news/national-bank-of-rwanda-launches-financial-inclusion-dashboard/

**Research literature**
- Aker et al. (2016), mobile money cash transfers in Niger: https://www.journals.uchicago.edu/doi/abs/10.1086/687578
- Muralidharan, Niehaus & Sukhtankar (2016), smartcards in India: https://www.aeaweb.org/articles?id=10.1257%2Faer.20141346
- Aiken et al. (2022), machine-learning targeting in Togo: https://www.nature.com/articles/s41586-022-04484-9
- Blumenstock et al. (2015), predicting wealth from phone data in Rwanda: https://www.science.org/doi/10.1126/science.aac4420
- McIntosh & Zeitlin, cash benchmarking in Rwanda: https://cega.berkeley.edu/collection/gikuriro-rwanda-cash-benchmarking/
- Munyemana et al. (2024), VUP Direct Support and household financial behaviour: https://ideas.repec.org/a/gam/jecomi/v13y2024i1p2-d1555046.html
- Chi et al. (2022), Relative Wealth Index: https://data.humdata.org/dataset/relative-wealth-index
