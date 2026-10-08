export type CompetitorScore = {
  brand_recognition: number;
  category_clarity: number;
  flavor_clarity: number;
  benefit_clarity: number;
  shelf_visibility: number;
  digital_shelf_readability: number;
  differentiation: number;
  sku_confusion_risk: number;
};

export const COMPETITOR_SCORES: Record<string, CompetitorScore> = {
  Olipop: { brand_recognition: 92, category_clarity: 88, flavor_clarity: 82, benefit_clarity: 78, shelf_visibility: 85, digital_shelf_readability: 80, differentiation: 86, sku_confusion_risk: 74 },
  Poppi: { brand_recognition: 90, category_clarity: 84, flavor_clarity: 80, benefit_clarity: 72, shelf_visibility: 84, digital_shelf_readability: 78, differentiation: 76, sku_confusion_risk: 68 },
  "Culture Pop": { brand_recognition: 68, category_clarity: 78, flavor_clarity: 74, benefit_clarity: 68, shelf_visibility: 72, digital_shelf_readability: 72, differentiation: 76, sku_confusion_risk: 66 },
  Zevia: { brand_recognition: 82, category_clarity: 80, flavor_clarity: 68, benefit_clarity: 70, shelf_visibility: 70, digital_shelf_readability: 72, differentiation: 62, sku_confusion_risk: 62 },
  Spindrift: { brand_recognition: 80, category_clarity: 80, flavor_clarity: 76, benefit_clarity: 64, shelf_visibility: 78, digital_shelf_readability: 74, differentiation: 72, sku_confusion_risk: 66 },
  Sanzo: { brand_recognition: 60, category_clarity: 76, flavor_clarity: 72, benefit_clarity: 66, shelf_visibility: 70, digital_shelf_readability: 70, differentiation: 74, sku_confusion_risk: 62 },
  "Red Bull": { brand_recognition: 98, category_clarity: 92, flavor_clarity: 70, benefit_clarity: 72, shelf_visibility: 92, digital_shelf_readability: 88, differentiation: 72, sku_confusion_risk: 60 },
  Monster: { brand_recognition: 95, category_clarity: 90, flavor_clarity: 72, benefit_clarity: 70, shelf_visibility: 90, digital_shelf_readability: 86, differentiation: 70, sku_confusion_risk: 58 },
  Celsius: { brand_recognition: 88, category_clarity: 88, flavor_clarity: 78, benefit_clarity: 76, shelf_visibility: 86, digital_shelf_readability: 84, differentiation: 80, sku_confusion_risk: 68 },
  "Alani Nu": { brand_recognition: 82, category_clarity: 86, flavor_clarity: 80, benefit_clarity: 74, shelf_visibility: 84, digital_shelf_readability: 82, differentiation: 82, sku_confusion_risk: 70 },
  Ghost: { brand_recognition: 78, category_clarity: 82, flavor_clarity: 76, benefit_clarity: 72, shelf_visibility: 78, digital_shelf_readability: 76, differentiation: 80, sku_confusion_risk: 66 },
  C4: { brand_recognition: 74, category_clarity: 80, flavor_clarity: 72, benefit_clarity: 68, shelf_visibility: 74, digital_shelf_readability: 72, differentiation: 72, sku_confusion_risk: 62 },
  LaCroix: { brand_recognition: 88, category_clarity: 88, flavor_clarity: 80, benefit_clarity: 60, shelf_visibility: 84, digital_shelf_readability: 82, differentiation: 68, sku_confusion_risk: 66 },
  Waterloo: { brand_recognition: 70, category_clarity: 82, flavor_clarity: 78, benefit_clarity: 66, shelf_visibility: 76, digital_shelf_readability: 74, differentiation: 76, sku_confusion_risk: 68 },
  Bubly: { brand_recognition: 82, category_clarity: 86, flavor_clarity: 76, benefit_clarity: 62, shelf_visibility: 80, digital_shelf_readability: 78, differentiation: 64, sku_confusion_risk: 62 },
  "Aura Bora": { brand_recognition: 62, category_clarity: 76, flavor_clarity: 72, benefit_clarity: 68, shelf_visibility: 70, digital_shelf_readability: 70, differentiation: 78, sku_confusion_risk: 66 },
  Stumptown: { brand_recognition: 84, category_clarity: 84, flavor_clarity: 78, benefit_clarity: 76, shelf_visibility: 78, digital_shelf_readability: 76, differentiation: 78, sku_confusion_risk: 70 },
  "La Colombe": { brand_recognition: 82, category_clarity: 82, flavor_clarity: 76, benefit_clarity: 74, shelf_visibility: 78, digital_shelf_readability: 76, differentiation: 76, sku_confusion_risk: 70 },
  Chamberlain: { brand_recognition: 62, category_clarity: 76, flavor_clarity: 76, benefit_clarity: 72, shelf_visibility: 72, digital_shelf_readability: 72, differentiation: 78, sku_confusion_risk: 68 },
  Cometeer: { brand_recognition: 70, category_clarity: 76, flavor_clarity: 74, benefit_clarity: 78, shelf_visibility: 72, digital_shelf_readability: 74, differentiation: 82, sku_confusion_risk: 70 },
  "Wandering Bear": { brand_recognition: 66, category_clarity: 74, flavor_clarity: 72, benefit_clarity: 72, shelf_visibility: 70, digital_shelf_readability: 72, differentiation: 76, sku_confusion_risk: 68 },
  "Grady's": { brand_recognition: 68, category_clarity: 76, flavor_clarity: 74, benefit_clarity: 74, shelf_visibility: 72, digital_shelf_readability: 72, differentiation: 78, sku_confusion_risk: 68 },
  Tropicana: { brand_recognition: 94, category_clarity: 90, flavor_clarity: 80, benefit_clarity: 72, shelf_visibility: 88, digital_shelf_readability: 84, differentiation: 66, sku_confusion_risk: 62 },
  Simply: { brand_recognition: 90, category_clarity: 88, flavor_clarity: 80, benefit_clarity: 70, shelf_visibility: 86, digital_shelf_readability: 82, differentiation: 68, sku_confusion_risk: 64 },
  "Natalie's": { brand_recognition: 74, category_clarity: 82, flavor_clarity: 80, benefit_clarity: 76, shelf_visibility: 78, digital_shelf_readability: 76, differentiation: 80, sku_confusion_risk: 72 },
  Evolution: { brand_recognition: 70, category_clarity: 82, flavor_clarity: 78, benefit_clarity: 74, shelf_visibility: 76, digital_shelf_readability: 74, differentiation: 78, sku_confusion_risk: 70 },
  Suja: { brand_recognition: 76, category_clarity: 82, flavor_clarity: 78, benefit_clarity: 76, shelf_visibility: 78, digital_shelf_readability: 76, differentiation: 80, sku_confusion_risk: 72 },
  "Uncle Matt's": { brand_recognition: 66, category_clarity: 78, flavor_clarity: 74, benefit_clarity: 74, shelf_visibility: 72, digital_shelf_readability: 72, differentiation: 78, sku_confusion_risk: 70 },
};

