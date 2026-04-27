import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Timer, CheckCircle, ArrowLeft, RefreshCcw, Sparkles, ExternalLink, Play, Focus, Moon } from 'lucide-react';
import api from '../services/api';
import { Session, Intervention } from '../types';
import { INTERVENTIONS } from '../data/sessions';

interface InterventionViewProps {
  session: Partial<Session>;
  onComplete: () => void;
  onCancel: () => void;
}

export default function InterventionView({ session, onComplete, onCancel }: InterventionViewProps) {
  const [stage, setStage] = useState<'PREPARING' | 'ACTIVE' | 'FINISHED'>('PREPARING');
  const [breathingStep, setBreathingStep] = useState(0); 
  const [cycles, setCycles] = useState(0);

  const intervention = INTERVENTIONS.find(i => i.id === session.interventionId) || INTERVENTIONS[0];

  useEffect(() => {
    if (stage === 'ACTIVE' && intervention.type === 'breathing') {
      const timer = setInterval(() => {
        setBreathingStep(prev => (prev + 1) % 4);
      }, 4000);
      return () => clearInterval(timer);
    }
    
    if (stage === 'ACTIVE' && intervention.type === 'audio') {
      const audio = new Audio(intervention.id === 'ambient-focus' 
        ? '/audio/ambient-focus.mp3' 
        : '/audio/night-unwind.mp3'
      );
      audio.play().catch(e => console.warn('Audio playback prevented by browser', e));
      
      return () => {
        audio.pause();
        audio.src = '';
      };
    }

    // Auto-finish non-interactive text sessions after some time
    if (stage === 'ACTIVE' && intervention.type === 'text') {
      const timer = setTimeout(() => {
        setStage('FINISHED');
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [stage, intervention.type, intervention.id]);

  useEffect(() => {
    if (breathingStep === 0 && stage === 'ACTIVE' && intervention.type === 'breathing') {
      setCycles(prev => prev + 1);
    }
    if (cycles > 4 && intervention.type === 'breathing') {
      setStage('FINISHED');
    }
  }, [breathingStep, stage, cycles, intervention.type]);

  const steps = [
    { text: 'Inspire...', color: 'bg-indigo-400' },
    { text: 'Segure...', color: 'bg-indigo-500' },
    { text: 'Expire...', color: 'bg-indigo-600' },
    { text: 'Aguarde...', color: 'bg-indigo-700' },
  ];

  const handleFinish = async () => {
    onComplete();
  };

  const Icon = intervention.icon === 'Wind' ? Wind : intervention.icon === 'Focus' ? Focus : intervention.icon === 'Moon' ? Moon : Sparkles;

  return (
    <div className={`min-h-screen ${stage === 'ACTIVE' ? 'bg-slate-950' : 'bg-[#FDFCFB]'} text-slate-900 transition-colors duration-1000 flex flex-col p-8`}>
      <AnimatePresence mode="wait">
        {stage === 'PREPARING' && (
          <motion.div 
            key="preparing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center space-y-12 text-center"
          >
            <div className="space-y-6">
              <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm">
                <Icon className="w-12 h-12 text-indigo-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-serif italic">{intervention.title}</h1>
                <p className="text-slate-500 max-w-xs mx-auto">
                  {intervention.description}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest">
                <Timer className="w-3 link-3" />
                {intervention.duration}
              </div>
            </div>
            
            <div className="flex flex-col w-full max-w-xs gap-4">
              <button
                id="start-intervention-btn"
                onClick={() => setStage('ACTIVE')}
                className="bg-slate-900 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5 fill-current" />
                Iniciar Sessão
              </button>
              <button onClick={onCancel} className="text-slate-400 text-sm hover:text-slate-600 font-medium py-2">
                Agora não
              </button>
            </div>
          </motion.div>
        )}

        {stage === 'ACTIVE' && (
          <motion.div 
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-white"
          >
            {intervention.type === 'breathing' ? (
              <div className="flex flex-col items-center space-y-20">
                <div className="relative flex items-center justify-center">
                  <motion.div 
                    className="w-72 h-72 rounded-[3.5rem] border-8 border-indigo-500/20 flex items-center justify-center"
                    animate={{ 
                      scale: breathingStep === 0 ? 1.3 : breathingStep === 2 ? 1 : undefined,
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
                    <motion.span 
                      key={breathingStep}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-3xl font-serif italic"
                    >
                      {steps[breathingStep].text}
                    </motion.span>
                    <span className="text-[10px] text-indigo-400 uppercase tracking-[0.2em] font-bold">Ciclo {cycles}/4</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 w-10 rounded-full transition-all duration-1000 ${i === breathingStep ? 'bg-indigo-400' : 'bg-slate-800'}`} 
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-8 max-w-xs">
                <div className="p-12 bg-white/5 rounded-[3rem] backdrop-blur-xl border border-white/10">
                   <Sparkles className="w-16 h-16 text-indigo-400 mx-auto animate-pulse" />
                </div>
                <h2 className="text-2xl font-serif italic">Prática em andamento...</h2>
                <p className="text-slate-400 text-sm leading-relaxed">Mantenha o foco. Deixe que a experiência guie você de volta ao centro.</p>
                <button 
                  onClick={() => setStage('FINISHED')}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Concluir Prática
                </button>
              </div>
            )}
          </motion.div>
        )}

        {stage === 'FINISHED' && (
          <motion.div 
            key="finished"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center space-y-12 text-center"
          >
            <div className="space-y-8">
              <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-serif italic">Centro retomado.</h2>
                <p className="text-slate-500">Prática concluída com sucesso.</p>
              </div>
            </div>
            
            <button
              id="finish-intervention-btn"
              onClick={handleFinish}
              className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center gap-3"
            >
              Próximo
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
