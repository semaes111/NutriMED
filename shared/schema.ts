import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  json
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // Link to Replit user
  name: text("name").notNull(),
  accessCode: text("access_code").notNull().unique(),
  codeExpiry: timestamp("code_expiry").notNull(),
  dietLevel: integer("diet_level").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const dietLevels = pgTable("diet_levels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'breakfast', 'snack', 'lunch', 'fasting'
  level: integer("level").notNull(),
  glycemicIndex: text("glycemic_index").notNull(), // 'low', 'intermediate', 'high'
  isActive: boolean("is_active").default(true).notNull(),
});

export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  dietLevelId: integer("diet_level_id").references(() => dietLevels.id).notNull(),
  mealType: text("meal_type").notNull(), // 'breakfast', 'snack', 'lunch', 'dinner'
  optionNumber: integer("option_number").notNull().default(1),
  title: text("title").notNull(),
  description: text("description"),
  beverages: json("beverages").$type<string[]>().default([]),
  allowedBreads: json("allowed_breads").$type<string[]>().default([]),
  proteins: json("proteins").$type<string[]>().default([]),
  fruits: json("fruits").$type<string[]>().default([]),
  vegetables: json("vegetables").$type<string[]>().default([]),
  cereals: json("cereals").$type<string[]>().default([]),
  others: json("others").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true).notNull(),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ingredients: json("ingredients").$type<string[]>().notNull(),
  instructions: json("instructions").$type<string[]>().notNull(),
  preparationTime: integer("preparation_time"), // in minutes
  mealPlanId: integer("meal_plan_id").references(() => mealPlans.id),
  category: text("category").notNull(), // 'breakfast', 'snack', 'lunch', 'dinner'
  isActive: boolean("is_active").default(true).notNull(),
});

export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  allowedInDiet: json("allowed_in_diet").$type<number[]>().default([]), // diet level IDs
  quantity: text("quantity"), // e.g., "1 cup", "x2", "1/2 taza"
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const intermittentFasting = pgTable("intermittent_fasting", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  startTime: text("start_time").notNull(), // "19:00"
  endTime: text("end_time").notNull(), // "07:00"
  duration: integer("duration").notNull(), // days
  allowedDrinks: json("allowed_drinks").$type<string[]>().default([]),
  breakfastOptions: json("breakfast_options").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),
  fastingPrograms: many(intermittentFasting),
}));

export const usersRelations = relations(users, ({ many }) => ({
  patients: many(patients),
}));

export const dietLevelsRelations = relations(dietLevels, ({ many }) => ({
  mealPlans: many(mealPlans),
}));

export const mealPlansRelations = relations(mealPlans, ({ one, many }) => ({
  dietLevel: one(dietLevels, {
    fields: [mealPlans.dietLevelId],
    references: [dietLevels.id],
  }),
  recipes: many(recipes),
}));

export const recipesRelations = relations(recipes, ({ one }) => ({
  mealPlan: one(mealPlans, {
    fields: [recipes.mealPlanId],
    references: [mealPlans.id],
  }),
}));

export const intermittentFastingRelations = relations(intermittentFasting, ({ one }) => ({
  patient: one(patients, {
    fields: [intermittentFasting.patientId],
    references: [patients.id],
  }),
}));

// Insert schemas
export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

export const insertDietLevelSchema = createInsertSchema(dietLevels).omit({
  id: true,
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
});

export const insertFoodItemSchema = createInsertSchema(foodItems).omit({
  id: true,
});

export const insertIntermittentFastingSchema = createInsertSchema(intermittentFasting).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type DietLevel = typeof dietLevels.$inferSelect;
export type InsertDietLevel = z.infer<typeof insertDietLevelSchema>;
export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type FoodItem = typeof foodItems.$inferSelect;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type IntermittentFasting = typeof intermittentFasting.$inferSelect;
export type InsertIntermittentFasting = z.infer<typeof insertIntermittentFastingSchema>;
