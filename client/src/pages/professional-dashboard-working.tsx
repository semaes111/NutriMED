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
  RefreshCw
} from "lucide-react";

const addWeightSchema = z.object({
  weight: z.string().min(1, "El peso es requerido"),
  notes: z.string().optional(),
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
    queryKey: ["/api/patient/weight-history", selectedPatient?.id],
    enabled: !!selectedPatient?.id,
    retry: false,
  });

  // Add weight mutation
  const addWeightMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(`/api/professional/patients/${selectedPatient.id}/weight`, {
        method: "POST",
        body: JSON.stringify({
          weight: data.weight,
          notes: data.notes,
          recordedDate: new Date().toISOString(),
        }),
      });
      return response;
    },
    onSuccess: (data) => {
      console.log("Weight added successfully:", data);
      toast({
        title: "Peso registrado",
        description: `Peso registrado exitosamente. Nuevo código: ${data.newAccessCode}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/professional/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patient/weight-history", selectedPatient.id] });
      refetchWeight();
      setShowAddWeight(false);
      addWeightForm.reset();
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
                            <Badge variant="outline" className="text-xs">
                              Código: {patient.accessCode}
                            </Badge>
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <UserPlus className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Funcionalidad de Creación
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Aquí podrás crear nuevos pacientes con códigos de acceso automáticos,
                    asignar niveles de dieta y configurar objetivos de peso.
                  </p>
                  <div className="text-sm text-blue-700">
                    <p>• Generación automática de códigos de acceso</p>
                    <p>• Asignación de niveles de dieta (1-5)</p>
                    <p>• Configuración de peso objetivo</p>
                    <p>• Validación de datos médicos</p>
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
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-1">Peso Objetivo</h4>
                        <p className="text-2xl font-bold text-blue-700">{selectedPatient.targetWeight} kg</p>
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
                    <p className="text-lg font-bold text-blue-700">{selectedPatient.accessCode}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Válido hasta: {new Date(selectedPatient.codeExpiry).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-1">Peso Inicial</h4>
                    <p className="text-lg font-bold text-green-700">{selectedPatient.initialWeight} kg</p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-1">Peso Objetivo</h4>
                    <p className="text-lg font-bold text-purple-700">{selectedPatient.targetWeight} kg</p>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-800 mb-1">Nivel de Dieta</h4>
                    <p className="text-lg font-bold text-orange-700">{selectedPatient.dietLevel}</p>
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

                  {/* Weight History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Historial de Peso</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {weightHistory && weightHistory.length > 0 ? (
                        <div className="space-y-3">
                          {weightHistory.slice(0, 5).map((record: any, index: number) => (
                            <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <Weight className="text-green-600" size={14} />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{record.weight} kg</p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(record.recordedDate).toLocaleDateString('es-ES')} - {new Date(record.recordedDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                              {record.notes && (
                                <div className="text-sm text-gray-600 max-w-xs">
                                  {record.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Weight className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">No hay registros de peso</p>
                          <Button
                            onClick={() => setShowAddWeight(true)}
                            className="mt-3 bg-green-600 text-white hover:bg-green-700"
                          >
                            Registrar Primer Peso
                          </Button>
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
      </div>
    </div>
  );
}