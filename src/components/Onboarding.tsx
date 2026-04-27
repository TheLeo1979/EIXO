import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Wind, Moon, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: 'Bem-vindo ao seu Eixo',
    desc: 'Um espaço para recomposição emocional imediata e desaceleração noturna.',
    icon: Sparkles,
    color: 'bg-indigo-600'
  },
  {
    title: 'Escuta Ativa',
    desc: 'Diga-nos como você se sente e nós recomendaremos a melhor prática para o seu agora.',
    icon: Heart,
    color: 'bg-rose-500'
  },
  {
    title: 'Respiração e Apoio',
    desc: 'Intervenções táticas guiadas para trazer você de volta ao centro.',
    icon: Wind,
    color: 'bg-emerald-500'
  },
  {
    title: 'Segurança Importante',
    desc: 'O Eixo oferece práticas de autorregulação. Não substitui atendimento médico ou psicológico. Em crises, procure ajuda profissional.',
    icon: Moon,
    color: 'bg-indigo-900'
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < STEPS.length - 1) setCurrent(current + 1);
    else onComplete();
  };

  const StepIcon = STEPS[current].icon;

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col justify-center px-8">
      <div className="max-w-sm mx-auto w-full space-y-12 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className={`w-24 h-24 ${STEPS[current].color} rounded-[2rem] flex items-center justify-center mx-auto shadow-xl`}>
              <StepIcon className="w-12 h-12 text-white" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-serif italic text-slate-900">{STEPS[current].title}</h1>
              <p className="text-slate-500 leading-relaxed">{STEPS[current].desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="space-y-6">
          <div className="flex justify-center gap-2">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === current ? 'w-8 bg-slate-900' : 'w-2 bg-slate-200'}`} />
            ))}
          </div>

          <button
            onClick={next}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            {current === STEPS.length - 1 ? 'Começar' : 'Próximo'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
