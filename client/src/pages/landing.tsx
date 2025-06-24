import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRound, LogIn, Stethoscope, Heart, Shield, UserCheck, Settings } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-blue-50">
      <Card className="max-w-2xl w-full shadow-xl">
        <CardContent className="p-12">
          {/* Medical Professional Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-medical-green rounded-full flex items-center justify-center mx-auto mb-6">
              <Stethoscope className="text-white text-4xl" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Consulta Dietética Digital</h1>
            <p className="text-medical-gray text-lg mb-2">Dr. Sergio Martínez Escobar</p>
            <p className="text-sm text-medical-gray">Facultativo Especialista Medicina Intensiva</p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Planes Personalizados</h3>
              <p className="text-sm text-gray-600">Dietas adaptadas a tu nivel nutricional específico</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="text-green-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Acceso Seguro</h3>
              <p className="text-sm text-gray-600">Autenticación segura con Replit para proteger tu información</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserRound className="text-purple-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Seguimiento Médico</h3>
              <p className="text-sm text-gray-600">Supervisión profesional continua de tu progreso</p>
            </div>
          </div>

          {/* Access Section */}
          <div className="text-center space-y-4">
            <p className="text-gray-600 mb-6">
              Acceda a su plan dietético personalizado
            </p>
            
            <Button
              onClick={() => setLocation('/login')}
              size="lg"
              className="w-full bg-medical-green text-white py-4 px-8 rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all duration-200"
            >
              <UserCheck className="mr-3" size={20} />
              Acceso del Paciente
            </Button>
            
            <div className="text-center text-sm text-gray-500">
              <p>¿Es usted un profesional médico?</p>
              <Button 
                onClick={() => setLocation('/professional-access')}
                variant="outline"
                className="mt-2 border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white"
              >
                <Settings className="mr-2" size={16} />
                Panel Profesional
              </Button>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={handleLogin}
                variant="outline"
                className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 text-sm py-2"
              >
                <LogIn className="mr-2" size={16} />
                Iniciar Sesión con Replit
              </Button>
            </div>
          </div>

          {/* Professional Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>Equipo Médico Profesional</p>
              <p>Dra. Sara Hernández Calpena - Col. 04/4101</p>
              <p>Gda. María Nazaret Aguilera Sánchez - Col. 2341</p>
              <p>Dr. Sergio Martínez Escobar - Col. 04/1809464</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}