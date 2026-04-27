import { MoodType } from '../types';

export function getIntensityLevel(intensity: number): 'leve' | 'moderado' | 'forte' {
  if (intensity <= 3) return 'leve';
  if (intensity <= 7) return 'moderado';
  return 'forte';
}

export function getAudioDuration(intensity: number): number {
  if (intensity <= 3) return 5;
  if (intensity <= 7) return 10;
  return 15;
}

export function getAudioPath(mood: MoodType, intensity: number): string {
  const level = getIntensityLevel(intensity);
  const duration = getAudioDuration(intensity);
  
  // Normalize mood name for filename
  let moodKey = mood.toLowerCase();
  if (moodKey === 'sem conseguir desligar') {
    moodKey = 'desligar';
  }
  
  return `/audio/${moodKey}-${level}-${duration}.mp3`;
}
