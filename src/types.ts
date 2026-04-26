export interface User {
  id: number;
  email: string;
  name: string;
  is_premium: boolean;
}

export interface Session {
  id: number;
  moodBefore: MoodType;
  intensityBefore: number;
  moodAfter?: MoodType;
  intensityAfter?: number;
  feedback?: string;
  interventionId: string;
  completed: boolean;
  duration?: number;
  created_at: string;
}

export type MoodType = 
  | 'acelerado' 
  | 'sobrecarregado' 
  | 'travado' 
  | 'inseguro' 
  | 'desligar'
  | 'calmo'
  | 'cansado';

export interface Intervention {
  id: string;
  title: string;
  description: string;
  type: 'breathing' | 'audio' | 'text' | 'external';
  duration: string;
  icon: string;
  url?: string;
}
