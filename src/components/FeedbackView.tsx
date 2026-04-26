import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MoodType } from '../types';
import { Smile, Frown, Meh, ArrowRight, Heart } from 'lucide-react';

interface FeedbackViewProps {
  onComplete: (moodAfter: MoodType, feedback: string) => void;
}

const FEEDBACK_MOODS: { type: MoodType; icon: any; label: string }[] = [
  { type: 'calmo', icon: Smile, label: 'Melhor' },
  { type: 'travado', icon: Meh, label: 'Igual' },
  { type: 'sobrecarregado', icon: Frown, label: 'Ainda difícil' },
];

export default function FeedbackView({ onComplete }: FeedbackViewProps) {
  const [moodAfter, setMoodAfter] = useState<MoodType | null>(null);
  const [feedback, setFeedback] = useState('');

  return (
    <div className="min-h-screen bg-white px-8 py-12 flex flex-col justify-center">
      <div className="max-w-sm mx-auto w-full space-y-12">
        <header className="text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-3xl font-serif italic text-slate-900">Como você se sente agora?</h1>
          <p className="text-slate-500">Sua percepção ajuda a refinar sua jornada.</p>
        </header>

        <div className="flex justify-center gap-6">
          {FEEDBACK_MOODS.map(m => (
            <button
              key={m.type}
              onClick={() => setMoodAfter(m.type)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                moodAfter === m.type ? 'bg-indigo-50 text-indigo-600 scale-110' : 'text-slate-400 grayscale'
              }`}
            >
              <m.icon className="w-10 h-10" />
              <span className="text-xs font-medium">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <textarea
            placeholder="Alguma nota sobre esta sessão? (opcional)"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl p-6 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none h-32"
          />

          <button
            onClick={() => moodAfter && onComplete(moodAfter, feedback)}
            disabled={!moodAfter}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-30"
          >
            Salvar na Jornada
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
