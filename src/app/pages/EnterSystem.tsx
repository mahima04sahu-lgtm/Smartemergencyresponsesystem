import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, Mail, Phone, ArrowLeft, Loader2, Eye, EyeOff, Lock, ChevronRight, Zap } from 'lucide-react';
import { toast } from 'sonner';

type LoginMethod = 'email' | 'phone';

export function EnterSystem() {
  const navigate = useNavigate();
  const { login, loginByPhone, enterSystem } = useAuth();
  const [method, setMethod] = useState<'code' | 'login'>('code');
  const [accessCode, setAccessCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const DEMO_ACCOUNTS = [
    { label: 'Admin', email: 'admin@grandplaza.com', role: 'admin', color: 'red' },
    { label: 'Staff', email: 'staff1@grandplaza.com', role: 'staff', color: 'blue' },
    { label: 'Guest', email: 'guest@example.com', role: 'guest', color: 'gray' },
  ];

  const handleDemo = async (demoEmail: string) => {
    setLoading(true);
    try {
      const success = await login(demoEmail, 'demo');
      if (success) {
        toast.success('Demo login successful!');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(">>> [Browser] Attempting entry with:", { method, accessCode, email });
    setLoading(true);
    try {
      let success = false;
      if (method === 'code') {
        if (!accessCode || !email) { 
          toast.error('Enter both Access Code and Email'); 
          setLoading(false); 
          return; 
        }
        success = await enterSystem(accessCode, email);
      } else {
        if (!email || !password) { 
          toast.error('Enter email and password'); 
          setLoading(false); 
          return; 
        }
        success = await login(email, password);
      }

      if (success) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        toast.error(method === 'code' ? 'Invalid access code or system error.' : 'Invalid credentials.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Access failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="font-black text-white">SERS</span>
        </div>
        <div className="w-16" />
      </div>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-red-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-red-600/20 border border-red-600/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Access System</h1>
            <p className="text-gray-500 text-sm">Join a system or login to manage</p>
          </div>

          {/* Method toggle */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6 border border-white/10">
            <button
              onClick={() => setMethod('code')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                method === 'code' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" /> Access Code
            </button>
            <button
              onClick={() => setMethod('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                method === 'login' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4" /> Admin Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {method === 'code' ? (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">System Access Code</label>
                  <input
                    type="text" placeholder="ABC-123"
                    value={accessCode} onChange={e => setAccessCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors uppercase font-mono tracking-widest text-center text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Your Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="email" placeholder="you@example.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 mt-2">Entering as staff? Use your registered email. Others enter as guests.</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="email" placeholder="admin@example.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Admin Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="w-full py-3.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <>{method === 'code' ? 'Join System' : 'Manage System'} <ChevronRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-600 uppercase tracking-wider">Demo Access</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Demo accounts */}
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                onClick={() => handleDemo(acc.email)}
                disabled={loading}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/3 hover:bg-white/6 border border-white/[0.07] rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    acc.color === 'red' ? 'bg-red-600/20 text-red-400' :
                    acc.color === 'blue' ? 'bg-blue-600/20 text-blue-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>{acc.label[0]}</div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">Demo {acc.label}</div>
                    <div className="text-xs text-gray-500">{acc.email}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>

          <div className="text-center mt-6">
            <span className="text-gray-500 text-sm">Don't have a system? </span>
            <button onClick={() => navigate('/create-system')} className="text-red-400 hover:text-red-300 text-sm font-medium">Create one free →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
