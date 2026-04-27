import React, { useState, useRef } from 'react';
import { Play, Square, CheckCircle, XCircle, ArrowLeft, Music } from 'lucide-react';
import { MoodType } from '../types';
import { getAudioPath } from '../lib/utils';

const MOODS: MoodType[] = [
  'acelerado',
  'sobrecarregado',
  'travado',
  'inseguro',
  'sem conseguir desligar',
  'calmo',
  'cansado'
];

const LEVELS: ('leve' | 'moderado' | 'forte')[] = ['leve', 'moderado', 'forte'];

const INTENSITY_MAP = {
  'leve': 2,
  'moderado': 5,
  'forte': 9
};

interface AudioItemProps {
  mood: MoodType;
  level: 'leve' | 'moderado' | 'forte';
}

const AudioItem: React.FC<AudioItemProps> = ({ mood, level }) => {
  const intensity = INTENSITY_MAP[level];
  const path = getAudioPath(mood, intensity);
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error' | 'success'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setStatus('loading');
    const audio = new Audio(path);
    audioRef.current = audio;

    audio.oncanplaythrough = () => {
      setStatus('playing');
      audio.play().catch(() => setStatus('error'));
    };

    audio.onerror = () => {
      setStatus('error');
    };

    audio.onended = () => {
      setStatus('success');
    };
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setStatus('idle');
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
      <div className="flex flex-col">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-tighter">{mood}</span>
        <span className="text-sm font-medium text-slate-200 capitalize">{level} (
          {level === 'leve' ? '5' : level === 'moderado' ? '10' : '15'} min)
        </span>
        <span className="text-[10px] text-slate-500 truncate max-w-[200px]">{path}</span>
      </div>
      
      <div className="flex items-center gap-2">
        {status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
        {status === 'playing' && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
        
        {status === 'playing' ? (
          <button 
            onClick={handleStop}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full text-white transition-all shadow-lg"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button 
            onClick={handlePlay}
            disabled={status === 'loading'}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white transition-all shadow-lg disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
};

export default function AudioDebugView({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200">
      <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-lg font-serif italic text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-indigo-400" />
            Audio Debug Library
          </h1>
          <p className="text-xs text-slate-500">Validação da estrutura de 21 arquivos /public/audio/*.mp3</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-12">
        {MOODS.map(mood => (
          <div key={mood} className="space-y-3">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] px-1 border-l-2 border-indigo-500 shadow-sm">
              {mood === 'sem conseguir desligar' ? 'Difícil Desligar' : mood}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {LEVELS.map(level => (
                <AudioItem key={`${mood}-${level}`} mood={mood} level={level} />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-amber-900/20 border-t border-amber-900/30 text-amber-200/80 text-[10px] uppercase tracking-widest text-center">
        Ambiente de Desenvolvimento • Verificação Técnica de Assets
      </div>
    </div>
  );
}
