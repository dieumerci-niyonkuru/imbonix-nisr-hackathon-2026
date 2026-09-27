/**
 * The planned explainable model. Variable names were checked against the public FinScope 2024 data dictionary
 * (data/dictionaries/nada_120_variables.csv). No model has been trained yet: the microdata (NISR catalog
 * study 120) is required first.
 */

export const MODEL_STATUS = {
  trained: false,
  reason: "FinScope 2024 household microdata (NISR microdata catalog, study 120) has not been downloaded yet.",
  catalogUrl: "https://microdata.statistics.gov.rw/index.php/catalog/120",
};

export const MODEL_QUESTION =
  "Which characteristics are most strongly associated with being financially vulnerable, for adults overall and for rural women?";

export const MODEL_TARGET = {
  label: "Financially vulnerable or extremely vulnerable (FinScope 2024 financial health)",
  detail:
    "Rebuilt from the questionnaire following report section 5.2: four equally weighted subindices (day to day management, opportunities, resilience, control), scored 0 to 100 and cut at 25, 50 and 75. The rebuilt national shares must match the published 10% / 57% / 31% / 3% before modelling.",
};

export type Feature = { group: string; variables: string; description: string };

export const FEATURES: Feature[] = [
  { group: "Place", variables: "a2, a6", description: "District and urban or rural residence" },
  { group: "Person", variables: "b1, b2, c4d", description: "Age, sex and disability" },
  { group: "Household", variables: "c4c, c13a", description: "Disability in the household and Ubudehe category" },
  { group: "Income", variables: "n11, c5_4", description: "Monthly income and how often the household goes without cash income" },
  {
    group: "Phone and access",
    variables: "f3, f4d, f7_1, k8a_12",
    description: "Phone ownership and type, a nearby agent, distance to a bank",
  },
  { group: "Informal finance", variables: "l1", description: "Membership of an informal savings or credit group" },
  { group: "Social protection", variables: "n1a_11, n1a_18", description: "Income from VUP cash transfers or public works" },
  { group: "Shocks", variables: "i2_*, cc2_*", description: "Risk events and repeated climate damage in the past year" },
  { group: "Norms", variables: "e20_*", description: "Attitudes to women's control of income (for the rural women analysis)" },
];

export const METHOD_STEPS = [
  {
    title: "Reproduce published figures",
    body: "Rebuild the financial health segments and check them against FinScope's published 10 / 57 / 31 / 3 split, using the pop_wt weights.",
  },
  {
    title: "Baseline, then a stronger model",
    body: "A weighted logistic regression as an interpretable baseline, then gradient boosted trees. Both use survey weights in training and evaluation.",
  },
  {
    title: "Honest evaluation",
    body: "Cross validation grouped by survey cluster to avoid leakage, with discrimination (AUC) and calibration reported on data held out from training.",
  },
  {
    title: "Explanations",
    body: "SHAP values for overall importance and for how each factor shifts the risk, shown for all adults and for rural women.",
  },
  {
    title: "Fairness checks",
    body: "Performance and calibration compared by sex, urban/rural residence and disability; gaps are reported, not hidden.",
  },
];

export const WILL_NOT = [
  "Score or label individual households; IMBONIX is not a targeting or eligibility tool.",
  "Claim that any factor causes vulnerability; the survey is a single cross section.",
  "Publish results for groups too small to estimate reliably (fewer than 30 respondents or a coefficient of variation above 30%).",
  "Show any model output until it has been trained on the real microdata and checked against published figures.",
];
