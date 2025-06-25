import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, LogOut, Users } from "lucide-react";

export default function ProfessionalDashboardSimple() {
  const [, setLocation] = useLocation();
  const [professionalInfo, setProfessionalInfo] = useState<any>(null);

  useEffect(() => {
    console.log('Simple Professional Dashboard useEffect triggered');
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

  const handleLogout = () => {
    localStorage.removeItem('professionalInfo');
    setLocation('/professional-access');
  };

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
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="text-blue-600" size={24} />
                <span>Bienvenido al Panel Profesional</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">
                    ✅ Acceso Exitoso
                  </h3>
                  <p className="text-green-700">
                    Ha ingresado correctamente al panel profesional con el código {professionalInfo.accessCode}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-1">Profesional</h4>
                    <p className="text-blue-700">{professionalInfo.name}</p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-1">Especialidad</h4>
                    <p className="text-purple-700">{professionalInfo.specialty}</p>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-800 mb-1">Licencia</h4>
                    <p className="text-orange-700">{professionalInfo.licenseNumber}</p>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-1">Estado</h4>
                    <p className="text-gray-700">Activo</p>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Funcionalidades Disponibles:</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Gestión de pacientes</li>
                    <li>• Asignación de códigos de acceso</li>
                    <li>• Control de niveles de dieta</li>
                    <li>• Seguimiento de peso</li>
                    <li>• Análisis de progreso</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}