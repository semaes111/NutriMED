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
  Heart,
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

  // Fetch patient's weight history with session support
  const { data: weightHistory, refetch: refetchWeightHistory, isLoading: weightLoading } = useQuery({
    queryKey: ["/api/patient/weight-history", patientSession?.patient?.id],
    queryFn: async () => {
      if (!patientSession?.patient?.id) {
        console.log("No patient session found for weight history");
        return [];
      }
      
      console.log("Fetching weight history for patient:", patientSession.patient.id);
      try {
        // Use fetch directly with credentials to ensure session cookies are sent
        const response = await fetch(`/api/weight-history/${patientSession.patient.id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Weight history request failed:", response.status, response.statusText, errorText);
          return [];
        }
        const data = await response.json();
        console.log("Weight history received:", data);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching weight history:", error);
        return [];
      }
    },
    enabled: !!patientSession?.patient?.id,
    retry: 2,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  const { data: patient, isLoading, error } = useQuery<PatientInfo>({
    queryKey: ["/api/patient/current"],
    retry: false,
    enabled: !patientSession, // Only query if no patient session
  });

  // Get current patient data - either from API or from session
  const currentPatient = patientSession?.patient || patient?.patient;

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
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    currentPatient.dietLevel === 1 ? 'bg-emerald-500/80' :
                    currentPatient.dietLevel === 2 ? 'bg-blue-500/80' :
                    currentPatient.dietLevel === 3 ? 'bg-purple-500/80' :
                    currentPatient.dietLevel === 4 ? 'bg-orange-500/80' :
                    currentPatient.dietLevel === 5 ? 'bg-red-500/80' :
                    'bg-gray-500/80'
                  }`}>
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
                    {(() => {
                      if (weightHistory && weightHistory.length > 0) {
                        const latestWeight = weightHistory
                          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                        return parseFloat(latestWeight.weight).toFixed(1);
                      }
                      return parseFloat(currentPatient.initialWeight).toFixed(1);
                    })()}
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
                    {(() => {
                      if (weightHistory && weightHistory.length > 0) {
                        const latestWeight = weightHistory
                          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                        const difference = parseFloat(currentPatient.initialWeight) - parseFloat(latestWeight.weight);
                        return difference.toFixed(1);
                      }
                      return '0.0';
                    })()}
                  </p>
                  <p className="text-xs text-orange-600">
                    {(() => {
                      if (weightHistory && weightHistory.length > 0) {
                        const latestWeight = weightHistory
                          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                        const difference = parseFloat(currentPatient.initialWeight) - parseFloat(latestWeight.weight);
                        return difference >= 0 ? 'kg perdidos' : 'kg ganados';
                      }
                      return 'kg';
                    })()}
                  </p>
                </div>
              </div>

              {/* Enhanced 3D Weight Progress Chart */}
              {(() => {
                console.log("Dashboard weightHistory check:", {
                  exists: !!weightHistory,
                  isArray: Array.isArray(weightHistory),
                  length: weightHistory?.length || 0,
                  patientId: patientSession?.patient?.id,
                  sessionExists: !!patientSession,
                  data: weightHistory
                });
                
                // Force refetch if we have a patient but no data
                if (patientSession?.patient?.id && (!weightHistory || weightHistory.length === 0) && !weightLoading) {
                  console.log("Force refetching weight history...");
                  refetchWeightHistory();
                }
                
                return weightHistory && Array.isArray(weightHistory) && weightHistory.length > 0;
              })() ? (
                <div className="relative p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-400/30 to-purple-600/30"></div>
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-400/20 rounded-full blur-xl"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <TrendingUp className="text-white" size={18} />
                      </div>
                      Evolución del Peso 3D
                    </h4>
                    
                    <div className="h-80 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={(() => {
                            if (!weightHistory || weightHistory.length === 0) return [];
                            
                            const sortedData = weightHistory
                              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                            
                            console.log("Chart data sorted by createdAt:", sortedData.map(r => ({ id: r.id, weight: r.weight, createdAt: r.createdAt })));
                            
                            const chartData = sortedData
                              .map((record, index, arr) => {
                                const weight = parseFloat(record.weight);
                                const prevWeight = index > 0 ? parseFloat(arr[index - 1].weight) : weight;
                                const isImprovement = weight < prevWeight;
                                const isEqual = weight === prevWeight;
                                
                                return {
                                  date: new Date(record.createdAt).toLocaleDateString('es-ES', { 
                                    day: '2-digit', 
                                    month: '2-digit' 
                                  }),
                                  weight: weight,
                                  color: isEqual ? '#fbbf24' : (isImprovement ? '#10b981' : '#ef4444'),
                                  trend: isEqual ? 'igual' : (isImprovement ? 'mejora' : 'retroceso'),
                                  change: index > 0 ? (weight - prevWeight).toFixed(1) : '0.0',
                                  recordId: record.id,
                                  createdAt: record.createdAt
                                };
                              });
                            
                            console.log("Patient dashboard - Final chart data:", chartData);
                            console.log("Patient dashboard - Last point in chart:", chartData[chartData.length - 1]);
                            
                            return chartData;
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
                        <defs>
                            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8}/>
                              <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.6}/>
                              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                            </linearGradient>
                            
                            <filter id="glow">
                              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                              <feMerge> 
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                            
                            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
                            </filter>
                          </defs>
                          
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="#374151" 
                            strokeOpacity={0.3}
                          />
                          
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12, fill: '#d1d5db' }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            stroke="#6b7280"
                          />
                          
                          <YAxis 
                            domain={['dataMin - 2', 'dataMax + 2']} 
                            tick={{ fontSize: 12, fill: '#d1d5db' }}
                            label={{ 
                              value: 'Peso (kg)', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { textAnchor: 'middle', fill: '#d1d5db' }
                            }}
                            stroke="#6b7280"
                          />
                          
                          <Tooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
                                    <p className="text-gray-200 font-medium mb-1">📅 {label}</p>
                                    <p className="text-white font-bold text-lg mb-1">
                                      ⚖️ {payload[0].value} kg
                                    </p>
                                    {data.change !== '0.0' && (
                                      <p className={`text-sm font-medium ${
                                        data.trend === 'mejora' ? 'text-green-400' : 
                                        data.trend === 'retroceso' ? 'text-red-400' : 'text-yellow-400'
                                      }`}>
                                        {data.trend === 'mejora' ? '📉 Mejora: ' : 
                                         data.trend === 'retroceso' ? '📈 Retroceso: ' : '➡️ Sin cambio: '}
                                        {Math.abs(parseFloat(data.change))} kg
                                      </p>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          
                          <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="url(#weightGradient)"
                            strokeWidth={4}
                            filter="url(#glow)"
                            dot={({ cx, cy, payload, index }) => {
                              // Calcular tamaño basado en el tipo de cambio
                              const baseSize = 8;
                              const sizeVariation = payload.trend === 'mejora' ? 2 : 
                                                   payload.trend === 'retroceso' ? -1 : 0;
                              const finalSize = baseSize + sizeVariation;
                              
                              return (
                                <circle
                                  key={`dot-${index}`}
                                  cx={cx}
                                  cy={cy}
                                  r={finalSize}
                                  fill={payload.color}
                                  stroke="#ffffff"
                                  strokeWidth={3}
                                  filter="url(#shadow)"
                                  style={{
                                    transition: 'r 0.3s ease-in-out'
                                  }}
                                />
                              );
                            }}
                            activeDot={{
                              r: 12,
                              fill: '#06b6d4',
                              stroke: '#ffffff',
                              strokeWidth: 3,
                              filter: 'url(#glow)'
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-4 flex justify-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full shadow-lg"></div>
                        <span className="text-green-300 font-medium">📉 Mejora (punto grande)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>
                        <span className="text-red-300 font-medium">📈 Retroceso (punto pequeño)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg"></div>
                        <span className="text-yellow-300 font-medium">➡️ Sin cambio (punto normal)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative h-80 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-400/30 to-purple-600/30"></div>
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-400/20 rounded-full blur-xl"></div>
                  </div>
                  
                  <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-2xl">
                      <TrendingUp className="text-white" size={40} />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-4">Evolución de Peso 3D</h4>
                    <p className="text-gray-300 text-center max-w-md mb-6">
                      Su gráfica de evolución con análisis visual avanzado aparecerá aquí cuando su profesional médico registre datos de peso.
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs">📉</span>
                        </div>
                        <span className="text-green-300 font-medium">Mejoras</span>
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs">📈</span>
                        </div>
                        <span className="text-red-300 font-medium">Retrocesos</span>
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs">➡️</span>
                        </div>
                        <span className="text-yellow-300 font-medium">Estable</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-xs text-gray-400">
                      Visualización interactiva con efectos 3D y códigos de color
                    </div>
                  </div>
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
