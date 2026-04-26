import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smile, 
  Frown, 
  Zap, 
  Moon, 
  Wind, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Heart
} from 'lucide-react';
import { MoodType } from '../types';

interface CheckInProps {
  onComplete: (mood: MoodType, intensity: number) => void;
  onCancel: () => void;
}

const MOODS: { type: MoodType; label: string; icon: any; color: string }[] = [
  { type: 'acelerado', label: 'Acelerado', icon: Zap, color: 'text-amber-500' },
  { type: 'sobrecarregado', label: 'Sobrecarregado', icon: Heart, color: 'text-rose-500' },
  { type: 'travado', label: 'Travado', icon: Moon, color: 'text-indigo-500' },
  { type: 'inseguro', label: 'Inseguro', icon: Frown, color: 'text-blue-500' },
  { type: 'desligar', label: 'Difícil Desligar', icon: Wind, color: 'text-emerald-500' },
  { type: 'calmo', label: 'Calmo', icon: Smile, color: 'text-green-500' },
];

export default function CheckIn({ onComplete, onCancel }: CheckInProps) {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<MoodType | null>(null);
  const [intensity, setIntensity] = useState(5);

  const handleNext = () => {
    if (step === 1 && mood) setStep(2);
    else if (step === 2) onComplete(mood!, intensity);
  };

  return (
    <div className="min-h-screen bg-white px-6 py-12 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center space-y-12">
        
        <header className="space-y-2">
          <div className="flex justify-between items-center mb-6">
             <button onClick={onCancel} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1">
              {[1, 2].map(s => (
                <div key={s} className={`h-1 w-8 rounded-full transition-all ${s <= step ? 'bg-indigo-600' : 'bg-slate-100'}`} />
              ))}
            </div>
          </div>
          <h1 className="text-3xl font-serif italic">
            {step === 1 ? 'Como você se sente?' : 'Qual a intensidade?'}
          </h1>
          <p className="text-slate-500">
            {step === 1 ? 'Selecione a emoção que melhor descreve seu agora.' : 'De 1 (suave) a 10 (avassalador).'}
          </p>
        </header>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-2 gap-4"
            >
              {MOODS.map((m) => (
                <button
                  key={m.type}
                  id={`mood-${m.type}`}
                  onClick={() => setMood(m.type)}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${
                    mood === m.type 
                    ? 'border-indigo-600 bg-indigo-50/50' 
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <m.icon className={`w-8 h-8 ${m.color}`} />
                  <span className="font-medium text-sm text-slate-700">{m.label}</span>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12 py-8"
            >
              <div className="text-center">
                <span className="text-7xl font-serif italic text-indigo-600">{intensity}</span>
              </div>
              <input 
                id="intensity-slider"
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs font-medium text-slate-400 uppercase tracking-widest px-1">
                <span>Leve</span>
                <span>Moderado</span>
                <span>Forte</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-8">
          <button
            id="checkin-next-btn"
            disabled={step === 1 && !mood}
            onClick={handleNext}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-2 disabled:opacity-30 transition-all hover:bg-slate-800"
          >
            {step === 1 ? 'Próximo' : 'Gerar Intervenção'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
