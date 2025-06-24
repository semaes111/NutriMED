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
import Landing from "@/pages/landing";
import ProfessionalDashboard from "@/pages/professional-dashboard";
import ProfessionalAccess from "@/pages/professional-access";
import PatientLogin from "@/pages/patient-login";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Main patient login page */}
      <Route path="/" component={PatientLogin} />
      
      {/* Professional access routes */}
      <Route path="/professional-access" component={ProfessionalAccess} />
      <Route path="/professional" component={ProfessionalDashboard} />
      
      {/* Authenticated user routes */}
      {isAuthenticated && (
        <>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/meal-plan/:category" component={MealPlan} />
          <Route path="/intermittent-fasting" component={IntermittentFasting} />
        </>
      )}
      
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
