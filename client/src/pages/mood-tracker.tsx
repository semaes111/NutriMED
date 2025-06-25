import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MoodTracker } from "@/components/ui/mood-tracker";
import { MoodHistory } from "@/components/ui/mood-history";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MoodData {
  moodLevel: number;
  energyLevel: number;
  motivationLevel: number;
  notes?: string;
  tags?: string[];
}

export default function MoodTrackerPage() {
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get mood entries
  const { data: moodEntries, isLoading: isEntriesLoading } = useQuery({
    queryKey: ["/api/patient/mood-entries"],
    retry: false,
  });

  // Create mood entry mutation
  const createMoodEntryMutation = useMutation({
    mutationFn: async (data: MoodData) => {
      return await apiRequest("/api/patient/mood-entries", {
        method: "POST",
        data,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "¡Estado de ánimo registrado!",
        description: "Tu bienestar ha sido guardado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patient/mood-entries"] });
      
      // Show history after successful submission
      setTimeout(() => setShowHistory(true), 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error al registrar",
        description: error.message || "No se pudo guardar tu estado de ánimo",
        variant: "destructive",
      });
    },
  });

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "¡Buenos días! ☀️";
    if (hour < 18) return "¡Buenas tardes! 🌤️";
    return "¡Buenas noches! 🌙";
  };

  const getTodayEntries = () => {
    if (!moodEntries) return [];
    const today = new Date().toDateString();
    return moodEntries.filter((entry: any) => 
      new Date(entry.recordedDate).toDateString() === today
    );
  };

  const todayEntries = getTodayEntries();
  const hasEntryToday = todayEntries.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <ArrowLeft className="mr-2" size={16} />
              Volver al Dashboard
            </Button>
            
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Heart className="text-pink-500" size={24} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getWelcomeMessage()}
          </h1>
          <p className="text-lg text-gray-600">
            Cuida tu bienestar emocional registrando cómo te sientes
          </p>
          
          {hasEntryToday && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-4"
            >
              <Card className="bg-green-50 border-green-200 max-w-md mx-auto">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <Sparkles size={16} />
                    <span className="text-sm font-medium">
                      Ya registraste tu estado de ánimo hoy. ¡Excelente!
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-purple-100">
            <Button
              variant={!showHistory ? "default" : "ghost"}
              onClick={() => setShowHistory(false)}
              className={`px-6 ${!showHistory ? "bg-purple-500 text-white" : "text-purple-600"}`}
            >
              <Heart className="mr-2" size={16} />
              Registrar Estado
            </Button>
            <Button
              variant={showHistory ? "default" : "ghost"}
              onClick={() => setShowHistory(true)}
              className={`px-6 ${showHistory ? "bg-purple-500 text-white" : "text-purple-600"}`}
            >
              <Sparkles className="mr-2" size={16} />
              Ver Historial
            </Button>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={showHistory ? "history" : "tracker"}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {!showHistory ? (
            <div className="max-w-2xl mx-auto">
              <MoodTracker
                onSubmit={(data) => createMoodEntryMutation.mutate(data)}
                isLoading={createMoodEntryMutation.isPending}
              />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {isEntriesLoading ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="mb-4"
                    >
                      <Sparkles className="text-purple-500 mx-auto" size={32} />
                    </motion.div>
                    <p className="text-gray-600">Cargando tu historial de bienestar...</p>
                  </CardContent>
                </Card>
              ) : (
                <MoodHistory entries={moodEntries || []} />
              )}
            </div>
          )}
        </motion.div>

        {/* Motivational Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 mb-8"
        >
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 max-w-2xl mx-auto">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="mb-3"
            >
              <Sparkles className="text-purple-500 mx-auto" size={24} />
            </motion.div>
            <p className="text-purple-800 font-medium mb-2">
              💝 Recordatorio de Bienestar
            </p>
            <p className="text-purple-700 text-sm">
              Registrar tu estado de ánimo te ayuda a ser más consciente de tus emociones 
              y a identificar patrones que pueden mejorar tu calidad de vida.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}