export const COMPETITOR_DOMAINS: Record<string, string> = {
  Olipop: "olipop.com",
  Poppi: "drinkpoppi.com",
  "Culture Pop": "culturepop.com",
  Zevia: "zevia.com",
  Spindrift: "drinkspindrift.com",
  Sanzo: "drinksanzo.com",
  "Red Bull": "redbull.com",
  Monster: "monsterenergy.com",
  Celsius: "celsius.com",
  "Alani Nu": "alaninu.com",
  Ghost: "ghostlifestyle.com",
  C4: "c4energy.com",
  LaCroix: "lacroixwater.com",
  Waterloo: "drinkwaterloo.com",
  Bubly: "bubly.com",
  "Aura Bora": "aurabora.com",
  Stumptown: "stumptowncoffee.com",
  "La Colombe": "lacolombe.com",
  Chamberlain: "chamberlaincoffee.com",
  Cometeer: "cometeer.com",
  "Wandering Bear": "wanderingbearcoffee.com",
  "Grady's": "gradyscoldbrew.com",
  Tropicana: "tropicana.com",
  Simply: "simplyorange.com",
  "Natalie's": "nataliesoj.com",
  Evolution: "evolutionfresh.com",
  Suja: "sujajuice.com",
  "Uncle Matt's": "unclematts.com",
};

export function avgScore(s: CompetitorScore): number {
  return Math.round(
    (s.brand_recognition +
      s.category_clarity +
      s.flavor_clarity +
      s.benefit_clarity +
      s.shelf_visibility +
      s.digital_shelf_readability +
      s.differentiation +
      s.sku_confusion_risk) /
      8
  );
}

export const CATEGORY_COMPETITORS: Record<string, string[]> = {
  functional_soda: ["Olipop", "Poppi", "Culture Pop", "Zevia", "Spindrift", "Sanzo"],
  energy: ["Red Bull", "Monster", "Celsius", "Alani Nu", "Ghost", "C4"],
  sparkling_water: ["LaCroix", "Spindrift", "Waterloo", "Bubly", "Aura Bora", "Sanzo"],
  coffee: ["Stumptown", "La Colombe", "Chamberlain", "Cometeer", "Wandering Bear", "Grady's"],
  juice: ["Tropicana", "Simply", "Natalie's", "Evolution", "Suja", "Uncle Matt's"],
};