import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingDown, 
  Award, 
  Medal,
  Crown,
  Sparkles,
  Zap,
  Heart,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Milestone {
  id: string;
  type: 'weight_loss' | 'percentage' | 'streak' | 'target';
  threshold: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  achieved: boolean;
  achievedDate?: string;
  animation: 'bounce' | 'scale' | 'rotate' | 'pulse';
}

interface WeightMilestoneAchievementsProps {
  initialWeight: number;
  currentWeight: number;
  targetWeight: number;
  weightHistory: any[];
  onClose?: () => void;
  showModal?: boolean;
}

export function WeightMilestoneAchievements({
  initialWeight,
  currentWeight,
  targetWeight,
  weightHistory = [],
  onClose,
  showModal = false
}: WeightMilestoneAchievementsProps) {
  const [visibleMilestones, setVisibleMilestones] = useState<Milestone[]>([]);
  const [newAchievements, setNewAchievements] = useState<Milestone[]>([]);

  const weightLoss = initialWeight - currentWeight;
  const weightLossPercentage = ((weightLoss / initialWeight) * 100);
  const progressToTarget = ((initialWeight - currentWeight) / (initialWeight - targetWeight)) * 100;

  // Calculate consecutive weight loss streak
  const calculateStreak = () => {
    const sortedHistory = [...weightHistory].sort((a, b) => 
      new Date(a.recordedDate || a.fullDate).getTime() - new Date(b.recordedDate || b.fullDate).getTime()
    );
    
    let streak = 0;
    for (let i = 1; i < sortedHistory.length; i++) {
      const current = parseFloat(sortedHistory[i].weight);
      const previous = parseFloat(sortedHistory[i - 1].weight);
      if (current < previous) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  const generateMilestones = (): Milestone[] => {
    const milestones: Milestone[] = [
      // Weight Loss Milestones
      {
        id: 'loss_1kg',
        type: 'weight_loss',
        threshold: 1,
        title: '🎯 Primer Kilogramo',
        description: 'Has perdido tu primer kilogramo. ¡Gran comienzo!',
        icon: <Target className="w-6 h-6" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        achieved: weightLoss >= 1,
        animation: 'bounce'
      },
      {
        id: 'loss_3kg',
        type: 'weight_loss',
        threshold: 3,
        title: '🌟 Tres Kilogramos',
        description: 'Has perdido 3 kg. ¡Tu esfuerzo está dando frutos!',
        icon: <Star className="w-6 h-6" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        achieved: weightLoss >= 3,
        animation: 'scale'
      },
      {
        id: 'loss_5kg',
        type: 'weight_loss',
        threshold: 5,
        title: '🏆 Cinco Kilogramos',
        description: 'Has alcanzado 5 kg de pérdida. ¡Increíble progreso!',
        icon: <Trophy className="w-6 h-6" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        achieved: weightLoss >= 5,
        animation: 'rotate'
      },
      {
        id: 'loss_10kg',
        type: 'weight_loss',
        threshold: 10,
        title: '👑 Diez Kilogramos',
        description: '¡10 kg perdidos! Eres una inspiración.',
        icon: <Crown className="w-6 h-6" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        achieved: weightLoss >= 10,
        animation: 'pulse'
      },

      // Percentage Milestones
      {
        id: 'percent_5',
        type: 'percentage',
        threshold: 5,
        title: '⚡ 5% de Pérdida',
        description: 'Has perdido el 5% de tu peso inicial. ¡Excelente!',
        icon: <Zap className="w-6 h-6" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        achieved: weightLossPercentage >= 5,
        animation: 'bounce'
      },
      {
        id: 'percent_10',
        type: 'percentage',
        threshold: 10,
        title: '✨ 10% de Pérdida',
        description: '¡Has perdido el 10% de tu peso! Transformación notable.',
        icon: <Sparkles className="w-6 h-6" />,
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
        achieved: weightLossPercentage >= 10,
        animation: 'scale'
      },

      // Streak Milestones
      {
        id: 'streak_3',
        type: 'streak',
        threshold: 3,
        title: '🔥 Racha de 3',
        description: '3 registros consecutivos perdiendo peso. ¡Consistencia!',
        icon: <TrendingDown className="w-6 h-6" />,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        achieved: streak >= 3,
        animation: 'pulse'
      },
      {
        id: 'streak_5',
        type: 'streak',
        threshold: 5,
        title: '🚀 Racha de 5',
        description: '¡5 registros seguidos perdiendo peso! Imparable.',
        icon: <Medal className="w-6 h-6" />,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        achieved: streak >= 5,
        animation: 'rotate'
      },

      // Target Progress Milestones
      {
        id: 'progress_25',
        type: 'target',
        threshold: 25,
        title: '💝 25% al Objetivo',
        description: 'Has completado el 25% del camino hacia tu meta.',
        icon: <Heart className="w-6 h-6" />,
        color: 'text-rose-600',
        bgColor: 'bg-rose-100',
        achieved: progressToTarget >= 25,
        animation: 'bounce'
      },
      {
        id: 'progress_50',
        type: 'target',
        threshold: 50,
        title: '🎯 50% al Objetivo',
        description: '¡Mitad del camino completado! Vas genial.',
        icon: <Target className="w-6 h-6" />,
        color: 'text-teal-600',
        bgColor: 'bg-teal-100',
        achieved: progressToTarget >= 50,
        animation: 'scale'
      },
      {
        id: 'progress_75',
        type: 'target',
        threshold: 75,
        title: '🌟 75% al Objetivo',
        description: 'Casi llegando a tu meta. ¡El objetivo está cerca!',
        icon: <Award className="w-6 h-6" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        achieved: progressToTarget >= 75,
        animation: 'pulse'
      },
      {
        id: 'target_reached',
        type: 'target',
        threshold: 100,
        title: '🏆 ¡Meta Alcanzada!',
        description: '¡Has alcanzado tu peso objetivo! ¡Felicitaciones!',
        icon: <Crown className="w-6 h-6" />,
        color: 'text-gold-600',
        bgColor: 'bg-gradient-to-r from-yellow-100 to-amber-100',
        achieved: currentWeight <= targetWeight,
        animation: 'rotate'
      }
    ];

    return milestones;
  };

  useEffect(() => {
    const milestones = generateMilestones();
    const achieved = milestones.filter(m => m.achieved);
    setVisibleMilestones(milestones);
    
    // Check for new achievements (in a real app, this would be stored in backend)
    const storedAchievements = localStorage.getItem('achievedMilestones');
    const previousAchievements = storedAchievements ? JSON.parse(storedAchievements) : [];
    const newOnes = achieved.filter(a => !previousAchievements.some((p: any) => p.id === a.id));
    
    if (newOnes.length > 0) {
      setNewAchievements(newOnes);
      localStorage.setItem('achievedMilestones', JSON.stringify(achieved.map(a => ({ id: a.id, achievedDate: new Date().toISOString() }))));
    }
  }, [initialWeight, currentWeight, targetWeight, weightHistory]);

  const getAnimationVariants = (animation: string) => {
    switch (animation) {
      case 'bounce':
        return {
          initial: { scale: 0, y: -50 },
          animate: { 
            scale: 1, 
            y: 0,
            transition: { 
              type: "spring",
              damping: 10,
              stiffness: 400
            }
          }
        };
      case 'scale':
        return {
          initial: { scale: 0, rotate: -180 },
          animate: { 
            scale: 1, 
            rotate: 0,
            transition: { 
              type: "spring",
              damping: 15,
              stiffness: 300
            }
          }
        };
      case 'rotate':
        return {
          initial: { scale: 0, rotate: -360 },
          animate: { 
            scale: 1, 
            rotate: 0,
            transition: { 
              duration: 0.8,
              ease: "backOut"
            }
          }
        };
      case 'pulse':
        return {
          initial: { scale: 0 },
          animate: { 
            scale: [0, 1.2, 1],
            transition: { 
              duration: 0.6,
              times: [0, 0.6, 1]
            }
          }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 }
        };
    }
  };

  const achievedMilestones = visibleMilestones.filter(m => m.achieved);
  const upcomingMilestones = visibleMilestones.filter(m => !m.achieved).slice(0, 3);

  if (showModal && newAchievements.length > 0) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-6 text-white text-center relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-white hover:bg-white hover:bg-opacity-20"
                onClick={onClose}
              >
                <X size={16} />
              </Button>
              <motion.div
                className="text-4xl mb-2"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                🎉
              </motion.div>
              <h2 className="text-xl font-bold mb-2">¡Nuevo Logro Desbloqueado!</h2>
              <p className="text-sm opacity-90">Has alcanzado un nuevo hito en tu progreso</p>
            </div>
            
            <div className="p-6 space-y-4">
              {newAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  className={`p-4 rounded-lg ${achievement.bgColor} border-2 border-dashed border-current ${achievement.color}`}
                  {...getAnimationVariants(achievement.animation)}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-white ${achievement.color}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
              >
                ¡Continuar con mi Progreso!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achieved Milestones */}
      {achievedMilestones.length > 0 && (
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="text-yellow-500 mr-2" size={20} />
              Logros Alcanzados ({achievedMilestones.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievedMilestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  className={`p-4 rounded-lg ${milestone.bgColor} border border-current ${milestone.color} relative overflow-hidden`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start space-x-3">
                    <motion.div
                      className={`p-2 rounded-full bg-white ${milestone.color}`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {milestone.icon}
                    </motion.div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{milestone.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{milestone.description}</p>
                      <Badge className="mt-2 bg-white bg-opacity-80 text-gray-700" variant="secondary">
                        ✅ Completado
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Celebration particles */}
                  <div className="absolute top-2 right-2 text-yellow-400 opacity-20">
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      ✨
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Milestones */}
      {upcomingMilestones.length > 0 && (
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="text-blue-500 mr-2" size={20} />
              Próximos Objetivos
            </h3>
            <div className="space-y-3">
              {upcomingMilestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-gray-200 text-gray-500">
                      {milestone.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-700 text-sm">{milestone.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{milestone.description}</p>
                      {milestone.type === 'weight_loss' && (
                        <div className="mt-2 text-xs text-blue-600">
                          Faltan {(milestone.threshold - weightLoss).toFixed(1)} kg para desbloquearlo
                        </div>
                      )}
                      {milestone.type === 'percentage' && (
                        <div className="mt-2 text-xs text-blue-600">
                          Progreso: {weightLossPercentage.toFixed(1)}% / {milestone.threshold}%
                        </div>
                      )}
                      {milestone.type === 'target' && (
                        <div className="mt-2 text-xs text-blue-600">
                          Progreso: {progressToTarget.toFixed(1)}% / {milestone.threshold}%
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-gray-500">
                      Pendiente
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}