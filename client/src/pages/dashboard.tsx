import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PatientInfo } from "@/lib/types";
import { 
  Utensils, 
  Sun, 
  Cookie, 
  Clock, 
  CheckCircle, 
  LogOut, 
  ChevronRight,
  Calendar,
  Wheat,
  Apple,
  Drumstick,
  Leaf,
  Carrot,
  Fish,
  Pizza,
  Sprout
} from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: patient, isLoading, error } = useQuery<PatientInfo>({
    queryKey: ["/api/patient/current"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      toast({
        title: "Sesión cerrada",
        description: "Ha cerrado sesión exitosamente",
      });
      setLocation("/");
    },
  });

  useEffect(() => {
    if (error) {
      setLocation("/");
    }
  }, [error, setLocation]);

  const handleLogout = () => {
    if (confirm("¿Está seguro de que desea cerrar sesión?")) {
      logoutMutation.mutate();
    }
  };

  const navigateToMealPlan = (category: string) => {
    setLocation(`/meal-plan/${category}`);
  };

  const navigateToIntermittentFasting = () => {
    setLocation("/intermittent-fasting");
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-green mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del paciente...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const daysUntilExpiry = getDaysUntilExpiry(patient.codeExpiry);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-medical-green rounded-full flex items-center justify-center">
                <Utensils className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mi Plan Dietético</h1>
                <p className="text-sm text-medical-gray">Paciente: {patient.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Code Validity Status */}
              <div className={`border rounded-lg px-3 py-2 ${
                daysUntilExpiry > 7 
                  ? 'bg-green-50 border-green-200' 
                  : daysUntilExpiry > 0 
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`${
                    daysUntilExpiry > 7 
                      ? 'text-green-600' 
                      : daysUntilExpiry > 0 
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`} size={16} />
                  <span className={`text-sm font-medium ${
                    daysUntilExpiry > 7 
                      ? 'text-green-700' 
                      : daysUntilExpiry > 0 
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  }`}>
                    {daysUntilExpiry > 0 
                      ? `Válido ${daysUntilExpiry} días más` 
                      : 'Código expirado'
                    }
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Diet Level Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu Nivel Dietético Actual</h2>
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-medical-blue rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">{patient.dietLevel}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Plan Nutricional Personalizado
                    </h3>
                    <p className="text-medical-gray">
                      Nivel {patient.dietLevel} - Plan equilibrado con control glucémico
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Código válido hasta</div>
                  <div className="font-medium text-gray-900">
                    {new Date(patient.codeExpiry).toLocaleDateString('es-ES')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meal Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Breakfast Section */}
          <Card 
            className="shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => navigateToMealPlan('breakfast')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Sun className="text-yellow-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Desayuno</h3>
                  <p className="text-sm text-gray-500">Completo con IG bajo</p>
                </div>
              </div>
              
              {/* Quick Preview */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Wheat className="text-amber-500 mr-2" size={16} />
                  Pan integral, espelta, centeno
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Apple className="text-red-500 mr-2" size={16} />
                  Frutas permitidas: manzana, kiwi, naranja
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Drumstick className="text-orange-500 mr-2" size={16} />
                  Huevos, yogur natural, proteínas
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-medical-green font-medium">Ver plan completo</span>
                  <ChevronRight className="text-gray-400" size={16} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Snack Section */}
          <Card 
            className="shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => navigateToMealPlan('snack')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Cookie className="text-green-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Merienda</h3>
                  <p className="text-sm text-gray-500">Continental con IG bajo</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Sprout className="text-green-500 mr-2" size={16} />
                  Frutos secos naturales
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Pizza className="text-yellow-500 mr-2" size={16} />
                  Yogur, queso, encurtidos
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Fish className="text-blue-500 mr-2" size={16} />
                  Atún, jamón, embutidos permitidos
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-medical-green font-medium">Ver opciones</span>
                  <ChevronRight className="text-gray-400" size={16} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lunch/Dinner Section */}
          <Card 
            className="shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => navigateToMealPlan('lunch')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Utensils className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Almuerzo/Cena</h3>
                  <p className="text-sm text-gray-500">Antiinflamatoria IG bajo</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Leaf className="text-green-500 mr-2" size={16} />
                  Ensaladas verdes variadas
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Drumstick className="text-red-500 mr-2" size={16} />
                  Carnes magras, pescados, huevos
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Carrot className="text-orange-500 mr-2" size={16} />
                  Verduras al vapor, horno, plancha
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-medical-green font-medium">Ver recetas</span>
                  <ChevronRight className="text-gray-400" size={16} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Special Programs */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Clock className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ayuno Intermitente</h3>
                <p className="text-sm text-gray-600">Programa de 12 horas (7 PM - 7 AM)</p>
              </div>
            </div>
            <Button 
              onClick={navigateToIntermittentFasting}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Ver Programa
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Importante</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-medical-green rounded-full flex items-center justify-center">
                  <CheckCircle className="text-white" size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Plan dietético personalizado activo</p>
                  <p className="text-xs text-gray-500">Nivel {patient.dietLevel} asignado por Dr. Martínez</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Calendar className="text-white" size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Seguimiento médico disponible</p>
                  <p className="text-xs text-gray-500">Consulte con su médico para ajustes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
