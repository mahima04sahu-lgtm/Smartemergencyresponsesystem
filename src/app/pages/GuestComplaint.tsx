import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import {
  AlertTriangle, Phone, CheckCircle, Loader2, MapPin,
  User, ArrowRight, Shield, Siren, Flame, HeartPulse, ChevronDown, X
} from 'lucide-react';
import { EmergencyType, GuestReport, SystemConfig } from '../types';
import { toast } from 'sonner';

const EMERGENCY_TYPES: { type: EmergencyType; label: string; emoji: string; color: string; level: 1 | 2 | 3 }[] = [
  { type: 'medical', label: 'Medical Emergency', emoji: '🚑', color: 'red', level: 2 },
  { type: 'fire', label: 'Fire / Smoke', emoji: '🔥', color: 'orange', level: 3 },
  { type: 'security', label: 'Security Threat', emoji: '🚨', color: 'yellow', level: 2 },
  { type: 'maintenance', label: 'Maintenance Issue', emoji: '🔧', color: 'blue', level: 1 },
  { type: 'natural-disaster', label: 'Natural Disaster', emoji: '⛈️', color: 'purple', level: 3 },
  { type: 'other', label: 'Other Emergency', emoji: '⚠️', color: 'gray', level: 1 },
];

interface EmergencyService {
  name: string;
  number: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
}

const EMERGENCY_SERVICES: EmergencyService[] = [
  { name: 'Police', number: '100', emoji: '🚔', color: 'text-blue-400', bgColor: 'bg-blue-600/20 border-blue-600/40', description: 'Crime, theft, violence' },
  { name: 'Ambulance', number: '108', emoji: '🚑', color: 'text-red-400', bgColor: 'bg-red-600/20 border-red-600/40', description: 'Medical emergencies' },
  { name: 'Fire Brigade', number: '101', emoji: '🚒', color: 'text-orange-400', bgColor: 'bg-orange-600/20 border-orange-600/40', description: 'Fire & rescue' },
  { name: 'Disaster Mgmt', number: '1078', emoji: '⛑️', color: 'text-purple-400', bgColor: 'bg-purple-600/20 border-purple-600/40', description: 'Floods, earthquakes' },
  { name: 'Women Helpline', number: '1091', emoji: '👩‍⚕️', color: 'text-pink-400', bgColor: 'bg-pink-600/20 border-pink-600/40', description: 'Women safety' },
  { name: 'Child Helpline', number: '1098', emoji: '👶', color: 'text-green-400', bgColor: 'bg-green-600/20 border-green-600/40', description: 'Child safety' },
];

