export interface Task {
  id: string;
  content: string;
  required: boolean;
  phaseId: string;
  allowCustom?: boolean; // Can be replaced with custom task
  isFitness?: boolean;   // Fitness tasks cannot be replaced
}

export interface Phase {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tasks: Task[];
}

export interface DayData {
  strictFasting: boolean;
  waterOz: number;
  steps: number;
  stepsActual?: number; // Optional actual step count
  checks: Record<string, boolean>;
  customTasks: Record<string, string>; // taskId -> custom description
  notes: string;
  completedAt?: string;
}

export interface ForgeData {
  streak: number;
  waterGoal: number;
  stepsGoal: number;
  [date: string]: DayData | number;
}

export const REQUIRED_TASKS = [
  'hydrate_morning', 'train_fasted', 'log_lifts',
  'maker_sprint', 'reset_walk',
  'fast_only',
  'meal1', 'spice_medicine', 'admin_block',
  'meal2', 'family_block', 'solo_recharge',
  'water_goal', 'steps_goal', 'shadow_rule', 'daily_proof', 'tomorrow_priority', 'sleep_ritual'
];

export const OPTIONAL_TASKS = [
  'electrolytes', 'shadow_journal'
];

export const PHASES: Phase[] = [
  {
    id: 'awakening',
    title: 'Phase I — Awakening',
    subtitle: 'Wake → +2h',
    icon: 'Dumbbell',
    tasks: [
      { id: 'hydrate_morning', content: 'Hydrate 16–20 oz water', required: true, phaseId: 'awakening', allowCustom: true },
      { id: 'train_fasted', content: 'Fasted training 45–60 min', required: true, phaseId: 'awakening', isFitness: true },
      { id: 'log_lifts', content: 'Log 1–2 main lifts', required: true, phaseId: 'awakening', isFitness: true },
      { id: 'electrolytes', content: 'Electrolytes if needed', required: false, phaseId: 'awakening' }
    ]
  },
  {
    id: 'creation',
    title: 'Phase II — Creation',
    subtitle: '+2h → +4h',
    icon: 'Flame',
    tasks: [
      { id: 'maker_sprint', content: 'Maker sprint 90–120 min', required: true, phaseId: 'creation', allowCustom: true },
      { id: 'reset_walk', content: 'Reset: coffee + 5–10 min walk', required: true, phaseId: 'creation', isFitness: true }
    ]
  },
  {
    id: 'fasted_march',
    title: 'Phase III — The Fasted March',
    subtitle: '+4h → +7h',
    icon: 'FootprintsIcon',
    tasks: [
      { id: 'fast_only', content: 'Stay fasted (water/coffee/tea only)', required: true, phaseId: 'fasted_march', allowCustom: false },
      { id: 'shadow_journal', content: 'Shadow says ___. My answer is ___.', required: false, phaseId: 'fasted_march' }
    ]
  },
  {
    id: 'breaking',
    title: 'Phase IV — The Breaking',
    subtitle: '+7h → +10h',
    icon: 'UtensilsCrossed',
    tasks: [
      { id: 'meal1', content: 'Meal 1: protein + carb + greens', required: true, phaseId: 'breaking', allowCustom: false },
      { id: 'spice_medicine', content: 'Spice-as-medicine', required: true, phaseId: 'breaking', allowCustom: true },
      { id: 'admin_block', content: 'Admin/Execution 1–2h', required: true, phaseId: 'breaking', allowCustom: true }
    ]
  },
  {
    id: 'forgefire',
    title: 'Phase V — The Forgefire',
    subtitle: '+10h → +13h',
    icon: 'Flame',
    tasks: [
      { id: 'meal2', content: 'Meal 2: protein + carb + greens', required: true, phaseId: 'forgefire', allowCustom: false },
      { id: 'family_block', content: 'Family block (connection)', required: true, phaseId: 'forgefire', allowCustom: true },
      { id: 'solo_recharge', content: 'Solo recharge 30–60 min', required: true, phaseId: 'forgefire', allowCustom: true }
    ]
  },
  {
    id: 'closing',
    title: 'Phase VI — The Closing',
    subtitle: 'Final 2h pre-sleep',
    icon: 'Moon',
    tasks: [
      { id: 'water_goal', content: 'The Vessel: Complete 128oz water', required: true, phaseId: 'closing' },
      { id: 'steps_goal', content: 'The March: Complete 10,000 steps', required: true, phaseId: 'closing' },
      { id: 'shadow_rule', content: 'Shadow rule check', required: true, phaseId: 'closing', allowCustom: true },
      { id: 'daily_proof', content: 'Daily proof (journal/photo)', required: true, phaseId: 'closing', allowCustom: true },
      { id: 'tomorrow_priority', content: 'Write tomorrow\'s priority', required: true, phaseId: 'closing', allowCustom: true },
      { id: 'sleep_ritual', content: 'Sleep ritual → 7h minimum', required: true, phaseId: 'closing', allowCustom: false }
    ]
  }
];

export const MARCUS_MESSAGES = {
  empty: {
    shadowJournal: "Your shadow waits. Will you answer?",
    stepsLow: "The March has not begun.",
    waterLow: "The Vessel is empty. Fill it.",
    noTasksComplete: "The Forge awaits your first strike."
  },
  encouragement: {
    phaseComplete: "Phase Won.",
    halfwayThere: "Halfway through the ritual. Keep forging.",
    almostDone: "The day bends to your will."
  },
  completion: {
    dayComplete: "The Forge Holds. Victory is yours.",
    streakContinue: "Another link in the chain. You remain unbroken.",
    firstWin: "Your first victory. The transformation begins."
  },
  resistance: {
    missedTask: "Resistance spotted. Will you answer?",
    streakWarning: "Break now, and the Forge cools.",
    lowProgress: "The shadow tests you. Double down."
  }
};