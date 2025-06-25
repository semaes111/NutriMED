import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar,
  Heart,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

interface MoodEntry {
  id: number;
  moodLevel: number;
  energyLevel: number;
  motivationLevel: number;
  notes?: string;
  tags?: string[];
  recordedDate: string;
  createdAt: string;
}

interface MoodHistoryProps {
  entries: MoodEntry[];
  className?: string;
}

interface ChartData {
  date: string;
  displayDate: string;
  mood: number;
  energy: number;
  motivation: number;
}

export function MoodHistory({ entries, className = "" }: MoodHistoryProps) {
  const [showAll, setShowAll] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return "Hoy";
    if (isYesterday(date)) return "Ayer";
    return format(date, "dd 'de' MMM", { locale: es });
  };

  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), "HH:mm");
  };

  const getDisplayEntries = () => {
    return showAll ? entries : entries.slice(0, 5);
  };

  const getChartData = (): ChartData[] => {
    return entries.slice(0, 10).reverse().map(entry => ({
      date: entry.recordedDate,
      displayDate: formatDate(entry.recordedDate),
      mood: entry.moodLevel,
      energy: entry.energyLevel,
      motivation: entry.motivationLevel
    }));
  };

  const getAverageScore = () => {
    if (entries.length === 0) return 0;
    const total = entries.reduce((sum, entry) => 
      sum + entry.moodLevel + entry.energyLevel + entry.motivationLevel, 0
    );
    return (total / (entries.length * 3)).toFixed(1);
  };

  const getTrend = () => {
    if (entries.length < 2) return null;
    
    const recent = entries.slice(0, 3);
    const older = entries.slice(3, 6);
    
    if (recent.length === 0 || older.length === 0) return null;
    
    const recentAvg = recent.reduce((sum, entry) => 
      sum + entry.moodLevel + entry.energyLevel + entry.motivationLevel, 0
    ) / (recent.length * 3);
    
    const olderAvg = older.reduce((sum, entry) => 
      sum + entry.moodLevel + entry.energyLevel + entry.motivationLevel, 0
    ) / (older.length * 3);
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 0.3) return { type: 'up', text: 'Mejorando' };
    if (diff < -0.3) return { type: 'down', text: 'Bajando' };
    return { type: 'stable', text: 'Estable' };
  };

  const getMoodEmoji = (level: number) => {
    if (level === 1) return "😞";
    if (level === 2) return "😕";
    if (level === 3) return "😐";
    if (level === 4) return "😊";
    return "😄";
  };

  const getEnergyEmoji = (level: number) => {
    if (level === 1) return "💤";
    if (level === 2) return "😴";
    if (level === 3) return "⚡";
    if (level === 4) return "🔋";
    return "⚡";
  };

  const getMotivationEmoji = (level: number) => {
    if (level === 1) return "😔";
    if (level === 2) return "😐";
    if (level === 3) return "🎯";
    if (level === 4) return "⭐";
    return "🌈";
  };

  const trend = getTrend();

  if (entries.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="text-gray-300 mx-auto mb-4" size={48} />
          </motion.div>
          <p className="text-gray-500">
            Aún no tienes registros de estado de ánimo.<br />
            ¡Comienza a registrar cómo te sientes!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="text-purple-500" size={20} />
            </motion.div>
            Resumen de Bienestar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{getAverageScore()}</div>
              <div className="text-sm text-gray-600">Promedio general</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{entries.length}</div>
              <div className="text-sm text-gray-600">Registros totales</div>
            </div>
            <div className="text-center flex items-center justify-center">
              {trend && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1"
                >
                  {trend.type === 'up' && <TrendingUp className="text-green-500" size={20} />}
                  {trend.type === 'down' && <TrendingDown className="text-red-500" size={20} />}
                  {trend.type === 'stable' && <Minus className="text-gray-500" size={20} />}
                  <span className={`text-sm font-medium ${
                    trend.type === 'up' ? 'text-green-600' : 
                    trend.type === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {trend.text}
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Card */}
      {entries.length >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-blue-500" size={20} />
              Evolución de tu Bienestar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[1, 5]} 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    labelFormatter={(value) => `Fecha: ${value}`}
                    formatter={(value: number, name: string) => [
                      value,
                      name === 'mood' ? '😊 Ánimo' :
                      name === 'energy' ? '⚡ Energía' : '🎯 Motivación'
                    ]}
                  />
                  <Legend 
                    formatter={(value) => 
                      value === 'mood' ? '😊 Ánimo' :
                      value === 'energy' ? '⚡ Energía' : '🎯 Motivación'
                    }
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#ec4899" 
                    strokeWidth={2}
                    dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="motivation" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="text-green-500" size={20} />
            Historial de Registros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {getDisplayEntries().map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {formatDate(entry.recordedDate)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatTime(entry.recordedDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Heart className="text-pink-500" size={14} />
                          <span>{getMoodEmoji(entry.moodLevel)} {entry.moodLevel}/5</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="text-blue-500" size={14} />
                          <span>{getEnergyEmoji(entry.energyLevel)} {entry.energyLevel}/5</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="text-purple-500" size={14} />
                          <span>{getMotivationEmoji(entry.motivationLevel)} {entry.motivationLevel}/5</span>
                        </div>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: selectedEntry?.id === entry.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="text-gray-400" size={16} />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {selectedEntry?.id === entry.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-gray-200"
                      >
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-gray-600 mb-1">Etiquetas:</div>
                            <div className="flex flex-wrap gap-1">
                              {entry.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {entry.notes && (
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Notas:</div>
                            <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                              {entry.notes}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {entries.length > 5 && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="text-sm"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="mr-1" size={14} />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1" size={14} />
                    Ver todos ({entries.length})
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}