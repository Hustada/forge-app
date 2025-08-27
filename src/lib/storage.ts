import type { ForgeData, DayData } from './types';
import { REQUIRED_TASKS } from './types';

const STORAGE_KEY = 'forge_v1_daily';
const DEFAULT_WATER_GOAL = 128; // oz
const DEFAULT_STEPS_GOAL = 10000;

export function getTodayKey(): string {
  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  
  // Reset at 3am local time
  if (localNow.getHours() < 3) {
    localNow.setDate(localNow.getDate() - 1);
  }
  
  return localNow.toISOString().split('T')[0];
}

export function loadForgeData(): ForgeData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load forge data:', error);
  }
  
  return {
    streak: 0,
    waterGoal: DEFAULT_WATER_GOAL,
    stepsGoal: DEFAULT_STEPS_GOAL
  };
}

export function saveForgeData(data: ForgeData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save forge data:', error);
  }
}

export function getTodayData(): DayData {
  const forgeData = loadForgeData();
  const todayKey = getTodayKey();
  const todayData = forgeData[todayKey] as DayData | undefined;
  
  if (todayData) {
    // Ensure customTasks exists for older data
    if (!todayData.customTasks) {
      todayData.customTasks = {};
    }
    return todayData;
  }
  
  return {
    strictFasting: true,
    waterOz: 0,
    steps: 0,
    checks: {},
    customTasks: {},
    notes: ''
  };
}

export function saveTodayData(data: DayData): void {
  const forgeData = loadForgeData();
  const todayKey = getTodayKey();
  
  forgeData[todayKey] = data;
  
  // Update streak if day is complete
  if (isDayComplete(data, forgeData)) {
    updateStreak(forgeData);
    if (!data.completedAt) {
      data.completedAt = new Date().toISOString();
    }
  }
  
  saveForgeData(forgeData);
}

export function isDayComplete(dayData: DayData, _forgeData: ForgeData): boolean {
  // Check all required tasks (water_goal and steps_goal are now just checkboxes in REQUIRED_TASKS)
  const allRequiredComplete = REQUIRED_TASKS.every(taskId => dayData.checks[taskId]);
  
  return allRequiredComplete;
}

export function updateStreak(forgeData: ForgeData): void {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check consecutive days backwards from today
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateKey = checkDate.toISOString().split('T')[0];
    
    const dayData = forgeData[dateKey] as DayData | undefined;
    
    if (dayData && isDayComplete(dayData, forgeData)) {
      streak++;
    } else if (i > 0) {
      // Don't break on today if incomplete, only on past days
      break;
    }
  }
  
  forgeData.streak = streak;
}

export function calculateProgress(dayData: DayData, _forgeData: ForgeData): number {
  // All required tasks count equally toward 100%
  const requiredComplete = REQUIRED_TASKS.filter(id => dayData.checks[id]).length;
  const progress = (requiredComplete / REQUIRED_TASKS.length) * 100;
  
  return progress;
}

export function addWater(ounces: number): void {
  const dayData = getTodayData();
  dayData.waterOz = Math.min(dayData.waterOz + ounces, 256); // Cap at double goal
  saveTodayData(dayData);
}

export function addSteps(steps: number): void {
  const dayData = getTodayData();
  dayData.steps = Math.min(dayData.steps + steps, 50000); // Reasonable cap
  saveTodayData(dayData);
}

export function toggleTask(taskId: string): void {
  const dayData = getTodayData();
  dayData.checks[taskId] = !dayData.checks[taskId];
  saveTodayData(dayData);
}

export function resetToday(): void {
  const forgeData = loadForgeData();
  const todayKey = getTodayKey();
  
  delete forgeData[todayKey];
  updateStreak(forgeData);
  saveForgeData(forgeData);
}

export function updateSettings(waterGoal: number, stepsGoal: number): void {
  const forgeData = loadForgeData();
  forgeData.waterGoal = waterGoal;
  forgeData.stepsGoal = stepsGoal;
  saveForgeData(forgeData);
}

export function setCustomTask(taskId: string, description: string): void {
  const dayData = getTodayData();
  if (description) {
    dayData.customTasks[taskId] = description;
  } else {
    delete dayData.customTasks[taskId];
  }
  saveTodayData(dayData);
}

export function setStepsActual(steps: number): void {
  const dayData = getTodayData();
  dayData.stepsActual = steps;
  saveTodayData(dayData);
}