import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Timer, CheckCircle, ArrowLeft, RefreshCcw, Sparkles } from 'lucide-react';
import api from '../services/api';
import { Session } from '../types';

interface InterventionViewProps {
  session: Partial<Session>;
  onComplete: () => void;
  onCancel: () => void;
}

export default function InterventionView({ session, onComplete, onCancel }: InterventionViewProps) {
  const [stage, setStage] = useState<'PREPARING' | 'ACTIVE' | 'FINISHED'>('PREPARING');
  const [breathingStep, setBreathingStep] = useState(0); // 0: Inhale, 1: Hold, 2: Exhale, 3: Hold
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (stage === 'ACTIVE') {
      const timer = setInterval(() => {
        setBreathingStep(prev => (prev + 1) % 4);
      }, 4000); // 4 seconds per phase

      return () => clearInterval(timer);
    }
  }, [stage]);

  useEffect(() => {
    if (breathingStep === 0 && stage === 'ACTIVE') {
      setCycles(prev => prev + 1);
    }
    if (cycles > 4) {
      setStage('FINISHED');
      saveSession();
    }
  }, [breathingStep, stage, cycles]);

  const saveSession = async () => {
    try {
      await api.post('/sessions', {
        ...session,
        intervention_type: 'Box Breathing',
        completed: true
      });
    } catch (e) {
      console.error('Failed to save session');
    }
  };

  const steps = [
    { text: 'Inspire...', color: 'bg-indigo-400' },
    { text: 'Segure...', color: 'bg-indigo-500' },
    { text: 'Expire...', color: 'bg-indigo-600' },
    { text: 'Aguarde...', color: 'bg-indigo-700' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-8">
      <AnimatePresence mode="wait">
        {stage === 'PREPARING' && (
          <motion.div 
            key="preparing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center space-y-12 text-center"
          >
            <div className="space-y-4">
              <Sparkles className="w-12 h-12 text-indigo-400 mx-auto" />
              <h1 className="text-3xl font-serif italic italic">Respiração Quadrada</h1>
              <p className="text-slate-400 max-w-xs mx-auto">
                Uma técnica simples para estabilizar o sistema nervoso. Siga o ritmo.
              </p>
            </div>
            <button
              id="start-intervention-btn"
              onClick={() => setStage('ACTIVE')}
              className="bg-white text-slate-900 px-8 py-4 rounded-full font-medium text-lg hover:scale-105 transition-transform"
            >
              Começar agora
            </button>
            <button onClick={onCancel} className="text-slate-500 text-sm hover:text-slate-300">
              Agora não
            </button>
          </motion.div>
        )}

        {stage === 'ACTIVE' && (
          <motion.div 
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center space-y-16"
          >
            <div className="relative flex items-center justify-center">
              <motion.div 
                className={`w-64 h-64 rounded-3xl border-4 border-indigo-500/30 flex items-center justify-center`}
                animate={{ 
                  scale: breathingStep === 0 ? 1.4 : breathingStep === 2 ? 1 : undefined,
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
                <span className="text-2xl font-medium tracking-tight">{steps[breathingStep].text}</span>
                <span className="text-xs text-slate-500 uppercase tracking-widest">Ciclo {cycles}/4</span>
              </div>
            </div>

            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 w-8 rounded-full transition-all duration-1000 ${i === breathingStep ? 'bg-indigo-400' : 'bg-slate-800'}`} 
                />
              ))}
            </div>
          </motion.div>
        )}

        {stage === 'FINISHED' && (
          <motion.div 
            key="finished"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center space-y-12 text-center"
          >
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-serif italic">Centro retomado.</h2>
              <p className="text-slate-400">Você completou sua prática de recomposição.</p>
            </div>
            <button
              id="finish-intervention-btn"
              onClick={onComplete}
              className="bg-white text-slate-900 px-10 py-4 rounded-full font-medium hover:scale-105 transition-transform"
            >
              Concluir
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
