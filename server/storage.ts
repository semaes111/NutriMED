import { 
  patients, 
  dietLevels, 
  mealPlans, 
  recipes, 
  foodItems,
  intermittentFasting,
  type Patient, 
  type InsertPatient,
  type DietLevel,
  type MealPlan,
  type Recipe,
  type FoodItem,
  type IntermittentFasting,
  type InsertIntermittentFasting
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc } from "drizzle-orm";

export interface IStorage {
  // Patient operations
  getPatientByAccessCode(accessCode: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatientDietLevel(patientId: number, dietLevel: number): Promise<void>;
  
  // Diet operations
  getDietLevels(): Promise<DietLevel[]>;
  getMealPlansByDietLevel(dietLevelId: number): Promise<MealPlan[]>;
  getRecipesByMealPlan(mealPlanId: number): Promise<Recipe[]>;
  getFoodItemsByCategory(category: string): Promise<FoodItem[]>;
  
  // Intermittent fasting
  getIntermittentFastingByPatient(patientId: number): Promise<IntermittentFasting | undefined>;
  createIntermittentFasting(fasting: InsertIntermittentFasting): Promise<IntermittentFasting>;
}

export class DatabaseStorage implements IStorage {
  async getPatientByAccessCode(accessCode: string): Promise<Patient | undefined> {
    const [patient] = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.accessCode, accessCode),
          eq(patients.isActive, true),
          gte(patients.codeExpiry, new Date())
        )
      );
    return patient || undefined;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db
      .insert(patients)
      .values(insertPatient)
      .returning();
    return patient;
  }

  async updatePatientDietLevel(patientId: number, dietLevel: number): Promise<void> {
    await db
      .update(patients)
      .set({ dietLevel })
      .where(eq(patients.id, patientId));
  }

  async getDietLevels(): Promise<DietLevel[]> {
    return await db
      .select()
      .from(dietLevels)
      .where(eq(dietLevels.isActive, true))
      .orderBy(dietLevels.level);
  }

  async getMealPlansByDietLevel(dietLevelId: number): Promise<MealPlan[]> {
    return await db
      .select()
      .from(mealPlans)
      .where(
        and(
          eq(mealPlans.dietLevelId, dietLevelId),
          eq(mealPlans.isActive, true)
        )
      );
  }

  async getRecipesByMealPlan(mealPlanId: number): Promise<Recipe[]> {
    return await db
      .select()
      .from(recipes)
      .where(
        and(
          eq(recipes.mealPlanId, mealPlanId),
          eq(recipes.isActive, true)
        )
      );
  }

  async getFoodItemsByCategory(category: string): Promise<FoodItem[]> {
    return await db
      .select()
      .from(foodItems)
      .where(
        and(
          eq(foodItems.category, category),
          eq(foodItems.isActive, true)
        )
      );
  }

  async getIntermittentFastingByPatient(patientId: number): Promise<IntermittentFasting | undefined> {
    const [fasting] = await db
      .select()
      .from(intermittentFasting)
      .where(
        and(
          eq(intermittentFasting.patientId, patientId),
          eq(intermittentFasting.isActive, true)
        )
      )
      .orderBy(desc(intermittentFasting.createdAt));
    return fasting || undefined;
  }

  async createIntermittentFasting(insertFasting: InsertIntermittentFasting): Promise<IntermittentFasting> {
    const [fasting] = await db
      .insert(intermittentFasting)
      .values(insertFasting)
      .returning();
    return fasting;
  }
}

export const storage = new DatabaseStorage();
