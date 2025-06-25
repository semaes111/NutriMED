import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause,
  Lightbulb,
  Heart,
  Target,
  Clock,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TipCarouselItem {
  id: string;
  title: string;
  content: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  animation: 'bounce' | 'pulse' | 'spin' | 'slide';
}

interface AnimatedTipCarouselProps {
  tips: TipCarouselItem[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

const defaultTips: TipCarouselItem[] = [
  {
    id: "tip1",
    title: "💧 Hidratación Inteligente",
    content: "🥤 Bebe agua antes de sentir sed. Tu cuerpo necesita hidratación constante para funcionar óptimamente.",
    category: "Hidratación",
    icon: <Lightbulb className="w-5 h-5" />,
    color: "from-blue-400 to-blue-600",
    animation: "bounce"
  },
  {
    id: "tip2", 
    title: "🍽️ Masticación Consciente",
    content: "🔄 Mastica cada bocado al menos 20 veces. Esto mejora la digestión y te ayuda a sentirte satisfecho.",
    category: "Digestión",
    icon: <Heart className="w-5 h-5" />,
    color: "from-green-400 to-green-600",
    animation: "pulse"
  },
  {
    id: "tip3",
    title: "⏰ Timing Perfecto",
    content: "📅 Los horarios regulares de comida ayudan a tu metabolismo a funcionar de manera más eficiente.",
    category: "Horarios",
    icon: <Clock className="w-5 h-5" />,
    color: "from-purple-400 to-purple-600", 
    animation: "spin"
  },
  {
    id: "tip4",
    title: "📈 Progreso Gradual",
    content: "✨ Cada pequeño cambio cuenta. La constancia es más importante que la perfección.",
    category: "Motivación",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "from-orange-400 to-orange-600",
    animation: "slide"
  }
];

export function AnimatedTipCarousel({ 
  tips = defaultTips, 
  autoPlay = true, 
  interval = 5000,
  className 
}: AnimatedTipCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setDirection('right');
      setCurrentIndex((prev) => (prev + 1) % tips.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, interval, tips.length]);

  const goToPrevious = () => {
    setDirection('left');
    setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const goToNext = () => {
    setDirection('right');
    setCurrentIndex((prev) => (prev + 1) % tips.length);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  const currentTip = tips[currentIndex];

  const getAnimationClass = (animation: string) => {
    switch (animation) {
      case 'bounce':
        return 'animate-bounce';
      case 'pulse':
        return 'animate-pulse';
      case 'spin':
        return 'animate-spin';
      case 'slide':
        return 'animate-pulse'; // fallback
      default:
        return '';
    }
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Background gradient animation */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r opacity-10 transition-all duration-1000",
        currentTip.color
      )} />
      
      {/* Floating animation elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 right-4 w-3 h-3 bg-white/30 rounded-full animate-ping" />
        <div className="absolute bottom-6 left-6 w-2 h-2 bg-white/40 rounded-full animate-bounce" 
             style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white/50 rounded-full animate-pulse" 
             style={{ animationDelay: '2s' }} />
      </div>

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-full bg-white/20 backdrop-blur-sm",
              getAnimationClass(currentTip.animation)
            )}>
              {currentTip.icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {currentTip.title}
              </h3>
              <Badge variant="secondary" className="bg-white/40 backdrop-blur-sm text-xs">
                {currentTip.category}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAutoPlay}
              className="p-2 h-auto text-gray-600 hover:text-gray-800 hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="relative min-h-[60px] mb-4">
          <p className={cn(
            "text-gray-700 leading-relaxed transition-all duration-500 transform",
            direction === 'right' ? 'translate-x-0 opacity-100' : 'translate-x-0 opacity-100'
          )}>
            {currentTip.content}
          </p>
        </div>

        {/* Navigation and progress */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost" 
              size="sm"
              onClick={goToPrevious}
              className="p-2 h-auto text-gray-600 hover:text-gray-800 hover:bg-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm" 
              onClick={goToNext}
              className="p-2 h-auto text-gray-600 hover:text-gray-800 hover:bg-white/20"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress dots */}
          <div className="flex space-x-2">
            {tips.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex 
                    ? "bg-gray-800 w-6" 
                    : "bg-gray-400 hover:bg-gray-600"
                )}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="text-xs text-gray-500 font-medium">
            {currentIndex + 1} / {tips.length}
          </div>
        </div>
      </CardContent>

      {/* Progress bar */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div 
            className="h-1 bg-gradient-to-r from-blue-400 to-green-400 transition-all ease-linear"
            style={{ 
              animation: `progress ${interval}ms linear infinite`,
              width: '0%'
            }}
          />
        </div>
      )}
    </Card>
  );
}

// Add progress animation CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes progress {
      from { width: 0%; }
      to { width: 100%; }
    }
  `;
  document.head.appendChild(style);
}