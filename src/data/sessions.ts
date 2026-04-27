import { Intervention, MoodType } from '../types';

export const INTERVENTIONS: Intervention[] = [
  {
    id: 'box-breathing',
    title: 'Respiração Quadrada',
    description: 'Técnica de estabilização rápida para estados de ansiedade e aceleração.',
    type: 'breathing',
    duration: '4 min',
    icon: 'Wind'
  },
  {
    id: 'grounding-54321',
    title: 'Técnica 5-4-3-2-1',
    description: 'Conecte-se com o presente através dos seus sentidos para reduzir o sobrecarga.',
    type: 'text',
    duration: '5 min',
    icon: 'Focus'
  },
  {
    id: 'ambient-focus',
    title: 'Frequência de Foco',
    description: 'Sons binaurais para ajudar a destravar a mente em estados de paralisia.',
    type: 'audio',
    duration: '10 min',
    icon: 'Zap'
  },
  {
    id: 'night-unwind',
    title: 'Desaceleração Noturna',
    description: 'Condução suave para preparar o corpo e a mente para o sono.',
    type: 'audio',
    duration: '15 min',
    icon: 'Moon'
  },
  {
    id: 'dynamic-audio',
    title: 'Sessão Sonora Eixo',
    description: 'Imersão sonora personalizada para o seu estado emocional e intensidade.',
    type: 'audio',
    duration: 'Var.',
    icon: 'Focus'
  }
];

export const MOOD_MAPPING: Record<MoodType, string[]> = {
  'acelerado': ['box-breathing', 'dynamic-audio'],
  'sobrecarregado': ['grounding-54321', 'dynamic-audio'],
  'travado': ['dynamic-audio', 'ambient-focus'],
  'inseguro': ['dynamic-audio', 'box-breathing'],
  'sem conseguir desligar': ['dynamic-audio', 'night-unwind'],
  'calmo': ['dynamic-audio', 'ambient-focus'],
  'cansado': ['dynamic-audio', 'night-unwind']
};

export function getRecommendedIntervention(mood: MoodType, intensity: number): string {
  const options = MOOD_MAPPING[mood] || ['box-breathing'];
  
  // Logic: For very high intensity in activation states, prioritize structural tools (breathing/grounding)
  if (intensity >= 8) {
    if (mood === 'acelerado' || mood === 'sobrecarregado') {
      return options.find(id => id !== 'dynamic-audio') || options[0];
    }
  }
  
  // Default to the first option (which is often dynamic-audio)
  return options[0];
}
