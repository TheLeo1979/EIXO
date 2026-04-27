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
import { User, Session, MoodType, Intervention } from './types';
import { MOOD_MAPPING, getRecommendedIntervention } from './data/sessions';

// Components
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import CheckIn from './components/CheckIn';
import InterventionView from './components/InterventionView';
import FeedbackView from './components/FeedbackView';
import PremiumDetails from './components/PremiumDetails';
import ProgressView from './components/ProgressView';

import AudioDebugView from './components/AudioDebugView';

type View = 'AUTH' | 'ONBOARDING' | 'DASHBOARD' | 'CHECK_IN' | 'INTERVENTION' | 'FEEDBACK' | 'PREMIUM' | 'PROGRESS' | 'DEBUG_AUDIO';

export default function App() {
  const [view, setView] = useState<View>('AUTH');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<Partial<Session>>({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('eixo_token');
    
    if (!token) {
      setLoading(false);
      setView('AUTH');
      return;
    }

    if (token === 'guest-token') {
      setUser({
        id: -1,
        email: 'visitante@eixo.app',
        name: 'Visitante',
        is_premium: false
      });
      setView('DASHBOARD');
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/me');
      setUser(data);
      const isOnboarded = localStorage.getItem(`eixo_onboarded_${data.id}`);
      setView(isOnboarded ? 'DASHBOARD' : 'ONBOARDING');
    } catch (e) {
      localStorage.removeItem('eixo_token');
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

  const handleOnboardingComplete = () => {
    if (user) localStorage.setItem(`eixo_onboarded_${user.id}`, 'true');
    setView('DASHBOARD');
  };

  const handleCheckInComplete = async (mood: MoodType, intensity: number) => {
    // Check for daily limit if not premium
    if (!user?.is_premium) {
      if (user?.id === -1) {
        // Guest mode: check localStorage
        const history = JSON.parse(localStorage.getItem('eixo_guest_history') || '[]');
        const sessionsToday = history.filter((s: any) => {
          const date = new Date(s.created_at || s.date);
          return date.toDateString() === new Date().toDateString();
        });

        if (sessionsToday.length >= 1) {
          alert('Limite diário atingido. Assine o Plano Pleno para sessões ilimitadas e histórico na nuvem.');
          setView('PREMIUM');
          return;
        }
      } else {
        // Logged-in non-premium: check backend
        try {
          const { data } = await api.get('/sessions/today-count');
          if (data.count >= 1) {
            alert('Limite diário atingido. Assine o Plano Pleno para sessões ilimitadas e histórico na nuvem.');
            setView('PREMIUM');
            return;
          }
        } catch (e) {
          console.error('Failed to check daily limit:', e);
          alert('Não foi possível verificar seu limite diário agora. Tente novamente em instantes.');
          return;
        }
      }
    }

    const interventionId = getRecommendedIntervention(mood, intensity);
    setCurrentSession({
      moodBefore: mood,
      intensityBefore: intensity,
      interventionId
    });
    setView('INTERVENTION');
  };

  const handleInterventionComplete = () => {
    setView('FEEDBACK');
  };

  const handleFeedbackComplete = async (moodAfter: MoodType, feedback: string) => {
    const sessionData = {
      ...currentSession,
      moodAfter,
      feedback,
      completed: true
    };
    
    try {
      if (user && user.id !== -1) {
        await api.post('/sessions', sessionData);
      } else {
        // Guest mode: save to local storage
        const guestHistory = JSON.parse(localStorage.getItem('eixo_guest_history') || '[]');
        guestHistory.unshift({ ...sessionData, id: Date.now(), created_at: new Date().toISOString() });
        localStorage.setItem('eixo_guest_history', JSON.stringify(guestHistory.slice(0, 50)));
      }
    } catch (e) {
      console.error('Failed to sync session');
      alert('Sessão registrada localmente, mas não conseguimos sincronizar com a nuvem agora.');
    }
    
    setView('DASHBOARD');
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

        {view === 'ONBOARDING' && (
          <div key="onboarding_wrapper">
            <Onboarding onComplete={handleOnboardingComplete} />
          </div>
        )}

        {view === 'DASHBOARD' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto px-6 py-12 space-y-12"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-serif italic text-slate-950">Eixo</h1>
                <p className="text-slate-400 font-medium mt-1">Olá, {user?.name?.split(' ')[0]}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 hover:text-slate-600 transition-all hover:border-slate-200"
                id="logout-btn"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-serif italic leading-tight">Como está sua<br/>mente agora?</h2>
                  <p className="text-indigo-100 text-sm leading-relaxed max-w-[200px]">Uma pequena pausa pode mudar todo o seu dia.</p>
                </div>
                <button
                  onClick={() => setView('CHECK_IN')}
                  className="bg-white text-indigo-600 px-8 py-4 rounded-2xl flex items-center gap-3 font-bold hover:bg-slate-50 transition-all shadow-lg active:scale-95"
                  id="start-checkin-btn"
                >
                  Iniciar Recomposição
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <motion.div 
                className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-64 h-64" />
              </motion.div>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] px-2 text-center">Explorar</h3>
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
                  title="Jornada"
                  desc="Seu progresso"
                  onClick={() => setView('PROGRESS')}
                />
              </div>
              <div className="flex justify-center mt-4">
                <button 
                  onClick={() => setView('DEBUG_AUDIO')}
                  className="text-[8px] text-slate-300 hover:text-slate-400 font-bold uppercase tracking-widest"
                >
                  Debug Audio
                </button>
              </div>
            </div>

            <footer className="pt-12 text-center space-y-6">
               <div className="space-y-2">
                 <p className="text-[10px] text-slate-400 leading-relaxed max-w-[280px] mx-auto italic">
                   O Eixo oferece práticas breves de autorregulação emocional. Não substitui atendimento médico, psicológico ou emergencial.
                 </p>
                 <div className="flex justify-center gap-4 text-[9px] font-bold uppercase tracking-widest text-slate-300">
                    <button className="hover:text-slate-500 transition-colors">Termos</button>
                    <button className="hover:text-slate-500 transition-colors">Privacidade</button>
                 </div>
               </div>
               <div className="flex justify-center gap-6">
                 <div className="w-1.5 h-1.5 bg-slate-100 rounded-full"></div>
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                 <div className="w-1.5 h-1.5 bg-slate-100 rounded-full"></div>
               </div>
            </footer>
          </motion.div>
        )}

        {view === 'CHECK_IN' && (
          <div key="checkin_wrapper">
            <CheckIn 
              onComplete={handleCheckInComplete}
              onCancel={() => setView('DASHBOARD')}
            />
          </div>
        )}

        {view === 'INTERVENTION' && (
          <div key="intervention_wrapper">
            <InterventionView 
              session={currentSession}
              onComplete={handleInterventionComplete}
              onCancel={() => setView('DASHBOARD')}
            />
          </div>
        )}

        {view === 'FEEDBACK' && (
          <div key="feedback_wrapper">
            <FeedbackView 
              onComplete={handleFeedbackComplete}
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

        {view === 'PROGRESS' && (
          <div key="progress_wrapper">
            <ProgressView 
              onBack={() => setView('DASHBOARD')}
            />
          </div>
        )}

        {view === 'DEBUG_AUDIO' && (
          <div key="debug_audio_wrapper">
            <AudioDebugView onBack={() => setView('DASHBOARD')} />
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
      className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-4 text-left hover:border-indigo-100 transition-all hover:shadow-lg active:scale-95 group"
    >
      <div className="p-3 bg-slate-50 w-fit rounded-2xl group-hover:bg-indigo-50 transition-colors">
        {icon}
      </div>
      <div>
        <div className="font-bold text-slate-800">{title}</div>
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{desc}</div>
      </div>
    </button>
  );
}
