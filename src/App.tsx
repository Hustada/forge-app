import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProgressHeader } from './components/ProgressHeader';
import { PhaseCard } from './components/PhaseCard';
import { AuthForm } from './components/AuthForm';
import { AuthConfirm } from './components/AuthConfirm';
import { PHASES } from './lib/types';
import * as storage from './lib/storage';
import { forgeDB } from './lib/database';

function AppContent() {
  const { user, loading, isOfflineMode } = useAuth();
  const [dayData, setDayData] = useState(storage.getTodayData());
  const [forgeData, setForgeData] = useState(storage.loadForgeData());
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [programId, setProgramId] = useState<string | null>(null);
  const [stats, setStats] = useState({ currentDay: 1, totalResets: 0, longestStreak: 0 });

  // Load data on mount and set up interval to check for day change
  useEffect(() => {
    const loadData = async () => {
      if (user && !isOfflineMode) {
        // Get or create active program
        const program = await forgeDB.getActiveProgram(user.id);
        if (program) {
          setProgramId(program.id);
          const todayLog = await forgeDB.getTodayLog(user.id, program.id);
          if (todayLog) setDayData(todayLog);
        }
        
        // Get stats
        const programStats = await forgeDB.getProgramStats(user.id);
        setStats(programStats);
      } else {
        // Offline mode
        const storedData = storage.loadForgeData();
        const todayData = storage.getTodayData();
        setForgeData(storedData);
        setDayData(todayData);
      }
    };

    loadData();

    const interval = setInterval(loadData, 60000);
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, isOfflineMode]);

  const handleToggleTask = async (taskId: string) => {
    if (user && programId && !isOfflineMode) {
      await forgeDB.toggleTask(user.id, programId, taskId);
      const todayLog = await forgeDB.getTodayLog(user.id, programId);
      if (todayLog) setDayData(todayLog);
    } else {
      storage.toggleTask(taskId);
      setDayData(storage.getTodayData());
      setForgeData(storage.loadForgeData());
    }
  };

  const handleCustomTask = async (taskId: string, description: string) => {
    if (user && programId && !isOfflineMode) {
      await forgeDB.setCustomTask(user.id, programId, taskId, description);
      const todayLog = await forgeDB.getTodayLog(user.id, programId);
      if (todayLog) setDayData(todayLog);
    } else {
      storage.setCustomTask(taskId, description);
      setDayData(storage.getTodayData());
    }
  };

  const handleStepsUpdate = async (steps: number) => {
    if (user && programId && !isOfflineMode) {
      await forgeDB.setStepsActual(user.id, programId, steps);
      const todayLog = await forgeDB.getTodayLog(user.id, programId);
      if (todayLog) setDayData(todayLog);
    } else {
      storage.setStepsActual(steps);
      setDayData(storage.getTodayData());
    }
  };

  const handleReset = async () => {
    if (user && programId && !isOfflineMode) {
      // In database mode, create a new program (reset)
      const program = await forgeDB.getActiveProgram(user.id);
      if (program) {
        setProgramId(program.id);
        const todayLog = await forgeDB.getTodayLog(user.id, program.id);
        if (todayLog) setDayData(todayLog);
      }
      const programStats = await forgeDB.getProgramStats(user.id);
      setStats(programStats);
    } else {
      storage.resetToday();
      setDayData(storage.getTodayData());
      setForgeData(storage.loadForgeData());
    }
  };


  const progress = storage.calculateProgress(dayData, forgeData);
  const dayComplete = storage.isDayComplete(dayData, forgeData);

  // Check if this is an auth confirmation callback
  if (window.location.hash?.includes('type=signup') || window.location.hash?.includes('type=recovery')) {
    return <AuthConfirm />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-mournshard">Forging...</div>
      </div>
    );
  }

  if (!user && !isOfflineMode) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-4">
        {showAuth ? (
          <AuthForm onClose={() => setShowAuth(false)} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center">
            <h1 className="font-headline text-5xl uppercase tracking-wider text-mournshard mb-4">
              THE FORGE
            </h1>
            <p className="text-text-muted mb-8 font-wisdom italic">
              "Discipline or decay."
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="forge-button bg-mournshard text-void hover:bg-ember px-8 py-3">
              Begin The Forge
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void pb-8">
      {/* Header */}
      <ProgressHeader 
        currentDay={isOfflineMode ? 1 : stats.currentDay}
        totalResets={isOfflineMode ? 0 : stats.totalResets}
        progress={progress}
        dayComplete={dayComplete}
        onSettings={() => setShowSettings(true)}
        onReset={handleReset}
      />

      {/* Phases */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-2xl mx-auto space-y-4">
        {PHASES.map((phase, index) => (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PhaseCard
              phase={phase}
              checks={dayData.checks}
              customTasks={dayData.customTasks || {}}
              stepsActual={dayData.stepsActual}
              onToggleTask={handleToggleTask}
              onCustomTask={handleCustomTask}
              onStepsUpdate={handleStepsUpdate}
            />
          </motion.div>
        ))}

        {/* Day complete celebration */}
        <AnimatePresence>
          {dayComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="forge-card p-8 text-center bg-gradient-to-br from-charred to-steel"
            >
              <h2 className="font-headline text-2xl uppercase tracking-wide text-mournshard mb-4">
                The Forge Holds
              </h2>
              <p className="font-wisdom text-text-muted italic">
                "Victory is yours. You remain unbroken."
              </p>
              <div className="mt-4">
                <span className="text-sm text-text-muted">
                  Consecutive Victories: {forgeData.streak}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-void/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="forge-card p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-headline text-xl uppercase tracking-wide text-text-primary mb-6">
                Settings
              </h2>
              
              <div className="space-y-4">
                <div className="text-sm text-text-muted">
                  <p className="mb-2">The Vessel: 128oz water goal</p>
                  <p>The March: 10,000 steps goal</p>
                </div>
                
                <div className="pt-4 border-t border-steel-light">
                  <p className="text-xs text-text-muted mb-2">Custom tasks can replace non-fitness requirements.</p>
                  <p className="text-xs text-mournshard">Fitness tasks are non-negotiable.</p>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="forge-button bg-mournshard text-void hover:bg-ember w-full"
                  >
                    Close
                  </button>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-steel-light">
                <p className="text-xs text-text-muted text-center italic">
                  "The Forge bends to your will."
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
