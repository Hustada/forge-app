import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Footprints, Plus, Minus } from 'lucide-react';

interface TrackerCardProps {
  type: 'water' | 'steps';
  current: number;
  goal: number;
  onAdd: (amount: number) => void;
}

export const TrackerCard: React.FC<TrackerCardProps> = ({ type, current, goal, onAdd }) => {
  const isWater = type === 'water';
  const Icon = isWater ? Droplet : Footprints;
  const title = isWater ? 'The Vessel' : 'The March';
  const unit = isWater ? 'oz' : '';
  const increments = isWater ? [8, 16, 32] : [250, 500, 1000];
  
  const percent = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  const handleAction = (amount: number) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onAdd(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`forge-card p-4 sm:p-6 ${isComplete ? 'border-mournshard/30' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-mournshard" />
          <h3 className="font-headline text-sm uppercase tracking-wide text-text-primary">
            {title}
          </h3>
        </div>
        <span className="text-sm text-text-primary">
          {current.toLocaleString()} / {goal.toLocaleString()} {unit}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-6 bg-steel rounded-full overflow-hidden mb-3">
        <motion.div
          className={`h-full ${isWater ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 'bg-gradient-to-r from-green-600 to-green-400'}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Quick add buttons */}
      <div className="flex gap-2">
        {increments.map((amount) => (
          <motion.button
            key={amount}
            onClick={() => handleAction(amount)}
            whileTap={{ scale: 0.95 }}
            className="forge-button bg-steel text-text-muted hover:bg-steel-light hover:text-text-primary flex-1 text-sm py-2"
          >
            +{amount >= 1000 ? `${amount / 1000}k` : amount}{unit && unit}
          </motion.button>
        ))}
      </div>

      {/* Marcus message */}
      {current === 0 && (
        <p className="text-xs text-text-muted italic text-center mt-3">
          {isWater ? "The Vessel is empty. Fill it." : "The March has not begun."}
        </p>
      )}
      {isComplete && (
        <p className="text-xs text-mournshard italic text-center mt-3">
          {isWater ? "The Vessel overflows." : "The March is complete."}
        </p>
      )}
    </motion.div>
  );
};