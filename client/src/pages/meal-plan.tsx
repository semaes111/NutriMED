import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FoodItem } from "@/components/ui/food-item";
import { RecipeCard } from "@/components/ui/recipe-card";
import { useToast } from "@/hooks/use-toast";
import { PatientInfo } from "@/lib/types";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  ArrowLeft, 
  Sun, 
  Cookie, 
  Utensils, 
  Droplets, 
  Wheat, 
  Drumstick, 
  Apple, 
  Sprout 
} from "lucide-react";

export default function MealPlan() {
  const { category } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [patientSession, setPatientSession] = useState<any>(null);

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

  const { data: patient, isLoading: patientLoading, error } = useQuery<PatientInfo>({
    queryKey: ["/api/patient/current"],
    retry: false,
    enabled: !patientSession,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error) && !patientSession) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast, patientSession]);

  // Get current patient data - either from API or from session
  const currentPatient = patientSession?.patient || patient?.patient;

  if (patientLoading && !patientSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-green mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando plan de comidas...</p>
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
              Acceso Requerido
            </h2>
            <p className="text-gray-600 mb-6">
              Necesitas introducir tu código de acceso para ver tus planes de comida.
            </p>
            <Button
              onClick={() => setLocation("/")}
              className="bg-medical-green text-white hover:bg-green-700"
            >
              Introducir Código
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const goBack = () => {
    setLocation("/dashboard");
  };

  const getMealConfig = (category: string) => {
    switch (category) {
      case 'breakfast':
        return {
          icon: <Sun className="text-yellow-600" size={20} />,
          title: 'Plan de Desayuno + Media Mañana',
          subtitle: 'Completo con índice glucémico bajo',
          bgColor: 'bg-yellow-100'
        };
      case 'snack':
        return {
          icon: <Cookie className="text-green-600" size={20} />,
          title: 'Plan de Merienda',
          subtitle: 'Continental con índice glucémico bajo',
          bgColor: 'bg-green-100'
        };
      case 'lunch':
        return {
          icon: <Utensils className="text-blue-600" size={20} />,
          title: 'Plan de Almuerzo/Cena',
          subtitle: 'Antiinflamatoria con índice glucémico bajo',
          bgColor: 'bg-blue-100'
        };
      default:
        return {
          icon: <Utensils className="text-gray-600" size={20} />,
          title: 'Plan de Comidas',
          subtitle: 'Plan nutricional',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const config = getMealConfig(category || '');

  // Static data based on the documents - in a real app this would come from the API
  const breakfastData = {
    beverages: [
      "Leche entera/semidesnatada/desnatada",
      "Leche sin lactosa",
      "Bebida vegetal (soja, almendras, quinoa, avena)",
      "Café, tés, infusiones",
      "Zumos (pomelo, limón, tomate)"
    ],
    allowedBreads: [
      "Integral 100%",
      "Trigo sarraceno",
      "Espelta",
      "Centeno integral",
      "Chía y linaza"
    ],
    option1: {
      proteins: [
        "Huevos revueltos, cocidos, plancha",
        "Yogur natural/griego/cabra/soja/skyr/kéfir (sin azúcar)"
      ],
      fruits: [
        "Manzana (x1)",
        "Kiwi (x1)",
        "Naranja (x1)",
        "Pera (x1)",
        "Arándanos, frambuesas, moras (1/2 taza)",
        "Piña (x2)"
      ],
      cereals: [
        "Porridge de avena integral (1/2 taza)",
        "Pudding de chía",
        "Cereales integrales con yogur"
      ]
    },
    option2: {
      basics: [
        "Yogur natural sin azúcar",
        "Huevos preparados",
        "Frutas permitidas"
      ]
    }
  };

  const snackData = {
    allowedComplements: [
      "Atún, jamón, pavo, pollo",
      "Calamares (pueden ser en salsa americana)",
      "Queso, sobrasada, lomo embuchado",
      "Tomate, AOVE, mantequilla light, aguacate"
    ],
    option1: [
      "Frutos secos: almendras, nueces, avellanas, pistachos (1/2 taza)",
      "Fruta natural: manzana, cerezas, kiwi, naranja, pera",
      "Yogur natural/griego/cabra/soja/sky/kéfir (sin azúcar)",
      "Smoothie: agua/leche + fruta + vegetales + semillas",
      "Encurtidos: pepinillos, aceitunas, zanahorias (1 taza)",
      "Huevos (cocido, tortilla, plancha, revueltos)"
    ],
    option2: [
      "Frutos secos: almendras, nueces, nueces de macadamia",
      "Fruta natural: manzana, kiwi, nectarina, naranja, pera",
      "Yogur natural/griego/cabra/soja/sky/kéfir (sin azúcar)",
      "Smoothie con ingredientes permitidos",
      "Encurtidos permitidos (1 taza)"
    ]
  };

  const lunchData = {
    beverages: [
      "Agua (con o sin gas)",
      "Agua infusionada (limón, pepino, menta, albahaca)",
      "Té verde (sin azúcar)",
      "Infusiones (jengibre, cúrcuma, manzanilla)"
    ],
    salads: [
      "Ensalada mixta: kale, espinacas, rúcula, canónigos",
      "Ensalada caprese: tomate, mozzarella, albahaca",
      "Ensalada antiox: pepino, pimiento, espinacas"
    ],
    proteins: [
      "Pescados: merluza, bacalao, salmón, trucha, caballa",
      "Carnes magras: cerdo (lomo), pollo, pavo, ternera",
      "Huevos: plancha, tortilla, revueltos, cocidos"
    ],
    vegetables: [
      "Espinacas, brócoli, col rizada, pimientos rojos",
      "Alcachofas, coles de Bruselas, acelgas, berenjena",
      "Tomate, zanahoria, puerros, champiñones"
    ]
  };

  const chiaRecipe = {
    id: 1,
    name: "Pudding de Chía",
    description: "Receta especial rica en omega-3 y fibra",
    ingredients: [
      "Leche/bebida vegetal/yogur natural",
      "1 cucharada sopera de chía",
      "Fruta permitida (opcional)"
    ],
    instructions: [
      "Mezclar todos los ingredientes en un recipiente",
      "Dejar reposar toda la noche en el refrigerador",
      "Servir frío por la mañana con fruta si se desea"
    ],
    preparationTime: 5,
    category: "breakfast"
  };

  const renderBreakfastContent = () => (
    <>
      {/* Beverages Section */}
      <Card className="shadow-sm border border-gray-200 mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Droplets className="text-blue-500 mr-3" size={20} />
            Bebidas Permitidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Lácteas y Vegetales</h4>
              <div className="space-y-1">
                {breakfastData.beverages.slice(0, 3).map((beverage, index) => (
                  <FoodItem key={index} name={beverage} isAllowed={true} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Otras Bebidas</h4>
              <div className="space-y-1">
                {breakfastData.beverages.slice(3).map((beverage, index) => (
                  <FoodItem key={index} name={beverage} isAllowed={true} />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wheat Section */}
      <Card className="shadow-sm border border-gray-200 mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Wheat className="text-amber-500 mr-3" size={20} />
            Pan Permitido
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {breakfastData.allowedBreads.map((bread, index) => (
              <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                <Wheat className="text-amber-600 mx-auto mb-2" size={18} />
                <p className="text-sm font-medium text-gray-900">{bread}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meal Options */}
      <div className="space-y-6">
        {/* Option 1 */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Opción 1 - Completa</h3>
              <Badge className="bg-green-100 text-green-800">Recomendada</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Proteins */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 flex items-center">
                  <Drumstick className="text-red-500 mr-2" size={16} />
                  Proteínas
                </h4>
                <div className="space-y-2">
                  {breakfastData.option1.proteins.map((protein, index) => (
                    <FoodItem key={index} name={protein} isAllowed={true} />
                  ))}
                </div>
              </div>

              {/* Fruits */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 flex items-center">
                  <Apple className="text-red-500 mr-2" size={16} />
                  Frutas
                </h4>
                <div className="space-y-2">
                  {breakfastData.option1.fruits.map((fruit, index) => (
                    <FoodItem key={index} name={fruit} isAllowed={true} />
                  ))}
                </div>
              </div>

              {/* Cereals */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 flex items-center">
                  <Sprout className="text-green-500 mr-2" size={16} />
                  Cereales y Otros
                </h4>
                <div className="space-y-2">
                  {breakfastData.option1.cereals.map((cereal, index) => (
                    <FoodItem key={index} name={cereal} isAllowed={true} />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Option 2 */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Opción 2 - Simplificada</h3>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">Alternativa</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Componentes Básicos</h4>
                <div className="space-y-2">
                  {breakfastData.option2.basics.map((basic, index) => (
                    <FoodItem key={index} name={basic} isAllowed={true} />
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Observaciones</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    Opción más ligera para días de menor actividad
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recipe Section */}
      <div className="mt-6">
        <RecipeCard recipe={chiaRecipe} />
      </div>
    </>
  );

  const renderSnackContent = () => (
    <>
      {/* Allowed Complements */}
      <Card className="shadow-sm border border-gray-200 mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Complementos Permitidos
          </h3>
          <div className="space-y-2">
            {snackData.allowedComplements.map((complement, index) => (
              <FoodItem key={index} name={complement} isAllowed={true} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <div className="space-y-6">
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Opción 1 - Completa</h3>
            <div className="space-y-2">
              {snackData.option1.map((item, index) => (
                <FoodItem key={index} name={item} isAllowed={true} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Opción 2 - Simplificada</h3>
            <div className="space-y-2">
              {snackData.option2.map((item, index) => (
                <FoodItem key={index} name={item} isAllowed={true} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderLunchContent = () => (
    <>
      {/* Beverages */}
      <Card className="shadow-sm border border-gray-200 mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Droplets className="text-blue-500 mr-3" size={20} />
            Bebidas Permitidas
          </h3>
          <div className="space-y-2">
            {lunchData.beverages.map((beverage, index) => (
              <FoodItem key={index} name={beverage} isAllowed={true} />
            ))}
          </div>
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Prohibido:</strong> Alcohol (excepto cerveza ámbar 0,00), Pan
            </p>
          </div>
        </CardContent>
      </Card>

      {/* First Course - Salads */}
      <Card className="shadow-sm border border-gray-200 mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Primer Plato - Ensaladas Antioxidantes
          </h3>
          <div className="space-y-2">
            {lunchData.salads.map((salad, index) => (
              <FoodItem key={index} name={salad} isAllowed={true} />
            ))}
          </div>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Aliño recomendado:</strong> AOVE, vinagre de manzana, zumo de limón, especias
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Second Course - Proteins */}
      <Card className="shadow-sm border border-gray-200 mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Segundo Plato - Proteínas (3-4 veces/semana)
          </h3>
          <div className="space-y-2">
            {lunchData.proteins.map((protein, index) => (
              <FoodItem key={index} name={protein} isAllowed={true} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vegetables */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Verduras de Acompañamiento
          </h3>
          <div className="space-y-2">
            {lunchData.vegetables.map((vegetable, index) => (
              <FoodItem key={index} name={vegetable} isAllowed={true} />
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Preparación:</strong> Asadas, cocidas, salteadas con AOVE, al horno, al vapor, airfryer
            </p>
            <p className="text-sm text-red-800 mt-1">
              <strong>Evitar:</strong> Fritos y rebozados
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderContent = () => {
    switch (category) {
      case 'breakfast':
        return renderBreakfastContent();
      case 'snack':
        return renderSnackContent();
      case 'lunch':
        return renderLunchContent();
      default:
        return <div>Contenido no disponible</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Navigation */}
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
              <div className={`w-12 h-12 ${config.bgColor} rounded-full flex items-center justify-center`}>
                {config.icon}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{config.title}</h1>
                <p className="text-sm text-medical-gray">{config.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
