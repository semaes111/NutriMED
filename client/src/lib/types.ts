export interface PatientInfo {
  id: number;
  name: string;
  dietLevel: number;
  codeExpiry: string;
}

export interface DietLevel {
  id: number;
  name: string;
  description: string;
  category: string;
  level: number;
  glycemicIndex: string;
}

export interface MealPlan {
  id: number;
  dietLevelId: number;
  mealType: string;
  optionNumber: number;
  title: string;
  description?: string;
  beverages: string[];
  allowedBreads: string[];
  proteins: string[];
  fruits: string[];
  vegetables: string[];
  cereals: string[];
  others: string[];
}

export interface Recipe {
  id: number;
  name: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  preparationTime?: number;
  category: string;
}

export interface FoodItem {
  id: number;
  name: string;
  category: string;
  allowedInDiet: number[];
  quantity?: string;
  notes?: string;
}

export interface IntermittentFastingProgram {
  id: number;
  patientId: number;
  startTime: string;
  endTime: string;
  duration: number;
  allowedDrinks: string[];
  breakfastOptions: string[];
}
