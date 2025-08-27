import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Footprints, RotateCcw, Settings } from 'lucide-react';

interface FooterQuickActionsProps {
  waterOz: number;
  steps: number;
  waterGoal: number;
  stepsGoal: number;
  onAddWater: (oz: number) => void;
  onAddSteps: (steps: number) => void;
  onReset: () => void;
  onSettings: () => void;
}

export const FooterQuickActions: React.FC<FooterQuickActionsProps> = ({
  waterOz,
  steps,
  waterGoal,
  stepsGoal,
  onAddWater,
  onAddSteps,
  onReset,
  onSettings
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleQuickAction = (action: () => void) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    action();
  };

  const handleReset = () => {
    if (showResetConfirm) {
      handleQuickAction(onReset);
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  const waterPercent = Math.min((waterOz / waterGoal) * 100, 100);
  const stepsPercent = Math.min((steps / stepsGoal) * 100, 100);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-void/95 backdrop-blur-sm border-t border-steel-light max-h-72 overflow-y-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-3 max-w-2xl mx-auto">
        {/* The Vessel (Water) */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-mournshard" />
              <span className="text-xs uppercase tracking-wide text-text-muted">The Vessel</span>
            </div>
            <span className="text-sm text-text-primary">{waterOz} / {waterGoal} oz</span>
          </div>
          
          <div className="h-5 bg-steel rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
              initial={{ width: 0 }}
              animate={{ width: `${waterPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <div className="flex gap-2">
            {[8, 16, 32].map((oz) => (
              <motion.button
                key={oz}
                onClick={() => handleQuickAction(() => onAddWater(oz))}
                whileTap={{ scale: 0.95 }}
                className="forge-button bg-steel text-text-muted hover:bg-steel-light hover:text-text-primary flex-1"
              >
                +{oz}oz
              </motion.button>
            ))}
          </div>
        </div>

        {/* The March (Steps) */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Footprints className="w-4 h-4 text-mournshard" />
              <span className="text-xs uppercase tracking-wide text-text-muted">The March</span>
            </div>
            <span className="text-sm text-text-primary">{steps.toLocaleString()} / {stepsGoal.toLocaleString()}</span>
          </div>
          
          <div className="h-5 bg-steel rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-gradient-to-r from-green-600 to-green-400"
              initial={{ width: 0 }}
              animate={{ width: `${stepsPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <div className="flex gap-2">
            {[250, 500, 1000].map((stepCount) => (
              <motion.button
                key={stepCount}
                onClick={() => handleQuickAction(() => onAddSteps(stepCount))}
                whileTap={{ scale: 0.95 }}
                className="forge-button bg-steel text-text-muted hover:bg-steel-light hover:text-text-primary flex-1"
              >
                +{stepCount >= 1000 ? `${stepCount / 1000}k` : stepCount}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.button
            onClick={handleReset}
            whileTap={{ scale: 0.95 }}
            className={`forge-button flex-1 flex items-center justify-center gap-2 ${
              showResetConfirm 
                ? 'bg-shadow text-white' 
                : 'bg-steel text-text-muted hover:bg-steel-light hover:text-text-primary'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">
              {showResetConfirm ? 'Confirm Reset' : 'Reset Today'}
            </span>
          </motion.button>
          
          <motion.button
            onClick={() => handleQuickAction(onSettings)}
            whileTap={{ scale: 0.95 }}
            className="forge-button bg-steel text-text-muted hover:bg-steel-light hover:text-text-primary flex-1 flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </motion.button>
        </div>

        {/* Marcus message for low progress */}
        {(waterOz === 0 || steps === 0) && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-text-muted italic text-center mt-2"
          >
            {waterOz === 0 && "The Vessel is empty. Fill it."}
            {waterOz === 0 && steps === 0 && " "}
            {steps === 0 && "The March has not begun."}
          </motion.p>
        )}
      </div>
    </div>
  );
};