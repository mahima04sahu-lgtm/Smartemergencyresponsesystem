import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertTriangle, Shield, Zap, Users, BarChart3, Wifi,
  ArrowRight, CheckCircle, Building2, Star, Globe,
  ChevronRight, Phone, Lock, Brain, Bell
} from 'lucide-react';

const FEATURES = [
  { icon: Zap, title: 'Instant SOS', desc: 'One-tap emergency trigger with AI classification' },
  { icon: Brain, title: 'AI-Powered', desc: 'Gemini AI classifies and escalates emergencies automatically' },
  { icon: Users, title: 'Smart Assignment', desc: 'Auto-assigns nearest available staff in seconds' },
  { icon: BarChart3, title: 'Live Dashboard', desc: 'Real-time monitoring with crisis timeline replay' },
  { icon: Bell, title: 'Mass Alerts', desc: 'Multi-level alert system: staff, managers, everyone' },
  { icon: Globe, title: 'Multi-Location', desc: 'Manage unlimited locations from one control center' },
];

const SYSTEM_TYPES = [
  { label: 'Hotels & Resorts', emoji: '🏨' },
  { label: 'Hospitals', emoji: '🏥' },
  { label: 'Factories', emoji: '🏭' },
  { label: 'Schools', emoji: '🏫' },
  { label: 'Restaurants', emoji: '🍽️' },
  { label: 'Airports', emoji: '✈️' },
  { label: 'Malls', emoji: '🛍️' },
  { label: 'Offices', emoji: '🏢' },
];

const STATS = [
  { value: '< 90s', label: 'Avg Response Time' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '50K+', label: 'Incidents Handled' },
  { value: '120+', label: 'Organizations' },
];

export function Landing() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState(0);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveType(p => (p + 1) % SYSTEM_TYPES.length);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-orange-900/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,50,50,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,50,50,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white">SERS</span>
            <div className="text-[10px] text-red-400 tracking-widest uppercase leading-none">Smart Emergency Response</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/enter-system')}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Enter System
          </button>
          <button
            onClick={() => navigate('/create-system')}
            className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-all shadow-lg shadow-red-600/30 flex items-center gap-2"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/30 rounded-full text-sm text-red-400 mb-8">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <span>Live Emergency Management Platform</span>
        </div>

        {/* Headline */}
        <h1 className={`text-5xl md:text-7xl font-black mb-6 leading-none tracking-tight ${glitch ? 'text-red-400' : 'text-white'} transition-colors duration-100`}>
          Every Second
          <br />
          <span className="text-red-500">Counts</span>
          <span className="text-white">.</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
          Deploy a fully AI-powered emergency response system for your
          <span className="text-white font-medium"> {SYSTEM_TYPES[activeType].emoji} {SYSTEM_TYPES[activeType].label} </span>
          in minutes — not months.
        </p>
        <p className="text-sm text-gray-500 mb-12 max-w-xl mx-auto">
          SOS alerts → AI classification → smart staff dispatch → real-time tracking → resolved.
        </p>

        {/* CTA Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
          {/* Create System */}
          <button
            onClick={() => navigate('/create-system')}
            className="group relative overflow-hidden p-8 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl text-left border border-red-500/30 shadow-2xl shadow-red-600/20 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Create a System</h2>
            <p className="text-red-100 text-sm leading-relaxed mb-6">
              Build your customized emergency platform from scratch. AI will design it around your organization type.
            </p>
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              Get started free <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Enter System */}
          <button
            onClick={() => navigate('/enter-system')}
            className="group relative overflow-hidden p-8 bg-[#111118] rounded-2xl text-left border border-white/10 hover:border-white/20 shadow-xl hover:scale-[1.02] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Enter a System</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Already have an account? Access your existing emergency response system with Gmail or phone number.
            </p>
            <div className="flex items-center gap-2 text-gray-300 font-semibold text-sm">
              Sign in <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-16">
          {['No credit card required', 'Deploy in 5 minutes', 'AI-powered classification', 'GDPR compliant'].map(t => (
            <div key={t} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-black text-red-400 mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 uppercase tracking-widest mb-4">
            Platform Features
          </div>
          <h2 className="text-4xl font-black text-white mb-4">Built for Crisis. Ready for Peace.</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Every feature engineered to minimize response time and maximize coordination.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-6 bg-white/[0.03] border border-white/[0.07] rounded-xl hover:bg-white/[0.06] hover:border-red-600/20 transition-all group"
              >
                <div className="w-10 h-10 bg-red-600/10 border border-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/20 transition-colors">
                  <Icon className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* System types carousel */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="p-8 bg-gradient-to-r from-red-950/40 to-red-900/20 border border-red-600/20 rounded-2xl text-center">
          <p className="text-sm text-gray-400 mb-4 uppercase tracking-widest">Works for Any Industry</p>
          <div className="flex flex-wrap justify-center gap-3">
            {SYSTEM_TYPES.map((t, i) => (
              <span
                key={t.label}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeType === i
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}
              >
                {t.emoji} {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Services Preview */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { emoji: '🚔', label: 'Police', number: '100', color: 'blue' },
            { emoji: '🚑', label: 'Ambulance', number: '108', color: 'red' },
            { emoji: '🚒', label: 'Fire Brigade', number: '101', color: 'orange' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-4 p-5 bg-white/[0.03] border border-white/[0.07] rounded-xl">
              <div className="text-3xl">{s.emoji}</div>
              <div>
                <div className="font-bold text-white">{s.label}</div>
                <div className="text-gray-400 text-sm">Emergency: {s.number}</div>
              </div>
              <div className="ml-auto w-10 h-10 bg-green-600/20 border border-green-600/30 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-400" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-600 mt-4">One-tap emergency calling integrated directly into the guest complaint portal</p>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 text-center">
        <div className="p-12 bg-gradient-to-br from-red-600/20 to-red-900/10 border border-red-600/30 rounded-3xl">
          <h2 className="text-4xl font-black text-white mb-4">Ready to Deploy?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Set up your complete emergency response system in under 5 minutes. AI handles the complexity — you handle the safety.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/create-system')}
              className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Building2 className="w-5 h-5" /> Create Your System
            </button>
            <button
              onClick={() => navigate('/enter-system')}
              className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold border border-white/20 flex items-center justify-center gap-2 transition-all"
            >
              <Lock className="w-5 h-5" /> Enter Existing System
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 md:px-12 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">SERS</span>
            <span className="text-gray-600 text-sm">Smart Emergency Response System</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Support</span>
          </div>
          <p className="text-sm text-gray-700">© 2026 SERS Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
