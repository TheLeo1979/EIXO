import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Session, MoodType } from '../types';
import { ArrowLeft, Calendar, TrendingUp, Sparkles, Heart } from 'lucide-react';
import api from '../services/api';

interface ProgressViewProps {
  onBack: () => void;
}

export default function ProgressView({ onBack }: ProgressViewProps) {
  const [history, setHistory] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('eixo_token');
    
    if (token === 'guest-token') {
      const guestHistory = JSON.parse(localStorage.getItem('eixo_guest_history') || '[]');
      setHistory(guestHistory);
      setLoading(false);
    } else {
      api.get('/sessions/history')
        .then(res => {
          setHistory(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, []);

  const totalSessions = history.length;
  const lastSession = history[0];

  return (
    <div className="min-h-screen bg-[#FDFCFB] px-6 py-12">
      <div className="max-w-md mx-auto space-y-12">
        <header className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-serif italic text-slate-900">Sua Jornada</h1>
        </header>

        <div className="grid grid-cols-2 gap-4">
          <StatsCard 
            label="Sessões" 
            value={totalSessions.toString()} 
            icon={<TrendingUp className="w-4 h-4 text-indigo-500" />} 
          />
          <StatsCard 
            label="Última" 
            value={lastSession ? new Date(lastSession.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : '--'} 
            icon={<Calendar className="w-4 h-4 text-emerald-500" />} 
          />
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] px-2">Recapitulativo</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center text-slate-400">Carregando história...</div>
            ) : history.length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-white rounded-[2rem] border border-dashed border-slate-200">
                <Sparkles className="w-8 h-8 text-slate-200 mx-auto" />
                <p className="text-sm text-slate-400">Nenhuma recomposição registrada ainda.</p>
              </div>
            ) : (
              history.map((s, i) => (
                <div key={s.id || i}>
                  <HistoryItem session={s} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2">
      <div className="flex justify-between items-center text-slate-400">
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-serif italic text-slate-900">{value}</div>
    </div>
  );
}

function HistoryItem({ session }: { session: Session }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4 group hover:border-indigo-100 transition-colors"
    >
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
        <Heart className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-baseline">
          <p className="font-medium text-slate-800 capitalize">{session.moodBefore}</p>
          <span className="text-[10px] text-slate-300 font-medium">{new Date(session.created_at).toLocaleDateString()}</span>
        </div>
        <p className="text-xs text-slate-400 line-clamp-1">
          {session.interventionId === 'box-breathing' ? 'Respiração Quadrada' : session.interventionId} • {session.intensityBefore}/10
        </p>
      </div>
    </motion.div>
  );
}
