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
  const [showNutritionalTip, setShowNutritionalTip] = useState(true);

  // Check for patient session (access code login)
  useEffect(() => {
    const sessionData = localStorage.getItem('patientSession');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        // Validate session hasn't expired
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLogin < 24 && session.patient) { // 24 hour session limit
          setPatientSession(session);
        } else {
          localStorage.removeItem('patientSession');
        }
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

  // Get current patient data - either from API or from session
  const currentPatient = patientSession?.patient || patient?.patient;

  const { data: weightHistory } = useQuery({
    queryKey: ["/api/patient/weight-history", currentPatient?.id],
    enabled: !!currentPatient?.id,
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

        {/* Weight Tracking Chart - Complete Implementation */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Seguimiento del Peso</h2>
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="text-medical-blue" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Evolución del Peso</h3>
                    <p className="text-sm text-medical-gray">Progreso hacia tu objetivo de salud</p>
                  </div>
                </div>
                {weightHistory && weightHistory.length > 0 && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total de registros</div>
                    <div className="font-bold text-medical-blue">{weightHistory.length}</div>
                  </div>
                )}
              </div>

              {/* Weight Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600">Peso Inicial</span>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">I</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-800">{currentPatient.initialWeight}</p>
                  <p className="text-xs text-blue-600">kg</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-600">Peso Actual</span>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs font-bold">A</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-green-800">
                    {weightHistory && weightHistory.length > 0 
                      ? parseFloat(weightHistory.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.weight || currentPatient.initialWeight).toFixed(1)
                      : parseFloat(currentPatient.initialWeight).toFixed(1)
                    }
                  </p>
                  <p className="text-xs text-green-600">kg</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-600">Peso Objetivo</span>
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-xs font-bold">O</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-purple-800">{currentPatient.targetWeight}</p>
                  <p className="text-xs text-purple-600">kg</p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-600">Diferencia Total</span>
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 text-xs font-bold">Δ</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-orange-800">
                    {weightHistory && weightHistory.length > 0 
                      ? (parseFloat(currentPatient.initialWeight) - parseFloat(weightHistory.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.weight || currentPatient.initialWeight)).toFixed(1)
                      : '0.0'
                    }
                  </p>
                  <p className="text-xs text-orange-600">kg perdidos</p>
                </div>
              </div>

              {/* Weight Chart or Empty State */}
              {weightHistory && weightHistory.length > 0 ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={(() => {
                          console.log('Raw weight history:', weightHistory);
                          console.log('Data type:', typeof weightHistory, 'Is array:', Array.isArray(weightHistory));
                          
                          if (!Array.isArray(weightHistory)) return [];
                          
                          const sortedHistory = [...weightHistory].sort((a: any, b: any) => 
                            new Date(a.createdAt || a.recordedDate).getTime() - new Date(b.createdAt || b.recordedDate).getTime()
                          );
                          
                          return sortedHistory.map((record: any, index: number) => {
                            const recordDate = new Date(record.createdAt || record.recordedDate);
                            const formattedRecord = {
                              date: `${recordDate.getDate()}/${recordDate.getMonth() + 1} (${recordDate.getHours().toString().padStart(2, '0')}:${recordDate.getMinutes().toString().padStart(2, '0')})`,
                              weight: parseFloat(record.weight),
                              fullDate: record.createdAt || record.recordedDate,
                              notes: record.notes
                            };
                            console.log('Formatted record:', formattedRecord);
                            return formattedRecord;
                          });
                        })()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="date" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          domain={['dataMin - 3', 'dataMax + 3']}
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: any) => [`${value} kg`, 'Peso']}
                          labelFormatter={(label: string) => `Fecha: ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#3b82ff" 
                          strokeWidth={3}
                          dot={{ fill: '#3b82ff', strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 7, fill: '#1d4ed8', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Additional Progress Indicators */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-600">
                          <strong>Objetivo restante:</strong> 
                          {weightHistory && weightHistory.length > 0 
                            ? ` ${Math.abs(parseFloat(weightHistory.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.weight || currentPatient.initialWeight) - parseFloat(currentPatient.targetWeight)).toFixed(1)} kg`
                            : ` ${Math.abs(parseFloat(currentPatient.initialWeight) - parseFloat(currentPatient.targetWeight)).toFixed(1)} kg`
                          }
                        </span>
                        <span className="text-gray-600">
                          <strong>Progreso:</strong> 
                          {weightHistory && weightHistory.length > 0 
                            ? ` ${Math.round(((parseFloat(currentPatient.initialWeight) - parseFloat(weightHistory.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.weight || currentPatient.initialWeight)) / (parseFloat(currentPatient.initialWeight) - parseFloat(currentPatient.targetWeight))) * 100)}%`
                            : ' 0%'
                          }
                        </span>
                      </div>
                      <div className="text-gray-500">
                        Última actualización: {weightHistory && weightHistory.length > 0 
                          ? new Date(weightHistory.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.createdAt).toLocaleDateString('es-ES')
                          : 'Sin registros'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <TrendingUp className="text-gray-400 mb-4" size={48} />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">No hay registros de peso</h4>
                  <p className="text-gray-500 text-center max-w-md">
                    Los registros de peso aparecerán aquí cuando su profesional de la salud los añada al sistema.
                  </p>
                </div>
              )}
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
