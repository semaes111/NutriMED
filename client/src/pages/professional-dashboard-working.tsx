import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Users, 
  UserPlus, 
  Activity, 
  LogOut, 
  Stethoscope,
  Search,
  Eye,
  Edit,
  Weight,
  Plus,
  Calendar,
  RefreshCw,
  Ban,
  AlertTriangle,
  TrendingUp,
  Settings
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const addWeightSchema = z.object({
  weight: z.string().min(1, "El peso es requerido")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 10 && num <= 500;
    }, "Peso debe estar entre 10 y 500 kg"),
  notes: z.string().optional(),
});

const changeDietSchema = z.object({
  dietLevel: z.string().min(1, "El nivel de dieta es requerido"),
});

const targetWeightSchema = z.object({
  targetWeight: z.string().min(1, "Peso objetivo requerido")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 10 && num <= 500;
    }, "Peso debe estar entre 10 y 500 kg")
});

const createPatientSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  age: z.string().min(1, "La edad es requerida")
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 120;
    }, "Edad debe estar entre 1 y 120 años"),
  height: z.string().min(1, "La estatura es requerida")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 50 && num <= 250;
    }, "Estatura debe estar entre 50 y 250 cm"),
  initialWeight: z.string().min(1, "El peso inicial es requerido")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 10 && num <= 500;
    }, "Peso inicial debe estar entre 10 y 500 kg"),
  targetWeight: z.string().min(1, "El peso objetivo es requerido")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 10 && num <= 500;
    }, "Peso objetivo debe estar entre 10 y 500 kg"),
  dietLevel: z.string().min(1, "El nivel de dieta es requerido"),
  medicalNotes: z.string().optional(),
});

