import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Mail, Lock, User as UserIcon, LogIn, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { User } from '../types';

interface AuthProps {
  onAuthSuccess: (user: User, token: string) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data } = await api.post('/auth/login', { email, password });
      onAuthSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    onAuthSuccess({
      id: -1,
      email: 'visitante@eixo.app',
      name: 'Visitante',
      is_premium: false
    }, 'guest-token');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-4">
          <motion.div 
            className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-100"
            whileHover={{ rotate: 5, scale: 1.05 }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-4xl font-serif italic text-slate-900">Eixo</h1>
            <p className="text-slate-500 font-medium italic">Recomposição Coerente</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-6">
          <div className="text-left space-y-2">
            <h2 className="text-xl font-medium text-slate-800">Entrar com e-mail</h2>
            <p className="text-xs text-slate-400">
              Seu refúgio emocional está a um passo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              id="email-input"
              icon={<Mail className="w-4 h-4" />}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              id="password-input"
              icon={<Lock className="w-4 h-4" />}
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-rose-500 text-[10px] text-center font-medium bg-rose-50 py-2 rounded-lg">{error}</p>}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? 'Sincronizando...' : 'Entrar no Eixo'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-300 tracking-widest">ou</span></div>
          </div>

          <button
            onClick={handleGuestMode}
            className="w-full py-3 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors"
          >
            Acessar como visitante
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-400 px-10 leading-relaxed uppercase tracking-wider font-bold">
          Conta criada no primeiro acesso. <br/>
          Guarde sua senha para futuros logins.
        </p>

        <p className="text-center text-[9px] text-slate-300 px-8 leading-normal italic">
          O Eixo é uma ferramenta de autorregulação e não substitui qualquer forma de terapia ou atendimento especializado.
        </p>
      </motion.div>
    </div>
  );
}

function Input({ 
  icon, 
  id,
  ...props 
}: { icon: React.ReactNode, id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
        {icon}
      </div>
      <input 
        id={id}
        {...props}
        className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
      />
    </div>
  );
}
