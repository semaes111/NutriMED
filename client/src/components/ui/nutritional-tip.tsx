import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  Heart, 
  Target, 
  Clock, 
  TrendingUp, 
  Sparkles,
  RefreshCw,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NutritionalTip {
  id: string;
  title: string;
  content: string;
  category: 'motivation' | 'nutrition' | 'timing' | 'progress' | 'hydration' | 'exercise';
  dietLevel: number[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any';
  icon: React.ReactNode;
  color: string;
}

interface NutritionalTipProps {
  dietLevel: number;
  currentMeal?: string;
  weightProgress?: number;
  className?: string;
  onDismiss?: () => void;
}

const nutritionalTips: NutritionalTip[] = [
  {
    id: "hydration-morning",
    title: "Hidratación Matutina",
    content: "Comienza tu día con un vaso de agua tibia con limón. Ayuda a activar tu metabolismo y aporta vitamina C.",
    category: "hydration",
    dietLevel: [1, 2, 3, 4, 5],
    timeOfDay: "morning",
    icon: <Lightbulb className="w-5 h-5" />,
    color: "text-blue-600 bg-blue-50 border-blue-200"
  },
  {
    id: "protein-timing",
    title: "Proteína en el Desayuno",
    content: "Incluir proteína en tu desayuno te ayudará a mantener la saciedad hasta la siguiente comida.",
    category: "nutrition",
    dietLevel: [2, 3, 4, 5],
    timeOfDay: "morning",
    icon: <Target className="w-5 h-5" />,
    color: "text-green-600 bg-green-50 border-green-200"
  },
  {
    id: "mindful-eating",
    title: "Alimentación Consciente",
    content: "Come sin distracciones. Mastica lentamente y disfruta cada bocado para mejor digestión.",
    category: "motivation",
    dietLevel: [1, 2, 3, 4, 5],
    timeOfDay: "any",
    icon: <Heart className="w-5 h-5" />,
    color: "text-pink-600 bg-pink-50 border-pink-200"
  },
  {
    id: "afternoon-energy",
    title: "Energía Vespertina",
    content: "Si sientes fatiga por la tarde, opta por una merienda rica en fibra y proteína en lugar de azúcares.",
    category: "timing",
    dietLevel: [1, 2, 3, 4, 5],
    timeOfDay: "afternoon",
    icon: <Clock className="w-5 h-5" />,
    color: "text-orange-600 bg-orange-50 border-orange-200"
  },
  {
    id: "progress-celebration",
    title: "Celebra tus Logros",
    content: "¡Excelente progreso! Cada pequeño cambio cuenta hacia tu objetivo de salud.",
    category: "progress",
    dietLevel: [1, 2, 3, 4, 5],
    timeOfDay: "any",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "text-purple-600 bg-purple-50 border-purple-200"
  },
  {
    id: "omega3-importance",
    title: "Omega-3 Esencial",
    content: "Incluye pescados grasos como salmón o sardinas 2-3 veces por semana para obtener omega-3.",
    category: "nutrition",
    dietLevel: [3, 4, 5],
    timeOfDay: "any",
    icon: <Sparkles className="w-5 h-5" />,
    color: "text-teal-600 bg-teal-50 border-teal-200"
  },
  {
    id: "movement-reminder",
    title: "Movimiento Post-Comida",
    content: "Una caminata ligera de 10 minutos después de comer ayuda a la digestión y control glucémico.",
    category: "exercise",
    dietLevel: [1, 2, 3, 4, 5],
    timeOfDay: "any",
    icon: <Target className="w-5 h-5" />,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200"
  },
  {
    id: "evening-prep",
    title: "Preparación Nocturna",
    content: "Prepara tu desayuno la noche anterior. Te ayudará a mantener consistencia en tu plan nutricional.",
    category: "timing",
    dietLevel: [1, 2, 3, 4, 5],
    timeOfDay: "evening",
    icon: <Clock className="w-5 h-5" />,
    color: "text-violet-600 bg-violet-50 border-violet-200"
  }
];

export function NutritionalTip({ 
  dietLevel, 
  currentMeal, 
  weightProgress, 
  className,
  onDismiss 
}: NutritionalTipProps) {
  const [currentTip, setCurrentTip] = useState<NutritionalTip | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const getContextualTips = () => {
    const timeOfDay = getTimeOfDay();
    
    return nutritionalTips.filter(tip => {
      // Filter by diet level
      if (!tip.dietLevel.includes(dietLevel)) return false;
      
      // Filter by time of day if specified
      if (tip.timeOfDay && tip.timeOfDay !== 'any' && tip.timeOfDay !== timeOfDay) return false;
      
      // Show progress tip if weight progress is positive
      if (tip.category === 'progress' && (!weightProgress || weightProgress <= 0)) return false;
      
      return true;
    });
  };

  const selectRandomTip = () => {
    const availableTips = getContextualTips();
    if (availableTips.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * availableTips.length);
    const newTip = availableTips[randomIndex];
    
    if (newTip.id !== currentTip?.id) {
      setCurrentTip(newTip);
    }
  };

  const handleRefresh = () => {
    setIsAnimating(true);
    setTimeout(() => {
      selectRandomTip();
      setIsAnimating(false);
    }, 300);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  useEffect(() => {
    selectRandomTip();
    setIsVisible(true);
  }, [dietLevel]);

  if (!currentTip) return null;

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-500 ease-out transform",
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95",
        isAnimating && "scale-95 opacity-75",
        currentTip.color,
        className
      )}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/20 animate-pulse" />
        <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full bg-white/30 animate-bounce" 
             style={{ animationDelay: '1s', animationDuration: '3s' }} />
        <div className="absolute top-1/2 left-1/4 w-6 h-6 rounded-full bg-white/25 animate-ping" 
             style={{ animationDelay: '2s', animationDuration: '4s' }} />
      </div>

      <CardContent className="p-4 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-white/30 backdrop-blur-sm">
              {currentTip.icon}
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">
                {currentTip.title}
              </h3>
              <Badge 
                variant="secondary" 
                className="text-xs mt-1 bg-white/40 backdrop-blur-sm"
              >
                {currentTip.category === 'motivation' && 'Motivación'}
                {currentTip.category === 'nutrition' && 'Nutrición'}
                {currentTip.category === 'timing' && 'Horarios'}
                {currentTip.category === 'progress' && 'Progreso'}
                {currentTip.category === 'hydration' && 'Hidratación'}
                {currentTip.category === 'exercise' && 'Ejercicio'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="p-1 h-auto w-auto text-current hover:bg-white/20"
              disabled={isAnimating}
            >
              <RefreshCw className={cn("w-4 h-4", isAnimating && "animate-spin")} />
            </Button>
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="p-1 h-auto w-auto text-current hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <p className="text-sm leading-relaxed">
          {currentTip.content}
        </p>
        
        {/* Progress indicator if weight progress is shown */}
        {currentTip.category === 'progress' && weightProgress && (
          <div className="mt-3 flex items-center space-x-2">
            <div className="flex-1 bg-white/30 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-white/60 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(Math.abs(weightProgress) * 10, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium">
              {weightProgress > 0 ? `+${weightProgress.toFixed(1)}kg` : `${weightProgress.toFixed(1)}kg`}
            </span>
          </div>
        )}
      </CardContent>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-shimmer" 
           style={{ animation: 'shimmer 3s infinite' }} />
    </Card>
  );
}

// CSS for shimmer effect (add to global CSS)
const shimmerKeyframes = `
@keyframes shimmer {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(200%) skewX(-12deg); }
}
`;

// Inject shimmer animation into document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
}