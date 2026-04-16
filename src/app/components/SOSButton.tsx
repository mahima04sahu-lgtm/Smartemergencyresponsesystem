import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router';

interface SOSButtonProps {
  size?: 'sm' | 'default' | 'lg' | 'xl';
  className?: string;
}

export function SOSButton({ size = 'sm', className = '' }: SOSButtonProps) {
  const navigate = useNavigate();

  if (size === 'sm') {
    return (
      <button
        onClick={() => navigate('/emergency-report')}
        className={`flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-sm shadow-lg shadow-red-600/30 animate-pulse hover:animate-none transition-all hover:scale-105 ${className}`}
      >
        <AlertTriangle className="w-4 h-4" />
        SOS
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate('/emergency-report')}
      className={`bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 animate-pulse flex flex-col items-center justify-center gap-1 ${
        size === 'xl' ? 'h-32 w-32 text-2xl rounded-full' :
        size === 'lg' ? 'h-24 w-24 text-xl rounded-full' :
        'h-16 w-16 text-lg rounded-full'
      } ${className}`}
    >
      <AlertTriangle className={size === 'xl' ? 'w-10 h-10' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5'} />
      <span className={size === 'xl' ? 'text-lg' : 'text-xs'}>SOS</span>
    </button>
  );
}
