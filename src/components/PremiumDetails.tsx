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
  const isPremium = user?.is_premium;
  const [isMPConfigured, setIsMPConfigured] = useState(false);

  useEffect(() => {
    api.get('/config/status').then(res => {
      setIsMPConfigured(res.data.mercadopago);
    });
  }, []);

  const handleSubscribe = () => {
    if (!isMPConfigured) {
      alert('Pagamento ainda não configurado neste ambiente.');
      return;
    }
    // In a real app, this would redirect to Mercado Pago Checkout
    alert('Redirecionando para o Mercado Pago...');
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] px-6 py-12 flex flex-col">
      <div className="max-w-md mx-auto w-full space-y-12">
        <header className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-serif italic">Eixo Premium</h1>
        </header>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <div className="space-y-2">
              <span className="text-indigo-600 text-xs font-bold uppercase tracking-[0.2em]">Assinatura Mensal</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-serif italic">R$ 14,90</span>
                <span className="text-slate-400">/mês</span>
              </div>
            </div>

            <div className="space-y-4">
              <Feature icon={<Sparkles className="w-4 h-4 text-indigo-500" />} text="Intervenções Personalizadas Ilimitadas" />
              <Feature icon={<Zap className="w-4 h-4 text-indigo-500" />} text="Eixo Dinâmico (IA-Powered)" />
              <Feature icon={<Shield className="w-4 h-4 text-indigo-500" />} text="Histórico Completo na Nuvem" />
              <Feature icon={<CreditCard className="w-4 h-4 text-indigo-500" />} text="Suporte Prioritário" />
            </div>

            <button
              id="subscribe-btn"
              disabled={isPremium}
              onClick={handleSubscribe}
              className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 ${
                isPremium 
                ? 'bg-emerald-50 text-emerald-600 cursor-default' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
              }`}
            >
              {isPremium ? (
                <>
                  <Check className="w-5 h-5" />
                  Assinatura Ativa
                </>
              ) : (
                'Assinar agora'
              )}
            </button>
          </div>
          
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-50" />
        </div>

        <div className="space-y-6 text-center">
          <p className="text-slate-400 text-xs leading-relaxed px-4">
            Cancele a qualquer momento direto pelo Mercado Pago. O acesso premium é liberado instantaneamente após a confirmação do pagamento.
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
