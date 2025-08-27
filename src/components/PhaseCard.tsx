import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Flame, 
  Footprints, 
  UtensilsCrossed, 
  Moon,
  Check,
  Circle,
  Edit2,
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import type { Phase } from '../lib/types';

interface PhaseCardProps {
  phase: Phase;
  checks: Record<string, boolean>;
  customTasks: Record<string, string>;
  stepsActual?: number;
  onToggleTask: (taskId: string) => void;
  onCustomTask: (taskId: string, description: string) => void;
  onStepsUpdate: (steps: number) => void;
}

const iconMap: Record<string, React.ElementType> = {
  'Dumbbell': Dumbbell,
  'Flame': Flame,
  'FootprintsIcon': Footprints,
  'UtensilsCrossed': UtensilsCrossed,
  'Moon': Moon
};

export const PhaseCard: React.FC<PhaseCardProps> = ({ 
  phase, 
  checks, 
  customTasks,
  stepsActual,
  onToggleTask,
  onCustomTask,
  onStepsUpdate 
}) => {
  const Icon = iconMap[phase.icon] || Flame;
  const [editingCustom, setEditingCustom] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [stepsInput, setStepsInput] = useState(stepsActual?.toString() || '');
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const phaseProgress = phase.tasks.filter(task => checks[task.id]).length;
  const phaseTotal = phase.tasks.length;
  const phaseComplete = phaseProgress === phaseTotal;
  const progressPercent = (phaseProgress / phaseTotal) * 100;

  // Auto-collapse completed phases after delay
  useEffect(() => {
    if (phaseComplete && !isCollapsed) {
      const timer = setTimeout(() => {
        setIsCollapsed(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phaseComplete, isCollapsed]);

  const handleTaskToggle = (taskId: string) => {
    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onToggleTask(taskId);
  };

  const handleCustomToggle = (taskId: string) => {
    if (customTasks[taskId]) {
      // Clear custom task
      onCustomTask(taskId, '');
      setEditingCustom(null);
    } else {
      // Start editing
      setEditingCustom(taskId);
      setCustomInput('');
    }
  };

  const handleCustomSave = (taskId: string) => {
    if (customInput.trim()) {
      onCustomTask(taskId, customInput.trim());
      handleTaskToggle(taskId); // Also mark as complete
    }
    setEditingCustom(null);
    setCustomInput('');
  };

  const handleStepsChange = (value: string) => {
    setStepsInput(value);
    const steps = parseInt(value) || 0;
    if (steps >= 0) {
      onStepsUpdate(steps);
    }
  };

  const toggleCollapse = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
    setIsCollapsed(!isCollapsed);
  };

  // Progress ring SVG path
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={`forge-card overflow-hidden ${phaseComplete ? 'phase-won' : ''}`}
      style={{
        background: `linear-gradient(to right, rgba(200, 160, 74, ${progressPercent / 500}) 0%, transparent ${progressPercent}%)`
      }}
    >
      {/* Phase header - always visible */}
      <motion.div 
        className="p-4 sm:p-6 cursor-pointer"
        onClick={toggleCollapse}
        whileHover={{ backgroundColor: 'rgba(200, 160, 74, 0.02)' }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon with progress ring */}
            <div className="relative">
              <svg className="absolute inset-0 w-12 h-12 -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="rgba(200, 160, 74, 0.1)"
                  strokeWidth="3"
                  fill="none"
                />
                <motion.circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke={phaseComplete ? "#F59E0B" : "#C8A04A"}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ 
                    strokeDashoffset,
                    filter: phaseComplete ? "drop-shadow(0 0 8px #F59E0B)" : "none"
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  style={{
                    strokeDasharray: circumference
                  }}
                />
              </svg>
              <div className="w-12 h-12 flex items-center justify-center">
                <Icon className={`w-6 h-6 ${phaseComplete ? 'text-ember' : 'text-mournshard/70'}`} />
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="font-headline text-lg uppercase tracking-wide text-text-primary">
                {phase.title}
              </h2>
              <p className="text-sm text-text-muted">
                {phase.subtitle}
              </p>
            </div>
          </div>
          
          {/* Right side indicators */}
          <div className="flex items-center gap-3">
            {/* Task dots */}
            <div className="flex gap-1">
              {phase.tasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`w-1.5 h-1.5 rounded-full ${
                    checks[task.id] ? 'bg-ember' : 'bg-steel-light'
                  }`}
                />
              ))}
            </div>
            
            {/* Progress text */}
            <span className="text-xs text-text-muted min-w-[3rem] text-right">
              {phaseProgress}/{phaseTotal}
            </span>
            
            {/* Chevron */}
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-text-muted" />
            </motion.div>
            
            {/* Complete indicator */}
            {phaseComplete && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Sparkles className="w-5 h-5 text-ember animate-ember-glow" />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Task list - collapsible */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              height: { duration: 0.4, ease: "easeInOut" },
              opacity: { duration: 0.3 }
            }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-4 space-y-2">
              {phase.tasks.map((task, taskIndex) => {
                const isCustomActive = !!customTasks[task.id];
                const taskContent = isCustomActive ? customTasks[task.id] : task.content;
                const isStepsTask = task.id === 'steps_goal';
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: taskIndex * 0.05 }}
                    className="space-y-2"
                  >
                    <motion.div
                      onClick={() => !editingCustom && handleTaskToggle(task.id)}
                      className={`forge-task ${task.required ? 'forge-task-required pl-4' : ''} ${task.isFitness ? 'border-l-2 border-mournshard/50' : ''}`}
                      whileTap={{ scale: 0.98 }}
                      animate={checks[task.id] ? { backgroundColor: 'rgba(200, 160, 74, 0.1)' } : {}}
                      transition={{ duration: 0.3 }}
                    >
                <motion.div
                  animate={checks[task.id] ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {checks[task.id] ? (
                    <Check className="w-5 h-5 text-ember" />
                  ) : (
                    <Circle className="w-5 h-5 text-steel-light" />
                  )}
                </motion.div>
                
                <span className={`flex-1 text-sm ${checks[task.id] ? 'text-text-primary' : 'text-text-muted'}`}>
                  {taskContent}
                  {task.isFitness && <span className="ml-2 text-xs text-mournshard">[Required]</span>}
                </span>

                {/* Custom task toggle */}
                {task.allowCustom && !task.isFitness && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCustomToggle(task.id);
                    }}
                    className="p-1 hover:bg-steel rounded"
                    title={isCustomActive ? "Remove custom" : "Add custom alternative"}
                  >
                    {isCustomActive ? (
                      <X className="w-4 h-4 text-mournshard" />
                    ) : (
                      <Edit2 className="w-4 h-4 text-text-muted" />
                    )}
                  </button>
                )}

                {/* Gold pulse animation on check */}
                {checks[task.id] && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-mournshard opacity-0"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </motion.div>

              {/* Custom task input */}
              {editingCustom === task.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pl-12 pr-4 flex gap-2"
                >
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomSave(task.id)}
                    placeholder="Custom alternative task..."
                    className="flex-1 px-3 py-1 bg-steel border border-steel-light rounded text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-mournshard text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => handleCustomSave(task.id)}
                    className="px-3 py-1 bg-mournshard text-void rounded text-sm hover:bg-ember"
                  >
                    Save
                  </button>
                </motion.div>
              )}

              {/* Steps actual input */}
              {isStepsTask && checks[task.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pl-12 pr-4"
                >
                  <input
                    type="number"
                    value={stepsInput}
                    onChange={(e) => handleStepsChange(e.target.value)}
                    placeholder="Actual steps taken (optional)"
                    className="w-full px-3 py-1 bg-steel/50 border border-steel-light rounded text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-mournshard text-sm"
                  />
                </motion.div>
              )}
            </motion.div>
          );
        })}
            </div>

            {/* Phase complete message */}
            {phaseComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-center pb-4"
              >
                <p className="text-sm font-wisdom text-mournshard italic">
                  Phase Won.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Ember particles for completed phase */}
      {phaseComplete && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-ember rounded-full"
              initial={{ 
                bottom: '10px',
                left: `${30 + i * 20}%`,
                opacity: 0
              }}
              animate={{
                bottom: ['10px', '80px', '10px'],
                opacity: [0, 1, 0],
                x: [0, (i - 1) * 20, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};