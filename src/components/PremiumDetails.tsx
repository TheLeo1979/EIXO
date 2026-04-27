import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, ArrowLeft, CreditCard, Sparkles, Shield, Zap } from 'lucide-react';
import { User } from '../types';
import api from '../services/api';

interface PremiumDetailsProps {
  user: User | null;
  onBack: () => void;
}

export default function PremiumDetails({ user, onBack }: PremiumDetailsProps) {
  const [subInfo, setSubInfo] = useState<{ status: string; subscription_id?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user || user.id === -1) {
      setLoading(false);
      return;
    }

    api.get('/subscription-status')
      .then(res => {
        setSubInfo(res.data);
        setLoading(false);
      })
      .catch(() => {
        setErrorMsg('Erro ao carregar status da assinatura.');
        setLoading(false);
      });
  }, [user]);

  const handleSubscribe = async () => {
    if (!user || user.id === -1) {
      alert('Por favor, crie uma conta para assinar o Eixo Pleno.');
      return;
    }

    try {
      setErrorMsg('');
      const res = await api.post('/create-subscription');
      if (res.data.init_point) {
        window.location.href = res.data.init_point;
      }
    } catch (e: any) {
      const msg = e.response?.data?.error || 'Erro ao processar assinatura.';
      setErrorMsg(msg);
    }
  };

  const getStatusDisplay = () => {
    if (!subInfo) return null;
    if (['inactive', 'cancelled', 'failed'].includes(subInfo.status)) return null;
    
    switch (subInfo.status) {
      case 'authorized':
        return { label: 'Assinatura Ativa', color: 'bg-emerald-50 text-emerald-600', icon: <Check className="w-5 h-5" /> };
      case 'pending':
        return { label: 'Pagamento em Análise', color: 'bg-amber-50 text-amber-600', icon: <Zap className="w-5 h-5 animate-pulse" /> };
      case 'paused':
        return { label: 'Assinatura Pausada', color: 'bg-slate-100 text-slate-500', icon: <ArrowLeft className="w-5 h-5" /> };
      default:
        return { label: `Status: ${subInfo.status}`, color: 'bg-rose-50 text-rose-600', icon: <Shield className="w-5 h-5" /> };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-[#FDFCFB] px-6 py-12 flex flex-col">
      <div className="max-w-md mx-auto w-full space-y-12">
        <header className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-serif italic">Eixo Premium</h1>
        </header>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-2xl shadow-slate-200/20 relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <div className="space-y-2">
              <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-[0.3em]">Plano Eixo Pleno</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-serif italic text-slate-900">R$ 14,90</span>
                <span className="text-slate-400 font-medium">/mês</span>
              </div>
            </div>

            <div className="space-y-5">
              <Feature icon={<Sparkles className="w-4 h-4 text-indigo-500" />} text="Intervenções Personalizadas Ilimitadas" />
              <Feature icon={<Zap className="w-4 h-4 text-indigo-500" />} text="Histórico Completo na Nuvem" />
              <Feature icon={<Shield className="w-4 h-4 text-indigo-500" />} text="Privacidade Restrita e Segura" />
              <Feature icon={<CreditCard className="w-4 h-4 text-indigo-500" />} text="Suporte ao Desenvolvimento" />
            </div>

            <div className="space-y-4">
              {errorMsg && (
                <p className="text-[10px] text-rose-500 text-center font-bold bg-rose-50 py-2 rounded-lg">{errorMsg}</p>
              )}

              {loading ? (
                <div className="w-full py-4 text-center text-slate-300 text-sm font-medium">Verificando assunatura...</div>
              ) : statusDisplay ? (
                <div className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${statusDisplay.color}`}>
                  {statusDisplay.icon}
                  {statusDisplay.label}
                </div>
              ) : (
                <motion.button
                  id="subscribe-btn"
                  onClick={handleSubscribe}
                  whileHover={{ scale: 1.01, backgroundColor: '#1e293b' }}
                  whileTap={{ scale: 0.98 }}
                  animate={{ 
                    y: [0, -2, 0],
                  }}
                  transition={{ 
                    y: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-200/50 flex items-center justify-center gap-2"
                >
                  Assinar agora
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                </motion.button>
              )}
            </div>
          </div>
          
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="space-y-6 text-center px-4">
          <p className="text-slate-400 text-[10px] leading-relaxed font-medium">
            Assinatura processada de forma segura via Mercado Pago. <br/>
            Cancele a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-1.5 bg-slate-50 rounded-lg">
        {icon}
      </div>
      <span className="text-sm text-slate-600 font-medium">{text}</span>
    </div>
  );
}
