
export enum RiskLevel {
  SAFE = 'Safe',
  CAUTION = 'Caution',
  TOXIC = 'Toxic/Unhealthy',
  UNKNOWN = 'Unknown'
}

export enum ProductCategory {
  FOOD = 'Food',
  COSMETIC = 'Cosmetic',
  CHEMICAL = 'Household Chemical',
  MATERIAL = 'Material/Fabric',
  KITCHENWARE = 'Kitchenware/Utensil',
  ELECTRONIC = 'Electronic',
  TOY = 'Toy',
  OTHER = 'Other'
}

export interface IngredientAnalysis {
  name: string;
  quantity: string | null; // New field for amount/percentage (e.g., "10g", "5%")
  description: string;
  risk: RiskLevel;
}

export interface NutritionInfo {
  calories: string; // e.g. "120 kcal"
  protein: string;  // e.g. "2g"
  carbs: string;    // e.g. "25g"
  fat: string;      // e.g. "0.5g"
  vitamins: string[]; // e.g. ["Vitamin C", "Potassium"]
}

export interface ScanResult {
  id: string;
  timestamp: number;
  imageUrl: string; // Base64 or local URL
  category: ProductCategory;
  risk_level: RiskLevel;
  verdict: string;
  reasoning: string;
  legal_issues: string | null; // New field for lawsuits/controversies
  estimated_weight: string | null; // e.g. "Approx. 1kg" or "500g"
  nutrition: NutritionInfo | null;
  search_query: string | null; // For external links
  ingredients: IngredientAnalysis[];
}

export interface AppState {
  history: ScanResult[];
}
