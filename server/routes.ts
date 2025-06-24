import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPatientSchema } from "@shared/schema";
import { z } from "zod";

const accessCodeSchema = z.object({
  accessCode: z.string().min(6).max(20),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get current patient (for authenticated users)
  app.get("/api/patient/current", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const patient = await storage.getPatientByUserId(userId);
      
      if (!patient) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      res.json({
        patient: {
          id: patient.id,
          name: patient.name,
          dietLevel: patient.dietLevel,
          codeExpiry: patient.codeExpiry,
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Validate access code and link to user
  app.post("/api/auth/validate-access-code", isAuthenticated, async (req: any, res) => {
    try {
      const { accessCode } = accessCodeSchema.parse(req.body);
      const userId = req.user?.claims?.sub;
      
      const patient = await storage.getPatientByAccessCode(accessCode);
      
      if (!patient) {
        return res.status(401).json({ 
          message: "Código de acceso inválido o expirado" 
        });
      }

      // Link patient to user if not already linked
      if (!patient.userId) {
        await storage.updatePatientUserId(patient.id, userId);
      }
      
      res.json({
        patient: {
          id: patient.id,
          name: patient.name,
          dietLevel: patient.dietLevel,
          codeExpiry: patient.codeExpiry,
        }
      });
    } catch (error) {
      res.status(400).json({ 
        message: "Datos de entrada inválidos" 
      });
    }
  });

  // Get diet levels - authenticated users only
  app.get("/api/diet-levels", isAuthenticated, async (req, res) => {
    try {
      const dietLevels = await storage.getDietLevels();
      res.json(dietLevels);
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Get meal plans by diet level - authenticated users only
  app.get("/api/meal-plans/:dietLevelId", isAuthenticated, async (req, res) => {
    try {
      const dietLevelId = parseInt(req.params.dietLevelId);
      const mealPlans = await storage.getMealPlansByDietLevel(dietLevelId);
      res.json(mealPlans);
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Get recipes by meal plan - authenticated users only
  app.get("/api/recipes/:mealPlanId", isAuthenticated, async (req, res) => {
    try {
      const mealPlanId = parseInt(req.params.mealPlanId);
      const recipes = await storage.getRecipesByMealPlan(mealPlanId);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Get food items by category - authenticated users only
  app.get("/api/food-items/:category", isAuthenticated, async (req, res) => {
    try {
      const category = req.params.category;
      const foodItems = await storage.getFoodItemsByCategory(category);
      res.json(foodItems);
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Get intermittent fasting program - authenticated users only
  app.get("/api/intermittent-fasting", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const patient = await storage.getPatientByUserId(userId);
      
      if (!patient) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      const fasting = await storage.getIntermittentFastingByPatient(patient.id);
      res.json(fasting || null);
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
