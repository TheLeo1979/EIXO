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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-3">
          <motion.div 
            className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-100"
            whileHover={{ rotate: 10 }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-serif italic">Eixo</h1>
          <p className="text-slate-500 text-sm">Respire. Recomponha seu centro.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-medium text-slate-800">Entrar com e-mail</h2>
            <p className="text-xs text-slate-400 mt-2">
              Se for seu primeiro acesso, sua conta será criada automaticamente.
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
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-rose-500 text-xs text-center">{error}</p>}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Acessar Eixo'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 px-8 leading-relaxed">
          O Google Login está temporariamente desativado nesta versão MVP.
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
