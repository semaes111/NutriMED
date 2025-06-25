import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Smile, 
  Frown, 
  Meh, 
  Heart,
  Zap,
  Target,
  Star,
  Sparkles,
  Coffee,
  Sun,
  Moon,
  CloudRain,
  Flower,
  Rainbow,
  ThumbsUp
} from "lucide-react";

interface MoodTrackerProps {
  onSubmit: (data: MoodData) => void;
  isLoading?: boolean;
  className?: string;
}

interface MoodData {
  moodLevel: number;
  energyLevel: number;
  motivationLevel: number;
  notes?: string;
  tags?: string[];
}

const moodEmojis = {
  1: { icon: Frown, label: "😞 Muy mal", color: "text-red-500", bg: "bg-red-50" },
  2: { icon: CloudRain, label: "😕 Mal", color: "text-orange-500", bg: "bg-orange-50" },
  3: { icon: Meh, label: "😐 Regular", color: "text-yellow-500", bg: "bg-yellow-50" },
  4: { icon: Smile, label: "😊 Bien", color: "text-green-500", bg: "bg-green-50" },
  5: { icon: Heart, label: "😄 Excelente", color: "text-pink-500", bg: "bg-pink-50" }
};

const energyEmojis = {
  1: { icon: Moon, label: "💤 Muy cansado", color: "text-gray-500", bg: "bg-gray-50" },
  2: { icon: Coffee, label: "😴 Cansado", color: "text-blue-400", bg: "bg-blue-50" },
  3: { icon: Sun, label: "⚡ Normal", color: "text-yellow-500", bg: "bg-yellow-50" },
  4: { icon: Zap, label: "🔋 Energético", color: "text-green-500", bg: "bg-green-50" },
  5: { icon: Sparkles, label: "⚡ Súper energético", color: "text-purple-500", bg: "bg-purple-50" }
};

const motivationEmojis = {
  1: { icon: CloudRain, label: "😔 Sin ganas", color: "text-gray-500", bg: "bg-gray-50" },
  2: { icon: Meh, label: "😐 Poco motivado", color: "text-orange-500", bg: "bg-orange-50" },
  3: { icon: Target, label: "🎯 Normal", color: "text-yellow-500", bg: "bg-yellow-50" },
  4: { icon: Star, label: "⭐ Motivado", color: "text-green-500", bg: "bg-green-50" },
  5: { icon: Rainbow, label: "🌈 Súper motivado", color: "text-purple-500", bg: "bg-purple-50" }
};

const predefinedTags = [
  "😴 Cansado", "😊 Feliz", "😰 Estresado", "😌 Relajado", 
  "💪 Fuerte", "🎉 Emocionado", "😔 Triste", "😤 Ansioso",
  "🧘 Tranquilo", "🔥 Motivado", "🤗 Agradecido", "😎 Confiado"
];

