import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  UserPlus, 
  Users, 
  Weight, 
  LineChart, 
  Calendar,
  Stethoscope,
  ClipboardList,
  TrendingUp,
  Activity,
  LogOut,
  Search
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const createPatientSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  age: z.coerce.number().min(1).max(120),
  height: z.coerce.number().min(100).max(250),
  initialWeight: z.coerce.number().min(30).max(300),
  targetWeight: z.coerce.number().min(30).max(300),
  dietLevel: z.coerce.number().min(1).max(5),
  medicalNotes: z.string().optional(),
});

const addWeightSchema = z.object({
  weight: z.coerce.number().min(30).max(300),
  notes: z.string().optional(),
});

const targetWeightSchema = z.object({
  targetWeight: z.coerce.number().min(30).max(300),
});

type CreatePatientForm = z.infer<typeof createPatientSchema>;
type AddWeightForm = z.infer<typeof addWeightSchema>;
type TargetWeightForm = z.infer<typeof targetWeightSchema>;

export default function ProfessionalDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showCreatePatient, setShowCreatePatient] = useState(false);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [activeTab, setActiveTab] = useState("patients");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Check if professional is validated (from localStorage)
  const [professionalInfo, setProfessionalInfo] = useState<any>(null);
  
  useEffect(() => {
    const storedInfo = localStorage.getItem('professionalInfo');
    if (storedInfo) {
      try {
        const parsed = JSON.parse(storedInfo);
        setProfessionalInfo(parsed);
        console.log('Professional info loaded from localStorage:', parsed);
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
  
  const isValidated = !!professionalInfo;

  // Get professional profile - only if no localStorage data
  const { data: professional, isLoading: isProfessionalLoading } = useQuery({
    queryKey: ["/api/professional/profile"],
    retry: false,
    enabled: isValidated && !professionalInfo,
  });

  // Get all patients
  const { data: patients, isLoading: isPatientsLoading } = useQuery({
    queryKey: ["/api/professional/patients"],
    enabled: isValidated,
    retry: false,
  });

  // Filter patients based on search term
  const filteredPatients = patients?.filter((patient: any) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.accessCode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Get diet levels
  const { data: dietLevels } = useQuery({
    queryKey: ["/api/diet-levels"],
    enabled: isValidated,
  });

  // Get weight history for selected patient
  const { data: weightHistory, refetch: refetchWeightHistory } = useQuery({
    queryKey: [`/api/professional/patients/${selectedPatient?.id}/weight-history`],
    enabled: !!selectedPatient,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache the data
  });

  const createPatientForm = useForm<CreatePatientForm>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      name: "",
      age: 30,
      height: 170,
      initialWeight: 70,
      targetWeight: 65,
      dietLevel: 1,
      medicalNotes: "",
    },
  });

  const addWeightForm = useForm<AddWeightForm>({
    resolver: zodResolver(addWeightSchema),
    defaultValues: {
      weight: 70,
      notes: "",
    },
  });

  const targetWeightForm = useForm<TargetWeightForm>({
    resolver: zodResolver(targetWeightSchema),
    defaultValues: {
      targetWeight: 0,
    },
  });

  const createPatientMutation = useMutation({
    mutationFn: async (data: CreatePatientForm) => {
      console.log("Creating patient with data:", data);
      return await apiRequest('/api/professional/patients', {
        method: 'POST',
        data
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Paciente creado exitosamente",
        description: `Código de acceso: ${data.patient.accessCode}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/professional/patients"] });
      setShowCreatePatient(false);
      createPatientForm.reset();
    },
    onError: (error: any) => {
      console.error("Error creating patient:", error);
      toast({
        title: "Error al crear paciente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addWeightMutation = useMutation({
    mutationFn: async (data: AddWeightForm) => {
      const response = await apiRequest("POST", `/api/professional/patients/${selectedPatient.id}/weight`, data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Peso registrado exitosamente",
        description: data.newAccessCode ? 
          `Nuevo código de acceso: ${data.newAccessCode}` : 
          "El registro ha sido añadido al historial del paciente",
      });
      // Force immediate refresh of weight history and patients list
      setTimeout(() => {
        refetchWeightHistory();
        queryClient.invalidateQueries({ 
          queryKey: [`/api/professional/patients/${selectedPatient.id}/weight-history`] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ["/api/professional/patients"] 
        });
      }, 100);
      
      setShowAddWeight(false);
      addWeightForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error al registrar peso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateDietLevelMutation = useMutation({
    mutationFn: async ({ patientId, dietLevel }: { patientId: number, dietLevel: number }) => {
      await apiRequest("PATCH", `/api/professional/patients/${patientId}/diet-level`, { dietLevel });
    },
    onSuccess: () => {
      toast({
        title: "Nivel de dieta actualizado",
        description: "El plan nutricional ha sido modificado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/professional/patients"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar dieta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTargetWeightMutation = useMutation({
    mutationFn: async (data: TargetWeightForm) => {
      await apiRequest("PATCH", `/api/professional/patients/${selectedPatient?.id}/target-weight`, { 
        targetWeight: data.targetWeight 
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Peso objetivo actualizado",
        description: "El objetivo de peso ha sido modificado exitosamente",
      });
      // Update the selected patient data with the actual submitted value
      setSelectedPatient(prev => prev ? {
        ...prev, 
        targetWeight: variables.targetWeight.toString()
      } : null);
      // Reset form and refresh data
      targetWeightForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/professional/patients"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar peso objetivo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatWeightData = (data: any[]) => {
    console.log('Raw weight data received:', data);
    console.log('Data type:', typeof data, 'Is array:', Array.isArray(data));
    
    if (!data || data.length === 0) {
      console.log('No weight data available');
      return [];
    }
    
    // Check if this is weight records or patient data
    const firstItem = data[0];
    if (firstItem && 'name' in firstItem && 'accessCode' in firstItem) {
      console.error('ERROR: Received patient data instead of weight records!');
      return [];
    }
    
    const formatted = data
      .filter(record => record.weight && record.recordedDate) // Filter out invalid records
      .map(record => {
        const date = new Date(record.recordedDate);
        const weight = parseFloat(record.weight);
        
        // Validate date and weight
        if (isNaN(date.getTime()) || isNaN(weight)) {
          console.warn('Invalid weight record:', record);
          return null;
        }
        
        const formattedRecord = {
          date: date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit'
          }) + " (" + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ")",
          weight: weight,
          fullDate: record.recordedDate,
          notes: record.notes
        };
        
        console.log('Formatted record:', formattedRecord);
        return formattedRecord;
      })
      .filter(record => record !== null) // Remove invalid records
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
    
    console.log('Final formatted data for chart:', formatted);
    return formatted;
  };

  // Get current professional data (localStorage or API)
  const currentProfessional = professionalInfo || professional?.professional;

  if (isProfessionalLoading && !professionalInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-green mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel profesional...</p>
        </div>
      </div>
    );
  }

  // Redirect to professional access if not validated
  if (!isValidated || !currentProfessional) {
    window.location.href = '/professional-access';
    return null;
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-lg w-full shadow-sm">
          <CardContent className="p-8 text-center">
            <Stethoscope className="w-16 h-16 text-medical-green mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Panel Profesional
            </h2>
            <p className="text-gray-600 mb-6">
              Ingrese su código de acceso profesional para gestionar pacientes.
            </p>
            <div className="space-y-4">
              <Input
                id="professionalCode"
                placeholder="Código profesional (ej. PROF2025)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      // Here we would validate the code
                      console.log("Validating code:", input.value);
                    }
                  }
                }}
              />
              <Button 
                className="w-full bg-medical-green text-white hover:bg-green-700"
                onClick={() => {
                  const input = document.getElementById('professionalCode') as HTMLInputElement;
                  if (input.value.trim()) {
                    window.location.href = '/professional-access';
                  }
                }}
              >
                Validar Código Profesional
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-medical-green rounded-full flex items-center justify-center mr-4">
                <Stethoscope className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel Profesional</h1>
                <p className="text-medical-gray">{currentProfessional?.name}</p>
              </div>
            </div>
            <Button
              onClick={() => {
                if (confirm("¿Está seguro de que desea cerrar sesión?")) {
                  localStorage.removeItem('professionalInfo');
                  setProfessionalInfo(null);
                  window.location.href = '/';
                }
              }}
              variant="outline"
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              <LogOut size={16} className="mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users size={16} />
              Gestión de Pacientes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <LineChart size={16} />
              Análisis y Seguimiento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-6">
            {/* Search Bar */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar pacientes por nombre o código de acceso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                      <p className="text-2xl font-bold text-gray-900">{patients?.length || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-medical-green" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Consultas Mes</p>
                      <p className="text-2xl font-bold text-gray-900">24</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Dialog open={showCreatePatient} onOpenChange={setShowCreatePatient}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-medical-green text-white hover:bg-green-700">
                        <UserPlus className="mr-2" size={16} />
                        Nuevo Paciente
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Agregar Nuevo Paciente</DialogTitle>
                      </DialogHeader>
                      <Form {...createPatientForm}>
                        <form onSubmit={createPatientForm.handleSubmit((data) => createPatientMutation.mutate(data))} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={createPatientForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nombre Completo</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
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
                                  <FormLabel>Edad</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={createPatientForm.control}
                              name="height"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Altura (cm)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
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
                                  <FormLabel>Peso Inicial (kg)</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.1" {...field} />
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
                                  <FormLabel>Peso Objetivo (kg)</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.1" {...field} />
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
                                <FormLabel>Nivel de Dieta</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar nivel de dieta" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5].map((level) => (
                                      <SelectItem key={level} value={level.toString()}>
                                        Nivel {level}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createPatientForm.control}
                            name="medicalNotes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notas Médicas</FormLabel>
                                <FormControl>
                                  <Textarea {...field} rows={3} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-2 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowCreatePatient(false)}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="submit"
                              disabled={createPatientMutation.isPending}
                              className="flex-1 bg-medical-green text-white hover:bg-green-700"
                            >
                              {createPatientMutation.isPending ? "Creando..." : "Crear Paciente"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>

            {/* Patient List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList size={20} />
                  Lista de Pacientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isPatientsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-green mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando pacientes...</p>
                  </div>
                ) : patients?.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay pacientes registrados</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPatients.length === 0 && searchTerm ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No se encontraron pacientes que coincidan con "{searchTerm}"</p>
                      </div>
                    ) : (
                      filteredPatients.map((patient: any) => (
                        <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <span>Edad: {patient.age || 'N/A'} años</span>
                              <span>Nivel Dieta: {patient.dietLevel}</span>
                              <span>Código: {patient.accessCode}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={patient.isActive ? "default" : "secondary"}>
                              {patient.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedPatient(patient);
                                setActiveTab("analytics");
                              }}
                              className="bg-medical-green text-white hover:bg-green-700"
                            >
                              Ver Detalles
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {selectedPatient ? (
              <>
                {/* Patient Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Activity size={20} />
                        Seguimiento: {selectedPatient.name}
                      </span>
                      <Dialog open={showAddWeight} onOpenChange={setShowAddWeight}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-medical-green text-white hover:bg-green-700">
                            <Weight className="mr-2" size={16} />
                            Registrar Peso
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Registrar Peso - {selectedPatient.name}</DialogTitle>
                          </DialogHeader>
                          <Form {...addWeightForm}>
                            <form onSubmit={addWeightForm.handleSubmit((data) => addWeightMutation.mutate(data))} className="space-y-4">
                              <FormField
                                control={addWeightForm.control}
                                name="weight"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Peso (kg)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.1" {...field} />
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
                                      <Textarea {...field} rows={3} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowAddWeight(false)}
                                  className="flex-1"
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  type="submit"
                                  disabled={addWeightMutation.isPending}
                                  className="flex-1 bg-medical-green text-white hover:bg-green-700"
                                >
                                  {addWeightMutation.isPending ? "Guardando..." : "Registrar"}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Peso Inicial</p>
                        <p className="text-xl font-bold text-gray-900">{selectedPatient.initialWeight || 'N/A'} kg</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Peso Objetivo</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="text-xl font-bold text-medical-green hover:bg-green-50 p-2 h-auto"
                            >
                              {selectedPatient.targetWeight || 'N/A'} kg
                              <span className="ml-1 text-xs opacity-70">✏️</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Modificar Peso Objetivo - {selectedPatient.name}</DialogTitle>
                            </DialogHeader>
                            <Form {...targetWeightForm}>
                              <form onSubmit={targetWeightForm.handleSubmit((data) => updateTargetWeightMutation.mutate(data))} className="space-y-4">
                                <FormField
                                  control={targetWeightForm.control}
                                  name="targetWeight"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Nuevo Peso Objetivo (kg)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          type="number" 
                                          step="0.1" 
                                          placeholder={`Actual: ${selectedPatient.targetWeight || 'No definido'} kg`}
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Ingrese el nuevo peso objetivo para el paciente
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex justify-end gap-2">
                                  <DialogTrigger asChild>
                                    <Button type="button" variant="outline">Cancelar</Button>
                                  </DialogTrigger>
                                  <Button 
                                    type="submit" 
                                    className="bg-medical-green text-white hover:bg-green-700"
                                    disabled={updateTargetWeightMutation.isPending}
                                  >
                                    {updateTargetWeightMutation.isPending ? 'Guardando...' : 'Guardar'}
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Nivel de Dieta</p>
                        <Select 
                          value={selectedPatient.dietLevel?.toString()} 
                          onValueChange={(value) => {
                            const newLevel = parseInt(value);
                            updateDietLevelMutation.mutate({ 
                              patientId: selectedPatient.id, 
                              dietLevel: newLevel 
                            });
                          }}
                        >
                          <SelectTrigger className="w-full bg-white border-2 border-blue-200">
                            <SelectValue>
                              <span className="text-xl font-bold text-blue-600">
                                Nivel {selectedPatient.dietLevel}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((level) => (
                              <SelectItem key={level} value={level.toString()}>
                                <div className="flex flex-col">
                                  <span className="font-semibold">Nivel {level}</span>
                                  <span className="text-xs text-gray-500">
                                    {level === 1 && "Dieta básica"}
                                    {level === 2 && "Dieta intermedia"}
                                    {level === 3 && "Dieta avanzada"}
                                    {level === 4 && "Dieta especializada"}
                                    {level === 5 && "Dieta intensiva"}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Registros</p>
                        <p className="text-xl font-bold text-gray-900">{weightHistory?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Weight Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp size={20} />
                      Evolución del Peso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {weightHistory && weightHistory.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={formatWeightData(weightHistory)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
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
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Weight className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No hay registros de peso disponibles</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecciona un Paciente</h3>
                  <p className="text-gray-600">
                    Ve a la pestaña "Gestión de Pacientes" y haz clic en "Ver Detalles" de cualquier paciente para ver sus análisis y seguimiento de peso.
                  </p>
                  <Button
                    onClick={() => setActiveTab("patients")}
                    className="mt-4 bg-medical-green text-white hover:bg-green-700"
                  >
                    Ir a Gestión de Pacientes
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}