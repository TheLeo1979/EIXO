import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Wind, 
  Moon, 
  Sun, 
  Zap, 
  ChevronRight, 
  CheckCircle2, 
  History, 
  CreditCard,
  User as UserIcon,
  LogOut,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import api from './services/api';
import { User, Session, Mood } from './types';

// Components
import Auth from './components/Auth';
import CheckIn from './components/CheckIn';
import InterventionView from './components/InterventionView';
import PremiumDetails from './components/PremiumDetails';

type View = 'AUTH' | 'DASHBOARD' | 'CHECK_IN' | 'INTERVENTION' | 'PREMIUM' | 'HISTORY';

export default function App() {
  const [view, setView] = useState<View>('AUTH');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<Partial<Session>>({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await api.get('/me');
      setUser(data);
      setView('DASHBOARD');
    } catch (e) {
      setUser(null);
      setView('AUTH');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('eixo_token');
    setUser(null);
    setView('AUTH');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Sparkles className="w-8 h-8 text-indigo-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-indigo-100">
      <AnimatePresence mode="wait">
        {view === 'AUTH' && (
          <div key="auth_wrapper">
            <Auth onAuthSuccess={(u, token) => {
              localStorage.setItem('eixo_token', token);
              setUser(u);
              setView('DASHBOARD');
            }} />
          </div>
        )}

        {view === 'DASHBOARD' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-md mx-auto px-6 py-12 space-y-12"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-serif italic text-slate-800">Eixo</h1>
                <p className="text-slate-500 mt-1">Bem-vindo(a), {user?.name?.split(' ')[0]}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                id="logout-btn"
              >
                <LogOut className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                <h2 className="text-2xl font-medium leading-tight">Como está sua mente agora?</h2>
                <button
                  onClick={() => setView('CHECK_IN')}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-full flex items-center gap-2 font-medium hover:bg-indigo-50 transition-colors w-fit"
                  id="start-checkin-btn"
                >
                  Iniciar Recomposição
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <motion.div 
                className="absolute -right-8 -bottom-8 opacity-20 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-48 h-48" />
              </motion.div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-slate-700">Explorar</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  id="premium-card"
                  icon={<CreditCard className="w-5 h-5 text-indigo-500" />}
                  title="Planos"
                  desc="Acesso ilimitado"
                  onClick={() => setView('PREMIUM')}
                />
                <Card 
                  id="history-card"
                  icon={<History className="w-5 h-5 text-emerald-500" />}
                  title="Histórico"
                  desc="Sua jornada"
                  onClick={() => setView('HISTORY')}
                />
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <p className="text-xs text-center text-slate-400 uppercase tracking-widest font-medium">Recomposição Coerente</p>
            </div>
          </motion.div>
        )}

        {view === 'CHECK_IN' && (
          <div key="checkin_wrapper">
            <CheckIn 
              onComplete={(mood, intensity) => {
                setCurrentSession({ mood, intensity });
                setView('INTERVENTION');
              }}
              onCancel={() => setView('DASHBOARD')}
            />
          </div>
        )}

        {view === 'INTERVENTION' && (
          <div key="intervention_wrapper">
            <InterventionView 
              session={currentSession}
              onComplete={() => setView('DASHBOARD')}
              onCancel={() => setView('DASHBOARD')}
            />
          </div>
        )}

        {view === 'PREMIUM' && (
          <div key="premium_wrapper">
            <PremiumDetails 
              user={user}
              onBack={() => setView('DASHBOARD')}
            />
          </div>
        )}

        {view === 'HISTORY' && (
          <div key="history_wrapper">
            <HistoryView 
              onBack={() => setView('DASHBOARD')}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Card({ icon, title, desc, onClick, id }: { icon: React.ReactNode, title: string, desc: string, onClick: () => void, id: string }) {
  return (
    <button 
      id={id}
      onClick={onClick}
      className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col gap-4 text-left hover:border-indigo-200 transition-all hover:shadow-sm"
    >
      <div className="p-2 bg-slate-50 w-fit rounded-xl">
        {icon}
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-slate-400">{desc}</div>
      </div>
    </button>
  );
}

function HistoryView({ onBack }: { onBack: () => void }) {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    api.get('/sessions/history').then(res => setSessions(res.data));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto px-6 py-12 space-y-8"
    >
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowRight className="w-5 h-5 rotate-180" />
        </button>
        <h1 className="text-2xl font-serif italic">Seu Histórico</h1>
      </header>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-slate-400 text-center py-20">Nenhuma sessão registrada ainda.</p>
        ) : (
          sessions.map(s => (
            <div key={s.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center">
              <div>
                <p className="font-medium capitalize">{s.mood}</p>
                <p className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString()} • Intensidade {s.intensity}/10</p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-full">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
