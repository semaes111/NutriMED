import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Clock, 
  Moon, 
  Sun, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Sunrise, 
  Heart, 
  Bed, 
  RotateCcw, 
  CalendarCheck, 
  Lightbulb, 
  Dumbbell, 
  Calendar 
} from "lucide-react";

export default function IntermittentFasting() {
  const [, setLocation] = useLocation();

  const goBack = () => {
    setLocation("/dashboard");
  };

  const allowedDrinks = [
    "Agua (preferiblemente a temperatura ambiente o tibia)",
    "Infusiones sin azúcar (manzanilla, menta, jengibre)",
    "Té o café negro (sin azúcar ni leche)"
  ];

  const forbiddenDrinks = [
    "Jugos y zumos",
    "Leche o bebidas lácteas",
    "Refrescos y bebidas azucaradas",
    "Cualquier alimento sólido"
  ];

  const breakfastOptions = [
    {
      name: "Opción 1",
      description: "Yogur griego natural sin azúcar con semillas de chía y frutos rojos",
      prepTime: "2 min",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700"
    },
    {
      name: "Opción 2", 
      description: "Tostada de pan integral con aguacate y un huevo duro",
      prepTime: "5 min",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700"
    },
    {
      name: "Opción 3",
      description: "Batido verde con espinaca, leche vegetal, medio plátano y proteína",
      prepTime: "3 min",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700"
    }
  ];

  const benefits = [
    {
      icon: <Bed className="text-blue-600" size={24} />,
      title: "Mejora del Sueño",
      description: "Evitar cenas tardías favorece un descanso más reparador",
      bgColor: "bg-blue-100"
    },
    {
      icon: <RotateCcw className="text-green-600" size={24} />,
      title: "Reparación Celular",
      description: "Permite que el cuerpo enfoque energía en procesos metabólicos",
      bgColor: "bg-green-100"
    },
    {
      icon: <CalendarCheck className="text-purple-600" size={24} />,
      title: "Fácil Adaptación",
      description: "Programa accesible sin grandes cambios en la rutina diaria",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={18} />
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Clock className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ayuno Intermitente</h1>
                <p className="text-sm text-medical-gray">Programa de 12 horas (7 PM - 7 AM)</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Schedule Overview */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Horario del Ayuno</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Moon className="text-white" size={32} />
              </div>
              <h4 className="font-semibold text-gray-900">Inicio del Ayuno</h4>
              <p className="text-2xl font-bold text-purple-600">7:00 PM</p>
              <p className="text-sm text-gray-600">Última comida del día</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sun className="text-white" size={32} />
              </div>
              <h4 className="font-semibold text-gray-900">Fin del Ayuno</h4>
              <p className="text-2xl font-bold text-yellow-600">7:00 AM</p>
              <p className="text-sm text-gray-600">Primera comida del día</p>
            </div>
          </div>
        </div>

        {/* During Fasting */}
        <Card className="shadow-sm border border-gray-200 mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Ban className="text-red-500 mr-3" size={20} />
              Durante el Ayuno (7 PM - 7 AM)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-700 mb-3 flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={16} />
                  Bebidas Permitidas
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {allowedDrinks.map((drink, index) => (
                    <li key={index} className="flex items-center bg-green-50 p-2 rounded-lg">
                      <CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={16} />
                      {drink}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-red-700 mb-3 flex items-center">
                  <XCircle className="text-red-500 mr-2" size={16} />
                  Evitar Completamente
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {forbiddenDrinks.map((drink, index) => (
                    <li key={index} className="flex items-center bg-red-50 p-2 rounded-lg">
                      <XCircle className="text-red-500 mr-2 flex-shrink-0" size={16} />
                      {drink}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-1">Hidratación Importante</h5>
              <p className="text-sm text-blue-700">
                Mantener una buena hidratación es clave para prevenir hambre y mantener la energía durante el ayuno.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Breaking the Fast */}
        <Card className="shadow-sm border border-gray-200 mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sunrise className="text-yellow-500 mr-3" size={20} />
              Romper el Ayuno (7:00 AM)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {breakfastOptions.map((option, index) => (
                <div key={index} className={`${option.bgColor} border ${option.borderColor} rounded-lg p-4`}>
                  <h4 className="font-medium text-gray-900 mb-2">{option.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                  <div className={`flex items-center text-xs ${option.textColor}`}>
                    <Clock className="mr-1" size={12} />
                    Preparación: {option.prepTime}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Recomendación:</strong> Desayunar según indicación dietética de base o elegir una de las opciones mostradas.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="shadow-sm border border-gray-200 mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="text-red-500 mr-3" size={20} />
              Ventajas del Programa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center p-4">
                  <div className={`w-16 h-16 ${benefit.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    {benefit.icon}
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Considerations */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="text-yellow-500 mr-3" size={20} />
              Consideraciones Adicionales
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Dumbbell className="text-orange-600" size={16} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Actividad Física</h4>
                  <p className="text-sm text-gray-600">Si entrenas por la mañana, puedes optar por una comida ligera antes del ejercicio o entrenar en ayunas si te sientes bien.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Clock className="text-blue-600" size={16} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Consistencia</h4>
                  <p className="text-sm text-gray-600">Mantener un horario regular para las comidas y el ayuno ayudará al cuerpo a adaptarse al nuevo patrón.</p>
                </div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="text-orange-600" size={16} />
                  <h4 className="font-medium text-gray-900">Duración del Programa</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Número de días a realizar: <span className="font-medium text-gray-900">A determinar por el Dr. Martínez</span>
                </p>
                <p className="text-xs text-gray-500">Consulte con su médico para ajustes personalizados según su progreso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
