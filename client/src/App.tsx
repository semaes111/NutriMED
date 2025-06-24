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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/login" component={Login} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/professional-access" component={ProfessionalAccess} />
          <Route path="/professional" component={ProfessionalDashboard} />
          <Route path="/meal-plan/:category" component={MealPlan} />
          <Route path="/intermittent-fasting" component={IntermittentFasting} />
        </>
      )}
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
