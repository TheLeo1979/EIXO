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
  { type: 'sem conseguir desligar', label: 'Difícil Desligar', icon: Wind, color: 'text-emerald-500' },
  { type: 'calmo', label: 'Calmo', icon: Smile, color: 'text-green-500' },
  { type: 'cansado', label: 'Cansado', icon: Moon, color: 'text-slate-400' },
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
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                },
                exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
              }}
              className="grid grid-cols-2 gap-4"
            >
              {MOODS.map((m) => (
                <motion.button
                  key={m.type}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  id={`mood-${m.type}`}
                  onClick={() => setMood(m.type)}
                  className={`relative p-6 rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col items-center gap-4 group ${
                    mood === m.type 
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-100/50 scale-[1.03]' 
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  {mood === m.type && (
                    <motion.div 
                      layoutId="mood-glow"
                      className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-full"
                    />
                  )}
                  <div className={`p-4 rounded-2xl transition-colors ${mood === m.type ? 'bg-white' : 'bg-slate-50 group-hover:bg-indigo-50'}`}>
                    <m.icon className={`w-8 h-8 ${m.color} transition-transform duration-500 ${mood === m.type ? 'scale-110' : 'group-hover:scale-110'}`} />
                  </div>
                  <span className={`font-bold text-sm transition-colors ${mood === m.type ? 'text-indigo-600' : 'text-slate-600'}`}>
                    {m.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-12 py-10"
            >
              <div className="text-center relative">
                <motion.div 
                  key={intensity}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-8xl font-serif italic text-indigo-600 drop-shadow-sm"
                >
                  {intensity}
                </motion.div>
                <div className="absolute -inset-4 bg-indigo-50 blur-3xl rounded-full -z-10 opacity-50" />
              </div>
              
              <div className="px-2">
                <input 
                  id="intensity-slider"
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 outline-none"
                />
              </div>

              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4">
                <span className={intensity <= 3 ? 'text-indigo-600' : ''}>Leve</span>
                <span className={intensity > 3 && intensity <= 7 ? 'text-indigo-600' : ''}>Moderado</span>
                <span className={intensity > 7 ? 'text-indigo-600' : ''}>Forte</span>
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