export function MoodTracker({ onSubmit, isLoading = false, className = "" }: MoodTrackerProps) {
  const [moodLevel, setMoodLevel] = useState<number>(3);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [motivationLevel, setMotivationLevel] = useState<number>(3);
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    const data: MoodData = {
      moodLevel,
      energyLevel,
      motivationLevel,
      notes: notes.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined
    };

    onSubmit(data);
    setShowSuccess(true);
    
    // Reset success animation after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getMotivationalMessage = () => {
    const totalScore = moodLevel + energyLevel + motivationLevel;
    if (totalScore >= 13) return "¡Increíble! Tienes una energía fantástica hoy 🌟";
    if (totalScore >= 10) return "¡Muy bien! Estás en un buen momento 😊";
    if (totalScore >= 7) return "No está mal, sigue adelante 💪";
    return "Está bien tener días así. Mañana será mejor 🌈";
  };

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center z-10 rounded-lg"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity },
                scale: { duration: 1, repeat: 2 }
              }}
              className="text-center"
            >
              <ThumbsUp className="text-green-500 mx-auto mb-2" size={48} />
              <p className="text-green-700 font-semibold">¡Registro guardado!</p>
              <p className="text-green-600 text-sm">{getMotivationalMessage()}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="text-pink-500" size={24} />
          </motion.div>
          Tracker de Bienestar
        </CardTitle>
        <p className="text-sm text-gray-600">
          Registra cómo te sientes hoy y recibe motivación personalizada
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Mood Level */}
        <div>
          <label className="block text-sm font-medium mb-3">
            💭 ¿Cómo está tu ánimo hoy?
          </label>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(moodEmojis).map(([level, emoji]) => {
              const IconComponent = emoji.icon;
              const isSelected = parseInt(level) === moodLevel;
              return (
                <motion.button
                  key={level}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMoodLevel(parseInt(level))}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? `${emoji.bg} border-current ${emoji.color}` 
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <IconComponent className={`mx-auto mb-1 ${isSelected ? emoji.color : "text-gray-400"}`} size={20} />
                  <div className={`text-xs font-medium ${isSelected ? emoji.color : "text-gray-500"}`}>
                    {level}
                  </div>
                </motion.button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {moodEmojis[moodLevel as keyof typeof moodEmojis].label}
          </p>
        </div>

        {/* Energy Level */}
        <div>
          <label className="block text-sm font-medium mb-3">
            ⚡ ¿Cuál es tu nivel de energía?
          </label>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(energyEmojis).map(([level, emoji]) => {
              const IconComponent = emoji.icon;
              const isSelected = parseInt(level) === energyLevel;
              return (
                <motion.button
                  key={level}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEnergyLevel(parseInt(level))}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? `${emoji.bg} border-current ${emoji.color}` 
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <IconComponent className={`mx-auto mb-1 ${isSelected ? emoji.color : "text-gray-400"}`} size={20} />
                  <div className={`text-xs font-medium ${isSelected ? emoji.color : "text-gray-500"}`}>
                    {level}
                  </div>
                </motion.button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {energyEmojis[energyLevel as keyof typeof energyEmojis].label}
          </p>
        </div>

        {/* Motivation Level */}
        <div>
          <label className="block text-sm font-medium mb-3">
            🎯 ¿Qué tan motivado te sientes?
          </label>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(motivationEmojis).map(([level, emoji]) => {
              const IconComponent = emoji.icon;
              const isSelected = parseInt(level) === motivationLevel;
              return (
                <motion.button
                  key={level}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMotivationLevel(parseInt(level))}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? `${emoji.bg} border-current ${emoji.color}` 
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <IconComponent className={`mx-auto mb-1 ${isSelected ? emoji.color : "text-gray-400"}`} size={20} />
                  <div className={`text-xs font-medium ${isSelected ? emoji.color : "text-gray-500"}`}>
                    {level}
                  </div>
                </motion.button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {motivationEmojis[motivationLevel as keyof typeof motivationEmojis].label}
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-3">
            🏷️ ¿Cómo te describes hoy? (opcional)
          </label>
          <div className="flex flex-wrap gap-2">
            {predefinedTags.map((tag) => (
              <motion.button
                key={tag}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleTag(tag)}
                className={`transition-all ${
                  selectedTags.includes(tag)
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Badge variant={selectedTags.includes(tag) ? "default" : "secondary"}>
                  {tag}
                </Badge>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">
            📝 Notas adicionales (opcional)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="¿Hay algo más que quieras compartir sobre cómo te sientes hoy?"
            className="resize-none"
            rows={3}
          />
        </div>

        {/* Motivational Preview */}
        <motion.div
          animate={{ 
            background: [
              "linear-gradient(45deg, #f0f9ff, #e0f2fe)",
              "linear-gradient(45deg, #fef7cd, #fef3c7)",
              "linear-gradient(45deg, #f0fdf4, #dcfce7)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="p-4 rounded-lg border border-blue-200"
        >
          <p className="text-sm text-center text-gray-700">
            <span className="font-medium">💫 Mensaje motivacional:</span><br />
            {getMotivationalMessage()}
          </p>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-3"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mr-2"
              >
                <Sparkles size={16} />
              </motion.div>
            ) : (
              <Heart className="mr-2" size={16} />
            )}
            {isLoading ? "Guardando..." : "Registrar mi estado de ánimo"}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}