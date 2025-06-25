import { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import MealPlan from "@/pages/meal-plan";
import IntermittentFasting from "@/pages/intermittent-fasting";
import MoodTrackerPage from "@/pages/mood-tracker";
import Landing from "@/pages/landing";
import ProfessionalDashboard from "@/pages/professional-dashboard";
import ProfessionalDashboardWorking from "@/pages/professional-dashboard-working";
import ProfessionalAccess from "@/pages/professional-access";
import PatientLogin from "@/pages/patient-login";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [patientSession, setPatientSession] = useState<any>(null);

  // Check for patient session
  useEffect(() => {
    const sessionData = localStorage.getItem('patientSession');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        setPatientSession(session);
      } catch (error) {
        console.error('Error parsing patient session:', error);
        localStorage.removeItem('patientSession');
      }
    }
  }, []);

  return (
    <Switch>
      {/* Main patient login page */}
      <Route path="/" component={PatientLogin} />
      
      {/* Professional access routes */}
      <Route path="/professional-access" component={ProfessionalAccess} />
      <Route path="/professional" component={ProfessionalDashboard} />
      <Route path="/professional-dashboard" component={ProfessionalDashboardWorking} />
      
      {/* Dashboard route - available for both authenticated users and temporary sessions */}
      <Route path="/dashboard" component={Dashboard} />
      
      {/* Meal plan routes - available for both authenticated users and temporary sessions */}
      <Route path="/meal-plan/:category" component={MealPlan} />
      
      {/* Intermittent fasting route - available for both authenticated users and temporary sessions */}
      <Route path="/intermittent-fasting" component={IntermittentFasting} />
      
      {/* Mood tracker route - available for both authenticated users and temporary sessions */}
      <Route path="/mood-tracker" component={MoodTrackerPage} />
      
      {/* Fallback routes */}
      <Route path="/landing" component={Landing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
