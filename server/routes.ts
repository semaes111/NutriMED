import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientSchema } from "@shared/schema";
import { z } from "zod";

const accessCodeSchema = z.object({
  accessCode: z.string().min(6).max(20),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Validate access code
  app.post("/api/auth/validate", async (req, res) => {
    try {
      const { accessCode } = accessCodeSchema.parse(req.body);
      
      const patient = await storage.getPatientByAccessCode(accessCode);
      
      if (!patient) {
        return res.status(401).json({ 
          message: "Código de acceso inválido o expirado" 
        });
      }

      // Set session
      req.session.patientId = patient.id;
      
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

  // Get current patient
  app.get("/api/patient/current", async (req, res) => {
    if (!req.session.patientId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      const patient = await storage.getPatientByAccessCode("");
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

  // Get diet levels
  app.get("/api/diet-levels", async (req, res) => {
    if (!req.session.patientId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      const dietLevels = await storage.getDietLevels();
      res.json(dietLevels);
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Get meal plans by diet level
  app.get("/api/meal-plans/:dietLevelId", async (req, res) => {
    if (!req.session.patientId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      const dietLevelId = parseInt(req.params.dietLevelId);
      const mealPlans = await storage.getMealPlansByDietLevel(dietLevelId);
      res.json(mealPlans);
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Get recipes by meal plan
  app.get("/api/recipes/:mealPlanId", async (req, res) => {
    if (!req.session.patientId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      const mealPlanId = parseInt(req.params.mealPlanId);
      const recipes = await storage.getRecipesByMealPlan(mealPlanId);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Get food items by category
  app.get("/api/food-items/:category", async (req, res) => {
    if (!req.session.patientId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      const category = req.params.category;
      const foodItems = await storage.getFoodItemsByCategory(category);
      res.json(foodItems);
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Get intermittent fasting program
  app.get("/api/intermittent-fasting", async (req, res) => {
    if (!req.session.patientId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      const fasting = await storage.getIntermittentFastingByPatient(req.session.patientId);
      res.json(fasting || null);
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error al cerrar sesión" });
      }
      res.json({ message: "Sesión cerrada exitosamente" });
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