export function GuestComplaint() {
  const { systemId } = useParams<{ systemId: string }>();
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [step, setStep] = useState<'services' | 'form' | 'success'>('services');
  const [form, setForm] = useState({
    reporterName: '',
    reporterPhone: '',
    emergencyType: '' as EmergencyType | '',
    location: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [callingService, setCallingService] = useState<string | null>(null);

  useEffect(() => {
    // Load system config from localStorage (demo: use stored or show demo)
    const stored = localStorage.getItem('sers_system_config');
    if (stored) {
      setSystemConfig(JSON.parse(stored));
    } else {
      // Demo fallback
      setSystemConfig({
        id: systemId || 'DEMO',
        name: 'Grand Plaza Emergency System',
        type: 'hotel',
        description: 'Hotel emergency system',
        adminEmail: 'admin@grandplaza.com',
        adminPhone: '9876543210',
        adminName: 'Admin',
        createdAt: new Date().toISOString(),
        primaryLocation: 'Grand Plaza Hotel',
      });
    }
  }, [systemId]);

  const update = (key: string, value: string) => setForm(p => ({ ...p, [key]: value }));

  const handleCall = (service: EmergencyService) => {
    setCallingService(service.name);
    toast.success(`📞 Calling ${service.name}...`, {
      description: `Dialing ${service.number} — ${service.description}`,
      duration: 4000,
    });
    setTimeout(() => setCallingService(null), 3000);
    // In a real app: window.location.href = `tel:${service.number}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reporterName) { toast.error('Please enter your name'); return; }
    if (!form.emergencyType) { toast.error('Please select emergency type'); return; }
    if (!form.location) { toast.error('Please enter your location'); return; }
    if (!form.description) { toast.error('Please describe the emergency'); return; }

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));

    // Save report to localStorage
    const report: GuestReport = {
      id: `RPT${Date.now()}`,
      systemId: systemId || 'DEMO',
      reporterName: form.reporterName,
      reporterPhone: form.reporterPhone,
      emergencyType: form.emergencyType as EmergencyType,
      location: form.location,
      description: form.description,
      reportedAt: new Date().toISOString(),
      status: 'pending',
    };

    const existing: GuestReport[] = JSON.parse(localStorage.getItem('sers_guest_reports') || '[]');
    localStorage.setItem('sers_guest_reports', JSON.stringify([...existing, report]));

    // Also add to emergencies
    const emergencies = JSON.parse(localStorage.getItem('sers_emergencies') || '[]');
    const levelMap: Record<EmergencyType, number> = { medical: 2, fire: 3, security: 2, maintenance: 1, 'natural-disaster': 3, other: 1 };
    emergencies.push({
      id: `EMG${Date.now()}`,
      type: form.emergencyType,
      level: levelMap[form.emergencyType as EmergencyType] || 1,
      status: 'pending',
      location: form.location,
      description: form.description,
      reportedBy: 'GUEST',
      reportedByName: form.reporterName,
      reportedAt: new Date().toISOString(),
      locationId: systemId || 'LOC001',
      timeline: [{ timestamp: new Date().toISOString(), event: 'Emergency reported via QR code', user: form.reporterName }],
    });
    localStorage.setItem('sers_emergencies', JSON.stringify(emergencies));

    setSubmitting(false);
    setStep('success');
    toast.success('Emergency reported! Help is on the way.');
  };

  const selectedEmType = EMERGENCY_TYPES.find(t => t.type === form.emergencyType);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-red-600/5 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-6 pb-4 text-center border-b border-white/5">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 animate-pulse">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <div className="text-lg font-black text-white">Emergency Report</div>
            <div className="text-xs text-gray-500">{systemConfig?.name || 'SERS System'}</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-6">

        {/* QUICK EMERGENCY SERVICES BANNER */}
        <div className="mb-6 p-4 bg-red-600/10 border border-red-600/30 rounded-xl">
          <p className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
            <Siren className="w-4 h-4" /> 🚨 In Life-Threatening Danger? Call Now:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {EMERGENCY_SERVICES.slice(0, 3).map(s => (
              <button
                key={s.name}
                onClick={() => handleCall(s)}
                className={`flex flex-col items-center p-3 rounded-xl border transition-all hover:scale-105 ${s.bgColor} ${
                  callingService === s.name ? 'ring-2 ring-white/30 animate-pulse' : ''
                }`}
              >
                <span className="text-2xl mb-1">{s.emoji}</span>
                <span className={`text-xs font-bold ${s.color}`}>{s.name}</span>
                <span className="text-white font-black">{s.number}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowServicesModal(true)}
            className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1"
          >
            View all emergency services <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* SUCCESS STATE */}
        {step === 'success' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-600/20 border border-green-600/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Help Is On The Way!</h2>
            <p className="text-gray-400 mb-2">Your emergency report has been received.</p>
            <p className="text-gray-500 text-sm mb-6">Staff has been notified and assigned to your location.</p>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-left space-y-2 mb-6">
              <div className="flex justify-between"><span className="text-gray-500">Type:</span><span className="text-white">{selectedEmType?.label}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Location:</span><span className="text-white">{form.location}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status:</span><span className="text-green-400 font-medium">Dispatching Staff</span></div>
            </div>
            <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-xl text-sm text-gray-300">
              <p className="font-medium text-red-400 mb-1">Stay Calm & Safe</p>
              <p>Stay in a safe location. Staff will reach you shortly. If danger escalates, call <span className="text-white font-bold">100 (Police)</span> or <span className="text-white font-bold">108 (Ambulance)</span></p>
            </div>
            <button onClick={() => setStep('services')} className="mt-4 text-sm text-gray-500 hover:text-gray-300">Report Another Emergency</button>
          </div>
        )}

        {/* FORM */}
        {step !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-white mb-1">Report an Emergency</h2>
              <p className="text-sm text-gray-500">Fill this form to alert facility staff immediately</p>
            </div>

            {/* Reporter info */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Your Name *
                </label>
                <input
                  type="text" placeholder="John Doe"
                  value={form.reporterName} onChange={e => update('reporterName', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Phone Number <span className="text-gray-600">(optional)</span>
                </label>
                <input
                  type="tel" placeholder="For staff to contact you"
                  value={form.reporterPhone} onChange={e => update('reporterPhone', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            {/* Emergency type */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Emergency Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {EMERGENCY_TYPES.map(t => (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => update('emergencyType', t.type)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      form.emergencyType === t.type
                        ? 'bg-red-600/20 border-red-500 shadow-lg'
                        : 'bg-white/3 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl">{t.emoji}</span>
                    <span className="text-sm font-medium text-white leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Your Location *
              </label>
              <input
                type="text" placeholder="Room 512 / Floor 5 / Pool Area / Zone B"
                value={form.location} onChange={e => update('location', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Describe the Emergency *</label>
              <textarea
                placeholder="Briefly describe what is happening and any immediate dangers..."
                value={form.description} onChange={e => update('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit" disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-50 rounded-xl font-black text-white flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 text-lg transition-all"
            >
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Alerting Staff...</> : <><AlertTriangle className="w-5 h-5" /> Send Emergency Alert</>}
            </button>

            <p className="text-center text-xs text-gray-600">
              Your report goes directly to facility staff & management
            </p>
          </form>
        )}
      </div>

      {/* All Emergency Services Modal */}
      {showServicesModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-0 sm:pb-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowServicesModal(false)} />
          <div className="relative z-10 w-full max-w-md bg-[#111118] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-white text-lg">Emergency Services</h3>
              <button onClick={() => setShowServicesModal(false)} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Tap to call any emergency service</p>
            <div className="space-y-2">
              {EMERGENCY_SERVICES.map(s => (
                <button
                  key={s.name}
                  onClick={() => { handleCall(s); setShowServicesModal(false); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] ${s.bgColor} ${
                    callingService === s.name ? 'ring-2 ring-white/20 animate-pulse' : ''
                  }`}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <div className="flex-1 text-left">
                    <div className={`font-bold ${s.color}`}>{s.name}</div>
                    <div className="text-xs text-gray-500">{s.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-black text-lg">{s.number}</span>
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-gray-600 mt-4">Calls use your device's phone app</p>
          </div>
        </div>
      )}
    </div>
  );
}