export default function ProfessionalDashboardWorking() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [professionalInfo, setProfessionalInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("patients");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [showChangeDiet, setShowChangeDiet] = useState(false);
  const [showTargetWeightModal, setShowTargetWeightModal] = useState(false);
  const [showRevokeCodeModal, setShowRevokeCodeModal] = useState(false);
  const [showCreatePatient, setShowCreatePatient] = useState(false);

  useEffect(() => {
    console.log('Working Professional Dashboard useEffect triggered');
    const storedInfo = localStorage.getItem('professionalInfo');
    console.log('StoredInfo from localStorage:', storedInfo);
    
    if (storedInfo) {
      try {
        const parsed = JSON.parse(storedInfo);
        setProfessionalInfo(parsed);
        console.log('Professional info loaded:', parsed);
      } catch (error) {
        console.error('Error parsing professional info:', error);
        localStorage.removeItem('professionalInfo');
        setLocation('/professional-access');
      }
    } else {
      console.log('No professional info found, redirecting to access page');
      setLocation('/professional-access');
    }
  }, [setLocation]);

  // Get all patients
  const { data: patients, isLoading: isPatientsLoading } = useQuery({
    queryKey: ["/api/professional/patients"],
    enabled: !!professionalInfo,
    retry: false,
  });

  // Get diet levels
  const { data: dietLevels } = useQuery({
    queryKey: ["/api/diet-levels"],
    enabled: !!professionalInfo,
    retry: false,
  });

  // Get weight history for selected patient
  const { data: weightHistory, refetch: refetchWeight } = useQuery({
    queryKey: ["/api/professional/patients", selectedPatient?.id, "weight-history"],
    queryFn: async () => {
      if (!selectedPatient?.id) return [];
      const response = await apiRequest("GET", `/api/professional/patients/${selectedPatient.id}/weight-history`);
      const data = await response.json();
      return data;
    },
    enabled: !!selectedPatient?.id,
    retry: false,
  });

  // Add weight mutation
  const addWeightMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/professional/patients/${selectedPatient.id}/weight`, {
        weight: parseFloat(data.weight),
        notes: data.notes || "",
      });
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Weight added successfully:", data);
      
      // Show enhanced success notification with prominent code display
      toast({
        title: "✅ Peso Registrado Exitosamente",
        description: (
          <div className="space-y-3">
            <p className="text-sm">Peso de {selectedPatient?.name} actualizado correctamente.</p>
            <div className="bg-green-100 border border-green-300 rounded-lg p-3">
              <p className="text-xs font-medium text-green-800 mb-1">🆕 NUEVO CÓDIGO DE ACCESO:</p>
              <div className="bg-white border-2 border-green-400 rounded p-2 flex items-center justify-between">
                <code className="text-lg font-bold text-green-900 tracking-wider">{data.newAccessCode}</code>
                <button 
                  onClick={() => navigator.clipboard.writeText(data.newAccessCode)}
                  className="ml-2 text-green-700 hover:text-green-900"
                  title="Copiar código"
                >
                  📋
                </button>
              </div>
              <p className="text-xs text-green-700 mt-1">
                ⚠️ El código anterior ha sido invalidado
              </p>
            </div>
          </div>
        ),
        variant: "default",
        duration: 10000, // Show for 10 seconds
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/professional/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/professional/patients", selectedPatient.id, "weight-history"] });
      refetchWeight();
      setShowAddWeight(false);
      addWeightForm.reset();
      
      // Update selected patient with new access code for immediate display
      if (selectedPatient) {
        setSelectedPatient({
          ...selectedPatient,
          accessCode: data.newAccessCode
        });
      }
    },
    onError: (error: any) => {
      console.error("Error adding weight:", error);
      toast({
        title: "Error",
        description: error.message || "Error al registrar el peso",
        variant: "destructive",
      });
    },
  });

  // Form for adding weight
  const addWeightForm = useForm({
    resolver: zodResolver(addWeightSchema),
    defaultValues: {
      weight: "",
      notes: "",
    },
  });

  const onSubmitWeight = (data: any) => {
    addWeightMutation.mutate(data);
  };

  // Change diet level mutation
  const changeDietMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/professional/patients/${selectedPatient.id}/diet-level`, {
        dietLevel: parseInt(data.dietLevel),
      });
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Diet level changed successfully:", data);
      toast({
        title: "Nivel de dieta actualizado",
        description: `El nivel de dieta se cambió exitosamente a nivel ${data.dietLevel}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/professional/patients"] });
      setShowChangeDiet(false);
      changeDietForm.reset();
      setSelectedPatient({ ...selectedPatient, dietLevel: data.dietLevel });
    },
    onError: (error: any) => {
      console.error("Error changing diet level:", error);
      toast({
        title: "Error",
        description: error.message || "Error al cambiar el nivel de dieta",
        variant: "destructive",
      });
    },
  });

  // Form for changing diet level
  const changeDietForm = useForm({
    resolver: zodResolver(changeDietSchema),
    defaultValues: {
      dietLevel: selectedPatient?.dietLevel?.toString() || "",
    },
  });

  const onSubmitDietChange = (data: any) => {
    changeDietMutation.mutate(data);
  };

  // Target weight mutation
  const targetWeightMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/professional/patients/${selectedPatient.id}/target-weight`, {
        targetWeight: parseFloat(data.targetWeight)
      });
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Target weight updated successfully:", data);
      toast({
        title: "Peso objetivo actualizado",
        description: "El objetivo ha sido modificado exitosamente",
      });
      setShowTargetWeightModal(false);
      targetWeightForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/professional/patients"] });
      setSelectedPatient({ ...selectedPatient, targetWeight: data.newTargetWeight });
    },
    onError: (error: any) => {
      console.error("Error updating target weight:", error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar peso objetivo",
        variant: "destructive",
      });
    },
  });

  // Form for target weight
  const targetWeightForm = useForm({
    resolver: zodResolver(targetWeightSchema),
    defaultValues: {
      targetWeight: "",
    },
  });

  const onSubmitTargetWeight = (data: any) => {
    targetWeightMutation.mutate(data);
  };

  // Revoke code mutation
  const revokeCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/professional/patients/${selectedPatient.id}/revoke-code`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🚫 Código de Acceso Anulado",
        description: `El código de acceso de ${selectedPatient?.name} ha sido anulado exitosamente. El paciente ya no podrá acceder al sistema.`,
        variant: "default",
        duration: 8000,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/professional/patients"] });
      setShowRevokeCodeModal(false);
      
      // Update selected patient to reflect the revoked status
      if (selectedPatient) {
        setSelectedPatient({
          ...selectedPatient,
          accessCode: data.accessCode || "ANULADO",
          codeExpiry: new Date().toISOString() // Set to current date to show as expired
        });
      }
    },
    onError: (error: any) => {
      console.error("Code revocation error:", error);
      toast({
        title: "❌ Error al Anular Código",
        description: error.message || "Error al anular el código de acceso",
        variant: "destructive",
      });
    },
  });

  const onRevokeCode = () => {
    revokeCodeMutation.mutate();
  };

  // Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/professional/patients", {
        name: data.name,
        age: parseInt(data.age),
        height: parseFloat(data.height),
        initialWeight: parseFloat(data.initialWeight),
        targetWeight: parseFloat(data.targetWeight),
        dietLevel: parseInt(data.dietLevel),
        medicalNotes: data.medicalNotes || null,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Paciente Creado Exitosamente",
        description: `${data.patient.name} ha sido registrado con código de acceso: ${data.accessCode}`,
        variant: "default",
        duration: 10000,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/professional/patients"] });
      setShowCreatePatient(false);
      createPatientForm.reset();
      
      // Show access code in a prominent way
      setTimeout(() => {
        toast({
          title: "📋 Código de Acceso Generado",
          description: `NUEVO CÓDIGO: ${data.accessCode} - Válido por 30 días`,
          variant: "default",
          duration: 15000,
        });
      }, 1000);
    },
    onError: (error: any) => {
      console.error("Patient creation error:", error);
      toast({
        title: "❌ Error al Crear Paciente",
        description: error.message || "Error al crear el paciente",
        variant: "destructive",
      });
    },
  });

  // Form for creating patient
  const createPatientForm = useForm({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      name: "",
      age: "",
      height: "",
      initialWeight: "",
      targetWeight: "",
      dietLevel: "",
      medicalNotes: "",
    },
  });

  const onSubmitCreatePatient = (data: any) => {
    createPatientMutation.mutate(data);
  };

  // Format weight data for chart
  const formatWeightDataForChart = (data: any[]) => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    console.log("Professional chart - Raw data:", data.map(r => ({ id: r.id, weight: r.weight, createdAt: r.createdAt })));
    
    const sortedData = data
      .filter(record => record && record.weight && record.createdAt)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    console.log("Professional chart - Sorted data:", sortedData.map(r => ({ id: r.id, weight: r.weight, createdAt: r.createdAt })));
    
    const chartData = sortedData.map((record) => {
      const weight = parseFloat(record.weight);
      
      return {
        date: new Date(record.createdAt).toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        weight: weight,
        fullDate: record.createdAt,
        recordId: record.id
      };
    });
    
    console.log("Professional chart - Final chart data:", chartData);
    console.log("Professional chart - Last point:", chartData[chartData.length - 1]);
    
    return chartData;
  };

  const handleLogout = () => {
    console.log('Logging out professional...');
    localStorage.removeItem('professionalInfo');
    window.location.href = '/';
  };

  // Filter patients based on search term
  const filteredPatients = patients?.filter((patient: any) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.accessCode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!professionalInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Stethoscope className="mx-auto text-blue-600 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verificando acceso...
            </h2>
            <p className="text-gray-600">Cargando información profesional</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Rendering working professional dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel Profesional</h1>
            <p className="text-gray-600">
              Dr. {professionalInfo.name} - {professionalInfo.specialty}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Licencia: {professionalInfo.licenseNumber}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-xs">
              Código: {professionalInfo.accessCode}
            </Badge>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="patients" className="flex items-center space-x-2">
              <Users size={16} />
              <span>Pacientes</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <UserPlus size={16} />
              <span>Crear</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Activity size={16} />
              <span>Análisis</span>
            </TabsTrigger>
          </TabsList>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Users className="text-blue-600" size={24} />
                    <span>Gestión de Pacientes</span>
                  </span>
                  <Badge variant="outline">
                    {filteredPatients.length} pacientes
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre o código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Patients List */}
                {isPatientsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando pacientes...</p>
                  </div>
                ) : filteredPatients.length > 0 ? (
                  <div className="space-y-4">
                    {filteredPatients.map((patient: any) => (
                      <div
                        key={patient.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {patient.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{patient.name}</h3>
                              <p className="text-sm text-gray-500">Edad: {patient.age} años</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                Código: {patient.accessCode}
                              </Badge>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedPatient(patient);
                                  setShowRevokeCodeModal(true);
                                }}
                                className="text-xs px-2 py-1 h-6"
                                title="Anular código de acceso"
                              >
                                <Ban size={12} />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Dieta Nivel {patient.dietLevel}
                            </p>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowPatientDetail(true);
                            }}
                            className="flex items-center space-x-1"
                          >
                            <Eye size={14} />
                            <span>Ver</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pacientes</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm ? 'No se encontraron pacientes con ese criterio de búsqueda.' : 'Aún no tienes pacientes registrados.'}
                    </p>
                    <Button
                      onClick={() => setActiveTab("create")}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Crear Primer Paciente
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Patient Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="text-green-600" size={24} />
                  <span>Crear Nuevo Paciente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <Button
                      onClick={() => setShowCreatePatient(true)}
                      className="bg-green-600 text-white hover:bg-green-700 text-lg px-8 py-3"
                    >
                      <UserPlus className="mr-2" size={20} />
                      Crear Nuevo Paciente
                    </Button>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                      Sistema de Gestión de Pacientes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Generación automática de códigos de acceso</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Asignación de niveles de dieta (1-5)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Configuración de peso objetivo</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Validación de datos médicos</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Códigos válidos por 30 días</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Seguimiento automático de progreso</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="text-purple-600" size={24} />
                  <span>Análisis y Seguimiento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Análisis de {selectedPatient.name}
                      </h3>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedPatient(null)}
                      >
                        Cerrar
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 mb-1">Peso Inicial</h4>
                        <p className="text-2xl font-bold text-green-700">{selectedPatient.initialWeight} kg</p>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors cursor-pointer"
                           onClick={() => {
                             targetWeightForm.setValue("targetWeight", selectedPatient.targetWeight?.toString() || "");
                             setShowTargetWeightModal(true);
                           }}>
                        <h4 className="font-medium text-blue-800 mb-1">Peso Objetivo</h4>
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-bold text-blue-700">{selectedPatient.targetWeight} kg</p>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-xs text-blue-600 mt-1">Click para modificar</p>
                      </div>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-medium text-purple-800 mb-1">Nivel de Dieta</h4>
                        <p className="text-2xl font-bold text-purple-700">{selectedPatient.dietLevel}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Notas Médicas</h4>
                      <p className="text-gray-600">{selectedPatient.medicalNotes || 'No hay notas adicionales'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecciona un Paciente</h3>
                    <p className="text-gray-600 mb-4">
                      Ve a la pestaña "Pacientes" y haz clic en "Ver" para analizar los datos de un paciente específico.
                    </p>
                    <Button
                      onClick={() => setActiveTab("patients")}
                      className="bg-purple-600 text-white hover:bg-purple-700"
                    >
                      Ir a Pacientes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Patient Detail Modal */}
        <Dialog open={showPatientDetail} onOpenChange={setShowPatientDetail}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Users className="text-blue-600" size={24} />
                <span>Detalles del Paciente: {selectedPatient?.name}</span>
              </DialogTitle>
            </DialogHeader>
            
            {selectedPatient && (
              <div className="space-y-6">
                {/* Patient Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-1">Código de Acceso</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-blue-700">{selectedPatient.accessCode}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          Válido hasta: {new Date(selectedPatient.codeExpiry).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowRevokeCodeModal(true)}
                        className="flex items-center space-x-1"
                        title="Anular código de acceso"
                      >
                        <Ban size={14} />
                        <span>Anular</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-1">Peso Inicial</h4>
                    <p className="text-lg font-bold text-green-700">{selectedPatient.initialWeight} kg</p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors cursor-pointer"
                       onClick={() => {
                         targetWeightForm.setValue("targetWeight", selectedPatient.targetWeight?.toString() || "");
                         setShowTargetWeightModal(true);
                       }}>
                    <h4 className="font-medium text-purple-800 mb-1">Peso Objetivo</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-purple-700">{selectedPatient.targetWeight} kg</p>
                      <Edit className="h-4 w-4 text-purple-500" />
                    </div>
                    <p className="text-xs text-purple-600 mt-1">Click para modificar</p>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-800 mb-1">Nivel de Dieta</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-orange-700">{selectedPatient.dietLevel}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          changeDietForm.setValue("dietLevel", selectedPatient.dietLevel?.toString() || "");
                          setShowChangeDiet(true);
                        }}
                        className="flex items-center space-x-1"
                      >
                        <Settings size={14} />
                        <span>Cambiar</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Weight Management Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Weight className="text-green-600" size={20} />
                      <span>Gestión de Peso</span>
                    </h3>
                    <Button
                      onClick={() => setShowAddWeight(true)}
                      className="bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>Registrar Peso</span>
                    </Button>
                  </div>

                  {/* Weight Evolution Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center space-x-2">
                        <TrendingUp className="text-blue-600" size={20} />
                        <span>Evolución del Peso</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {weightHistory && Array.isArray(weightHistory) && weightHistory.length > 0 ? (
                        <div className="space-y-6">
                          {/* Chart */}
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={formatWeightDataForChart(weightHistory)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="date" 
                                  tick={{ fontSize: 12 }}
                                  angle={-45}
                                  textAnchor="end"
                                  height={60}
                                />
                                <YAxis 
                                  domain={['dataMin - 2', 'dataMax + 2']} 
                                  tick={{ fontSize: 12 }}
                                  label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip 
                                  formatter={(value, name) => [
                                    `${Number(value).toFixed(1)} kg`, 
                                    'Peso'
                                  ]}
                                  labelFormatter={(label) => `Fecha: ${label}`}
                                  contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px'
                                  }}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="weight" 
                                  stroke="#10b981" 
                                  strokeWidth={3}
                                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          
                          {/* Recent records list */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Registros Recientes</h4>
                            <div className="space-y-2">
                              {weightHistory
                                .filter(record => record && record.weight && record.createdAt)
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .slice(0, 3)
                                .map((record: any) => (
                                <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                      <Weight className="text-green-600" size={12} />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900 text-sm">{record.weight} kg</p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(record.createdAt).toLocaleDateString('es-ES')} - {new Date(record.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    </div>
                                  </div>
                                  {record.notes && (
                                    <div className="text-xs text-gray-600 max-w-xs">
                                      {record.notes}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">
                            {weightHistory === undefined ? "Cargando registros de peso..." : "No hay registros de peso"}
                          </p>
                          {weightHistory !== undefined && (
                            <Button
                              onClick={() => setShowAddWeight(true)}
                              className="mt-3 bg-green-600 text-white hover:bg-green-700"
                            >
                              Registrar Primer Peso
                            </Button>
                          )}

                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Medical Notes */}
                {selectedPatient.medicalNotes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Notas Médicas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{selectedPatient.medicalNotes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Weight Modal */}
        <Dialog open={showAddWeight} onOpenChange={setShowAddWeight}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Weight className="text-green-600" size={24} />
                <span>Registrar Nuevo Peso</span>
              </DialogTitle>
            </DialogHeader>
            
            <Form {...addWeightForm}>
              <form onSubmit={addWeightForm.handleSubmit(onSubmitWeight)} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-800 mb-2">Paciente: {selectedPatient?.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Código actual:</span>
                      <p className="font-mono text-blue-800">{selectedPatient?.accessCode}</p>
                    </div>
                    <div>
                      <span className="text-blue-600">Fecha/Hora:</span>
                      <p className="font-mono text-blue-800">
                        {new Date().toLocaleDateString('es-ES')} {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={addWeightForm.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="Ej: 75.5"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addWeightForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observaciones sobre el peso..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-yellow-800">
                    <RefreshCw className="text-yellow-600" size={16} />
                    <span className="font-medium">Generación Automática</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Al registrar el peso, se generará automáticamente un nuevo código de acceso que reemplazará al actual.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddWeight(false)}
                    disabled={addWeightMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={addWeightMutation.isPending}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    {addWeightMutation.isPending ? (
                      <>
                        <RefreshCw className="animate-spin mr-2" size={16} />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <Weight className="mr-2" size={16} />
                        Registrar Peso
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Change Diet Level Modal */}
        <Dialog open={showChangeDiet} onOpenChange={setShowChangeDiet}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Settings className="text-orange-600" size={24} />
                <span>Cambiar Nivel de Dieta</span>
              </DialogTitle>
            </DialogHeader>
            
            <Form {...changeDietForm}>
              <form onSubmit={changeDietForm.handleSubmit(onSubmitDietChange)} className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-orange-800 mb-2">Paciente: {selectedPatient?.name}</h4>
                  <div className="text-sm">
                    <span className="text-orange-600">Nivel actual:</span>
                    <p className="font-bold text-orange-800">Nivel {selectedPatient?.dietLevel}</p>
                  </div>
                </div>

                <FormField
                  control={changeDietForm.control}
                  name="dietLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nuevo Nivel de Dieta</FormLabel>
                      <FormControl>
                        <select 
                          {...field} 
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="">Seleccionar nivel...</option>
                          {[1, 2, 3, 4, 5].map((level) => (
                            <option key={level} value={level.toString()}>
                              Nivel {level}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Settings className="text-blue-600" size={16} />
                    <span className="font-medium">Cambio de Plan Nutricional</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    El cambio de nivel de dieta se aplicará inmediatamente y el paciente tendrá acceso a las nuevas recomendaciones nutricionales.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowChangeDiet(false)}
                    disabled={changeDietMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={changeDietMutation.isPending}
                    className="bg-orange-600 text-white hover:bg-orange-700"
                  >
                    {changeDietMutation.isPending ? (
                      <>
                        <RefreshCw className="animate-spin mr-2" size={16} />
                        Cambiando...
                      </>
                    ) : (
                      <>
                        <Settings className="mr-2" size={16} />
                        Cambiar Nivel
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Target Weight Modal */}
        <Dialog open={showTargetWeightModal} onOpenChange={setShowTargetWeightModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="text-blue-600" size={24} />
                <span>Modificar Peso Objetivo</span>
              </DialogTitle>
            </DialogHeader>
            
            <Form {...targetWeightForm}>
              <form onSubmit={targetWeightForm.handleSubmit(onSubmitTargetWeight)} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-800 mb-2">Paciente: {selectedPatient?.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Peso inicial:</span>
                      <p className="font-bold text-blue-800">{selectedPatient?.initialWeight} kg</p>
                    </div>
                    <div>
                      <span className="text-blue-600">Objetivo actual:</span>
                      <p className="font-bold text-blue-800">{selectedPatient?.targetWeight} kg</p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={targetWeightForm.control}
                  name="targetWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nuevo Peso Objetivo (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="Ej: 65.0"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-green-800">
                    <Edit className="text-green-600" size={16} />
                    <span className="font-medium">Actualización de Meta</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    El nuevo peso objetivo se aplicará inmediatamente y estará disponible en el panel del paciente.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTargetWeightModal(false)}
                    disabled={targetWeightMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={targetWeightMutation.isPending}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {targetWeightMutation.isPending ? (
                      <>
                        <RefreshCw className="animate-spin mr-2" size={16} />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2" size={16} />
                        Actualizar Objetivo
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Revoke Code Modal */}
        <Dialog open={showRevokeCodeModal} onOpenChange={setShowRevokeCodeModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Ban className="text-red-600" size={24} />
                <span>Anular Código de Acceso</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-800 mb-2">
                  <AlertTriangle className="text-red-600" size={20} />
                  <h4 className="font-medium">¡Acción Irreversible!</h4>
                </div>
                <p className="text-sm text-red-700 mb-3">
                  Esta acción anulará permanentemente el código de acceso de <strong>{selectedPatient?.name}</strong>.
                </p>
                <div className="bg-red-100 border border-red-300 rounded p-3 mb-3">
                  <p className="text-xs font-medium text-red-800 mb-1">Código a anular:</p>
                  <code className="text-sm font-bold text-red-900">{selectedPatient?.accessCode}</code>
                </div>
                <p className="text-xs text-red-600">
                  ⚠️ El paciente perderá inmediatamente el acceso al sistema y no podrá iniciar sesión hasta que se le asigne un nuevo código.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-yellow-800">
                  <Ban className="text-yellow-600" size={16} />
                  <span className="font-medium">Efectos de la Anulación</span>
                </div>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• El código actual será invalidado inmediatamente</li>
                  <li>• El paciente no podrá acceder al dashboard</li>
                  <li>• Los datos del paciente se conservarán intactos</li>
                  <li>• Podrás generar un nuevo código registrando peso</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRevokeCodeModal(false)}
                  disabled={revokeCodeMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={onRevokeCode}
                  disabled={revokeCodeMutation.isPending}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {revokeCodeMutation.isPending ? (
                    <>
                      <RefreshCw className="animate-spin mr-2" size={16} />
                      Anulando...
                    </>
                  ) : (
                    <>
                      <Ban className="mr-2" size={16} />
                      Anular Código
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Patient Modal */}
        <Dialog open={showCreatePatient} onOpenChange={setShowCreatePatient}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <UserPlus className="text-green-600" size={24} />
                <span>Crear Nuevo Paciente</span>
              </DialogTitle>
            </DialogHeader>
            
            <Form {...createPatientForm}>
              <form onSubmit={createPatientForm.handleSubmit(onSubmitCreatePatient)} className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-800 mb-2">
                    <UserPlus className="text-green-600" size={20} />
                    <h4 className="font-medium">Registro de Nuevo Paciente</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Complete todos los campos para generar automáticamente un código de acceso válido por 30 días.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={createPatientForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: María García López"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createPatientForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edad *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Ej: 35"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={createPatientForm.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estatura (cm) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.1"
                            placeholder="Ej: 165.5"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createPatientForm.control}
                    name="initialWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso Inicial (kg) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.1"
                            placeholder="Ej: 75.5"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createPatientForm.control}
                    name="targetWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso Objetivo (kg) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.1"
                            placeholder="Ej: 65.0"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createPatientForm.control}
                  name="dietLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel de Dieta *</FormLabel>
                      <FormControl>
                        <select 
                          {...field} 
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Seleccionar nivel de dieta...</option>
                          <option value="1">Nivel 1 - Dieta Básica</option>
                          <option value="2">Nivel 2 - Dieta Intermedia</option>
                          <option value="3">Nivel 3 - Dieta Avanzada</option>
                          <option value="4">Nivel 4 - Dieta Restrictiva</option>
                          <option value="5">Nivel 5 - Dieta Muy Restrictiva</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createPatientForm.control}
                  name="medicalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Médicas (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observaciones médicas, alergias, condiciones especiales..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-blue-800 mb-2">
                    <RefreshCw className="text-blue-600" size={16} />
                    <span className="font-medium">Generación Automática de Código</span>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Se generará automáticamente un código de acceso único</li>
                    <li>• El código será válido por 30 días desde la fecha de creación</li>
                    <li>• El paciente podrá usar este código para acceder a su plan nutricional</li>
                    <li>• Podrás renovar o modificar el código en cualquier momento</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreatePatient(false)}
                    disabled={createPatientMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createPatientMutation.isPending}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    {createPatientMutation.isPending ? (
                      <>
                        <RefreshCw className="animate-spin mr-2" size={16} />
                        Creando Paciente...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2" size={16} />
                        Crear Paciente
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}