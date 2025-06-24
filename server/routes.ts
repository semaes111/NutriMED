import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPatientSchema, insertWeightRecordSchema, insertProfessionalSchema } from "@shared/schema";
import { z } from "zod";

const accessCodeSchema = z.object({
  accessCode: z.string().min(6).max(20),
});

const professionalAccessCodeSchema = z.object({
  accessCode: z.string().min(8).max(20),
});

function generateAccessCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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

  // Patient routes

  // Validate patient access code - no auth required for initial validation
  app.post("/api/patient/validate", async (req, res) => {
    try {
      console.log("Patient validation request body:", req.body);
      const { accessCode } = req.body;
      
      if (!accessCode) {
        console.log("No access code provided");
        return res.status(400).json({ message: "Código de acceso requerido" });
      }

      console.log("Looking for patient with access code:", accessCode);
      const patient = await storage.getPatientByAccessCode(accessCode);
      console.log("Patient found:", patient);
      
      if (!patient || !patient.isActive) {
        console.log("Patient not found or inactive");
        return res.status(404).json({ message: "Código de acceso no válido" });
      }

      // Check if code is expired
      const now = new Date();
      if (patient.codeExpiry && new Date(patient.codeExpiry) < now) {
        console.log("Patient code expired");
        return res.status(410).json({ message: "Código de acceso expirado" });
      }

      console.log("Patient validation successful");
      res.json({
        valid: true,
        patient: {
          id: patient.id,
          name: patient.name,
          dietLevel: patient.dietLevel,
          accessCode: patient.accessCode,
          codeExpiry: patient.codeExpiry,
          age: patient.age,
          height: patient.height,
          initialWeight: patient.initialWeight,
          targetWeight: patient.targetWeight,
          medicalNotes: patient.medicalNotes
        }
      });
    } catch (error) {
      console.error("Error validating patient code:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Professional routes

  // Validate professional access code - no auth required for initial validation
  app.post("/api/professional/validate", async (req, res) => {
    try {
      console.log("Professional validation request body:", req.body);
      const { accessCode } = req.body;
      
      if (!accessCode) {
        console.log("No access code provided");
        return res.status(400).json({ message: "Código de acceso requerido" });
      }

      console.log("Looking for professional with code:", accessCode);
      const professional = await storage.getProfessionalByAccessCode(accessCode);
      console.log("Professional found:", professional);
      
      if (!professional || !professional.isActive) {
        console.log("Professional not found or inactive");
        return res.status(404).json({ message: "Código profesional no válido" });
      }
      
      res.json({
        valid: true,
        professional: {
          id: professional.id,
          name: professional.name,
          specialty: professional.specialty,
          licenseNumber: professional.licenseNumber,
          accessCode: professional.accessCode
        }
      });
    } catch (error) {
      console.error("Error in professional validation:", error);
      res.status(500).json({ 
        message: "Error interno del servidor" 
      });
    }
  });

  // Get professional profile
  app.get("/api/professional/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      console.log("Fetching professional profile for userId:", userId);
      
      const professional = await storage.getProfessionalByUserId(userId);
      
      if (!professional) {
        console.log("No professional found for userId:", userId);
        return res.status(404).json({ message: "Perfil profesional no encontrado" });
      }

      console.log("Professional found:", professional);
      res.json({
        professional: {
          id: professional.id,
          name: professional.name,
          specialty: professional.specialty,
          licenseNumber: professional.licenseNumber,
          email: professional.email,
        }
      });
    } catch (error) {
      console.error("Error fetching professional profile:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Create new patient
  app.post("/api/professional/patients", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const professional = await storage.getProfessionalByUserId(userId);
      
      if (!professional) {
        return res.status(403).json({ message: "Acceso no autorizado" });
      }

      // Generate access code and set expiry
      const accessCode = generateAccessCode();
      const codeExpiry = new Date();
      codeExpiry.setDate(codeExpiry.getDate() + 30); // 30 days validity

      // Create patient data with proper types
      const patientData = {
        name: req.body.name,
        age: parseInt(req.body.age),
        height: req.body.height.toString(),
        initialWeight: req.body.initialWeight.toString(),
        targetWeight: req.body.targetWeight.toString(),
        dietLevel: parseInt(req.body.dietLevel),
        medicalNotes: req.body.medicalNotes || null,
        accessCode,
        codeExpiry,
        isActive: true,
      };

      console.log("Creating patient with data:", patientData);
      const newPatient = await storage.createPatient(patientData);

      res.json({
        patient: newPatient,
        accessCode,
      });
    } catch (error) {
      console.error("Error creating patient:", error);
      res.status(400).json({ 
        message: "Error al crear paciente: " + (error as Error).message 
      });
    }
  });

  // Get all patients for professional
  app.get("/api/professional/patients", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const professional = await storage.getProfessionalByUserId(userId);
      
      if (!professional) {
        return res.status(403).json({ message: "Acceso no autorizado" });
      }

      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Update patient diet level
  app.patch("/api/professional/patients/:patientId/diet-level", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const professional = await storage.getProfessionalByUserId(userId);
      
      if (!professional) {
        return res.status(403).json({ message: "Acceso no autorizado" });
      }

      const patientId = parseInt(req.params.patientId);
      const { dietLevel } = req.body;

      await storage.updatePatientDietLevel(patientId, dietLevel);
      
      res.json({ message: "Nivel de dieta actualizado exitosamente" });
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Add weight record for patient
  app.post("/api/professional/patients/:patientId/weight", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const professional = await storage.getProfessionalByUserId(userId);
      
      if (!professional) {
        return res.status(403).json({ message: "Acceso no autorizado" });
      }

      const patientId = parseInt(req.params.patientId);
      const { weight, targetWeight, notes } = req.body;
      
      console.log("Weight registration request:", { patientId, weight, targetWeight, notes });
      
      if (!weight || isNaN(parseFloat(weight)) || parseFloat(weight) < 30 || parseFloat(weight) > 300) {
        console.log("Invalid weight:", weight);
        return res.status(400).json({ message: "Peso inválido. Debe estar entre 30 y 300 kg." });
      }

      // Validate target weight if provided
      if (targetWeight && (isNaN(parseFloat(targetWeight)) || parseFloat(targetWeight) < 30 || parseFloat(targetWeight) > 300)) {
        console.log("Invalid target weight:", targetWeight);
        return res.status(400).json({ message: "Peso objetivo inválido. Debe estar entre 30 y 300 kg." });
      }

      // Create weight record with current date
      const today = new Date();
      today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      
      const weightRecord = await storage.addWeightRecord({
        patientId,
        weight: parseFloat(weight).toFixed(2),
        notes: notes || null,
        recordedDate: today
      });

      // Generate new access code and extend expiry date
      const newAccessCode = generateAccessCode();
      const newCodeExpiry = new Date();
      newCodeExpiry.setDate(newCodeExpiry.getDate() + 30); // 30 days from now

      // Update patient with new access code
      await storage.updatePatientAccessCode(patientId, newAccessCode, newCodeExpiry);

      console.log("Weight record created:", weightRecord);
      console.log("New access code generated for patient:", { patientId, newAccessCode });
      
      res.json({
        weightRecord,
        newAccessCode,
        message: "Peso registrado exitosamente. Nuevo código de acceso generado."
      });
    } catch (error) {
      console.error("Error adding weight record:", error);
      res.status(500).json({ message: "Error al añadir registro de peso: " + (error as Error).message });
    }
  });

  // Get weight history for patient
  app.get("/api/professional/patients/:patientId/weight-history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const professional = await storage.getProfessionalByUserId(userId);
      
      if (!professional) {
        return res.status(403).json({ message: "Acceso no autorizado" });
      }

      const patientId = parseInt(req.params.patientId);
      console.log("Fetching weight history for patient ID:", patientId);
      
      const weightHistory = await storage.getWeightRecordsByPatient(patientId);
      console.log("Weight history found:", weightHistory);
      
      res.json(weightHistory);
    } catch (error) {
      console.error("Error fetching weight history:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Get patient weight history (for patient dashboard)
  app.get("/api/patient/weight-history/:patientId?", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const requestedPatientId = req.params.patientId;
      
      let patient;
      
      if (requestedPatientId) {
        // If patient ID is provided, get that specific patient
        patient = await storage.getPatientById(parseInt(requestedPatientId));
      } else {
        // Otherwise, get patient by user ID (authenticated user)
        patient = await storage.getPatientByUserId(userId);
      }
      
      if (!patient) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      console.log("Fetching weight history for patient ID:", patient.id);
      const weightHistory = await storage.getWeightRecordsByPatient(patient.id);
      console.log("Weight history found:", weightHistory.length, "records");
      
      // Sort by creation date to maintain chronological order
      const sortedHistory = weightHistory.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      res.json(sortedHistory);
    } catch (error) {
      console.error("Error fetching patient weight history:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
