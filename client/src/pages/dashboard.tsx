import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PatientInfo } from "@/lib/types";
import { isUnauthorizedError } from "@/lib/authUtils";
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
  Sprout,
  Stethoscope,
  TrendingUp
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [patientSession, setPatientSession] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Check for patient session (access code login)
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

  // Session timer countdown for temporary access
  useEffect(() => {
    if (!patientSession?.patient?.codeExpiry) return;

    const updateTimer = () => {
      const expiryDate = new Date(patientSession.patient.codeExpiry);
      const now = new Date();
      const timeDiff = expiryDate.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setTimeRemaining("Expirado");
        localStorage.removeItem('patientSession');
        toast({
          title: "Sesión Expirada",
          description: "Su código de acceso ha expirado. Por favor contacte con su médico.",
          variant: "destructive",
        });
        setTimeout(() => setLocation('/'), 3000);
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }

      // Warning notifications
      if (days === 0 && hours === 0 && minutes <= 30 && minutes > 0) {
        toast({
          title: "Acceso Próximo a Expirar",
          description: `Su código expira en ${minutes} minutos`,
          variant: "destructive",
        });
      } else if (days === 1 && hours <= 1) {
        toast({
          title: "Acceso Expira Pronto",
          description: "Su código expira en menos de 24 horas",
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [patientSession, toast, setLocation]);

  const { data: patient, isLoading, error } = useQuery<PatientInfo>({
    queryKey: ["/api/patient/current"],
    retry: false,
    enabled: !patientSession, // Only query if no patient session
  });

  const { data: weightHistory } = useQuery({
    queryKey: ["/api/patient/weight-history"],
    enabled: !!patient,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      window.location.href = "/api/logout";
    },
    onSuccess: () => {
      toast({
        title: "Sesión cerrada",
        description: "Ha cerrado sesión exitosamente",
      });
    },
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Sesión expirada",
        description: "Por favor inicia sesión nuevamente",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [error, toast]);

  const handleLogout = () => {
    if (patientSession) {
      localStorage.removeItem('patientSession');
      setLocation('/');
    } else {
      if (confirm("¿Está seguro de que desea cerrar sesión?")) {
        logoutMutation.mutate();
      }
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

  // Get current patient data - either from API or from session
  const currentPatient = patientSession?.patient || patient?.patient;
  
  if (isLoading && !patientSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-green mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del paciente...</p>
        </div>
      </div>
    );
  }

  if (!currentPatient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-lg w-full shadow-sm">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Código de Acceso Requerido
            </h2>
            <p className="text-gray-600 mb-6">
              Necesitas introducir tu código de acceso para ver tu plan dietético personalizado.
            </p>
            <Button
              onClick={() => setLocation("/login")}
              className="bg-medical-green text-white hover:bg-green-700"
            >
              Introducir Código
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate days until expiry safely
  const daysUntilExpiry = currentPatient ? getDaysUntilExpiry(currentPatient.codeExpiry) : 0;

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
                <p className="text-sm text-medical-gray">Paciente: {currentPatient.name}</p>
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
              
              {/* Session Type Badge and Timer */}
              {patientSession && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    Sesión Temporal
                  </Badge>
                  {timeRemaining && (
                    <Badge 
                      variant={timeRemaining === "Expirado" ? "destructive" : "outline"} 
                      className={`text-xs ${
                        timeRemaining.includes('m') && !timeRemaining.includes('h') && !timeRemaining.includes('d')
                          ? 'border-red-500 text-red-700 bg-red-50' 
                          : ''
                      }`}
                    >
                      <Clock className="mr-1" size={12} />
                      {timeRemaining}
                    </Badge>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={() => setLocation("/professional-access")}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Stethoscope className="mr-2" size={16} />
                  Panel Profesional
                </Button>
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
                    <span className="text-white font-bold text-xl">{currentPatient.dietLevel}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Plan Nutricional Personalizado
                    </h3>
                    <p className="text-medical-gray">
                      Nivel {currentPatient.dietLevel} - Plan equilibrado con control glucémico
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Código válido hasta</div>
                  <div className="font-medium text-gray-900">
                    {new Date(currentPatient.codeExpiry).toLocaleDateString('es-ES')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weight Tracking Chart */}
        {weightHistory && weightHistory.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={20} className="text-medical-green" />
                  Evolución del Peso
                </h3>
                <Badge variant="secondary">
                  {weightHistory.length} registros
                </Badge>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightHistory.map((record: any) => ({
                    date: new Date(record.recordedDate).toLocaleDateString('es-ES'),
                    weight: parseFloat(record.weight),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Session Status for Temporary Access */}
        {patientSession && (
          <Card className="mb-8 border-l-4 border-l-medical-green">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-medical-green rounded-full flex items-center justify-center">
                    <Clock className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Acceso Temporal Activo</h3>
                    <p className="text-sm text-gray-600">
                      Tiempo restante: <span className="font-medium text-medical-green">{timeRemaining}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Expira el</div>
                  <div className="font-medium text-gray-900">
                    {new Date(patientSession.patient.codeExpiry).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                  <p className="text-xs text-gray-500">Nivel {currentPatient.dietLevel} asignado por Dr. Martínez</p>
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
