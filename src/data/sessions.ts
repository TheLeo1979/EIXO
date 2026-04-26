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
  }
];

export const MOOD_MAPPING: Record<MoodType, string[]> = {
  'acelerado': ['box-breathing'],
  'sobrecarregado': ['grounding-54321', 'box-breathing'],
  'travado': ['ambient-focus'],
  'inseguro': ['box-breathing'],
  'desligar': ['night-unwind'],
  'calmo': ['ambient-focus'],
  'cansado': ['night-unwind']
};
