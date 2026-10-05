export type Score = {
  score: number;
  notes: string;
};

export type CanResult = {
  name: string;
  is_user: boolean;
  rank: number;
  score: number;
  scores: {
    brand_recognition: Score;
    category_clarity: Score;
    flavor_clarity: Score;
    benefit_clarity: Score;
    shelf_visibility: Score;
    digital_shelf_readability: Score;
    differentiation: Score;
    sku_confusion_risk: Score;
  };
};

export type Issue = {
  issue: string;
  region: number[];
};

export type AnalysisResponse = {
  category: string;
  first_impression: {
    headline: string;
    summary: string;
    attention_order: string[];
  };
  user_rank: number;
  user_score: number;
  leader_score: number;
  leader_name: string;
  leaderboard: CanResult[];
  top_issues: Issue[];
  gaps_vs_leader: string[];
  recommended_tests: string[];
  competitor_reference: {
    brand: string;
    domain: string;
    what_they_do_differently: string;
    what_to_copy: string;
  } | null;
};