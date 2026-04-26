export interface User {
  id: number;
  email: string;
  name: string;
  is_premium: boolean;
}

export interface Session {
  id: number;
  mood: string;
  intensity: number;
  intervention_type: string;
  completed: boolean;
  created_at: string;
}

export type Mood = 'calm' | 'anxious' | 'sad' | 'energetic' | 'tired';

export interface Intervention {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
}
