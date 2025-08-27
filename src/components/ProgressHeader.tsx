import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Settings, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

interface ProgressHeaderProps {
  currentDay: number;
  totalResets: number;
  progress: number;
  dayComplete: boolean;
  onSettings?: () => void;
  onReset?: () => void;
  onCompleteDay?: () => void;
  onStartOver?: () => void;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({ 
  currentDay, 
  totalResets, 
  progress, 
  dayComplete, 
  onSettings, 
  onReset,
  onCompleteDay,
  onStartOver 
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const getMessage = () => {
    if (dayComplete) return "The Forge Holds. Victory is yours.";
    if (progress >= 80) return "The day bends to your will.";
    if (progress >= 50) return "Halfway through the ritual. Keep forging.";
    if (progress >= 25) return "The transformation begins.";
    if (progress > 0) return "Win the phase.";
    return "Action is the answer.";
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background texture overlay */}
      <div className="absolute inset-0 bg-stone-texture opacity-5" />
      
      <div className="relative px-4 sm:px-6 lg:px-8 pt-6 pb-4 max-w-2xl mx-auto">
        {/* Top bar with title and actions */}
        <div className="flex items-start justify-between mb-4">
          <h1 className="font-headline text-4xl uppercase tracking-wider text-mournshard text-forge-glow">
            FORGE
          </h1>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            {onCompleteDay && !dayComplete && (
              <motion.button
                onClick={onCompleteDay}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-mournshard/20 hover:bg-mournshard/30 transition-colors"
                title="Mark Day Complete (Check all tasks)"
              >
                <CheckCircle className="w-5 h-5 text-mournshard" />
              </motion.button>
            )}
            {onStartOver && (
              <motion.button
                onClick={() => setShowConfirmReset(true)}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-shadow/20 hover:bg-shadow/30 transition-colors"
                title="Start Over (Reset to Day 1)"
              >
                <AlertCircle className="w-5 h-5 text-shadow" />
              </motion.button>
            )}
            {onReset && (
              <motion.button
                onClick={onReset}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-steel/50 hover:bg-steel transition-colors"
                title="Reset Today"
              >
                <RotateCcw className="w-5 h-5 text-text-muted" />
              </motion.button>
            )}
            {onSettings && (
              <motion.button
                onClick={onSettings}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-steel/50 hover:bg-steel transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-text-muted" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Day counter section */}
        <div className="flex items-center justify-center mb-4">
          <div>
            <div className="text-xs text-text-muted uppercase tracking-wide mb-1">
              The 90-Day Forge
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-ember animate-ember-glow" />
              <span className="font-headline text-2xl text-mournshard">
                Day {currentDay} of 90
              </span>
            </div>
            <div className="text-xs text-text-muted mt-1">
              {totalResets > 0 ? (
                <span className="text-shadow">Resets: {totalResets}. No mercy.</span>
              ) : (
                <span>Miss one task, start over.</span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative">
          <div className="h-8 bg-steel rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="molten-progress"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ transformOrigin: 'left' }}
            />
          </div>
          
          {/* Progress percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-text-primary mix-blend-difference">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Marcus message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-center"
        >
          <p className="text-sm font-wisdom text-text-muted italic">
            "{getMessage()}"
          </p>
        </motion.div>

        {/* Day complete overlay effect */}
        {dayComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Ember particles */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="ember-particle"
                style={{
                  left: `${20 + i * 15}%`,
                  bottom: '10px',
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Confirm Reset Modal */}
      {showConfirmReset && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-void/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowConfirmReset(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="forge-card p-6 w-full max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <AlertCircle className="w-12 h-12 text-shadow mx-auto mb-4" />
            <h2 className="font-headline text-xl uppercase tracking-wide text-shadow mb-2">
              Start Over?
            </h2>
            <p className="text-text-muted mb-2">
              This will reset you to Day 1 and increase your reset count.
            </p>
            <p className="text-xs text-mournshard mb-6">
              "The Forge demands commitment."
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 forge-button bg-steel text-text-primary hover:bg-steel-light py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onStartOver?.();
                  setShowConfirmReset(false);
                }}
                className="flex-1 forge-button bg-shadow text-white hover:bg-shadow/80 py-2"
              >
                Start Over
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};