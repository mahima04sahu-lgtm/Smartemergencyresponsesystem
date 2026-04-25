import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { SystemType } from '../types';
import {
  AlertTriangle, ArrowLeft, ArrowRight, CheckCircle, Building2,
  Mail, Phone, Eye, EyeOff, RefreshCw, Sparkles, Brain,
  Shield, Zap, ChevronRight, Loader2, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { generateZones } from '../../services/api';

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  password: string;
  confirmPassword: string;
  otp: string;
  systemType: SystemType | '';
  projectDescription: string;
  systemName: string;
  primaryLocation: string;
  customAccessCode: string;
}

const SYSTEM_TYPES: { type: SystemType; label: string; emoji: string; description: string; suggestions: string }[] = [
  { type: 'hotel', label: 'Hotel / Resort', emoji: '🏨', description: 'Luxury properties, boutique hotels, resorts', suggestions: 'Guest rooms, pool area, restaurant, lobby, spa, parking' },
  { type: 'hospital', label: 'Hospital / Clinic', emoji: '🏥', description: 'Medical facilities, clinics, healthcare centers', suggestions: 'ICU, ER, Operation theater, Ward, Pharmacy, Reception' },
  { type: 'factory', label: 'Factory / Plant', emoji: '🏭', description: 'Manufacturing, production, industrial facilities', suggestions: 'Shop floor, warehouse, loading dock, control room, R&D lab' },
  { type: 'school', label: 'School / College', emoji: '🏫', description: 'K-12 schools, colleges, training centers', suggestions: 'Classroom, cafeteria, playground, lab, library, gym' },
  { type: 'restaurant', label: 'Restaurant / F&B', emoji: '🍽️', description: 'Restaurants, cafes, catering services', suggestions: 'Kitchen, dining hall, bar, terrace, storage, delivery area' },
  { type: 'airport', label: 'Airport / Transit', emoji: '✈️', description: 'Airports, train stations, transit hubs', suggestions: 'Terminal A-D, Gates, Security, Baggage, Food court, Customs' },
  { type: 'mall', label: 'Mall / Retail', emoji: '🛍️', description: 'Shopping centers, supermarkets, retail chains', suggestions: 'Food court, retail zone A-D, parking, cinema, entry gates' },
  { type: 'office', label: 'Office / Corporate', emoji: '🏢', description: 'Corporate offices, business parks, co-working', suggestions: 'Floors 1-20, conference rooms, lobby, server room, rooftop' },
  { type: 'university', label: 'University / Campus', emoji: '🎓', description: 'Universities, research centers, campuses', suggestions: 'Admin block, hostel, sports complex, auditorium, canteen' },
  { type: 'other', label: 'Other', emoji: '🏗️', description: 'Any other type of facility or organization', suggestions: '' },
];

// AI system name generation based on type and description
function generateSystemName(type: SystemType | '', description: string, adminName: string): string {
  const typeLabels: Record<string, string> = {
    hotel: 'Hospitality', hospital: 'MedCare', factory: 'Industrial',
    school: 'EduSafe', restaurant: 'FoodSafe', airport: 'Transit',
    mall: 'Retail', office: 'Corporate', university: 'Campus', other: 'Facility',
  };
  const prefix = typeLabels[type || 'other'] || 'Smart';
  const words = description.trim().split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  const adminFirst = adminName.split(' ')[0] || 'Pro';
  if (words.length > 2) return `${words} ${prefix} SERS`;
  return `${adminFirst}'s ${prefix} Emergency System`;
}

// Simulate AI suggestions based on project type
function getAISuggestions(type: SystemType | '', description: string): string[] {
  const baseSuggestions: Record<string, string[]> = {
    hotel: ['Add housekeeping staff with medical first-aid skills', 'Enable guest panic button via QR code in rooms', 'Set 3-min response time for medical emergencies', 'Create zones: Lobby, Floors 1-5, Pool, Restaurant'],
    hospital: ['Assign code blue team with cardiologist skills', 'Enable silent SOS mode for staff', 'Integrate ambulance dispatch on Level 3 alerts', 'Create ICU, ER, Ward, and OT zones'],
    factory: ['Assign safety officers to all production zones', 'Enable chemical spill emergency protocol', 'Set mandatory PPE check before shift start alerts', 'Create zones: Assembly, Storage, Loading, Control Room'],
    school: ['Add school nurse to medical response team', 'Enable silent lockdown mode', 'Create fire drill simulation schedule', 'Zones: Classroom blocks, Cafeteria, Playground, Lab'],
    restaurant: ['Assign kitchen staff with fire safety training', 'Enable food allergy emergency protocol', 'Set gas leak as Level 3 critical emergency', 'Zones: Kitchen, Dining, Bar, Storage'],
    airport: ['Enable multi-agency coordination for Level 3', 'Add airport police to security alerts', 'Set bomb threat as highest priority protocol', 'Zones: Terminal A-D, Security, Gates, Baggage'],
    mall: ['Enable crowd control protocol for weekends', 'Add first aid stations at each retail zone', 'Set theft/security as Level 2 moderate', 'Zones: Retail A-D, Food Court, Parking, Entrances'],
    office: ['Enable visitor emergency tracking system', 'Set server room fire as Level 3 critical', 'Add fire wardens per floor', 'Zones: Floor 1-10, Lobby, Server Room, Rooftop'],
    university: ['Add campus security to all Level 2+ alerts', 'Enable hostel night emergency protocol', 'Create lab safety incident protocol', 'Zones: Admin, Academic, Hostel, Sports, Canteen'],
    other: ['Customize zones based on your facility layout', 'Assign staff skills matching your risk profile', 'Enable AI severity escalation', 'Configure custom emergency numbers'],
  };
  return (baseSuggestions[type || 'other'] || baseSuggestions.other).slice(0, 3);
}

export function CreateSystem() {
  const navigate = useNavigate();
  const { createSystem } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [detectedZones, setDetectedZones] = useState<string[]>([]);
  const [createdAccessCode, setCreatedAccessCode] = useState<string>('');
  const [form, setForm] = useState<FormData>({
    adminName: '', adminEmail: '', adminPhone: '', password: '', confirmPassword: '',
    otp: '', systemType: '', projectDescription: '', systemName: '', primaryLocation: '',
    customAccessCode: '',
  });

  const selectedType = SYSTEM_TYPES.find(t => t.type === form.systemType);

  const update = (key: keyof FormData, value: string) => setForm(p => ({ ...p, [key]: value }));

  const sendOTP = async () => {
    if (!form.adminPhone || form.adminPhone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setSendingOtp(true);
    await new Promise(r => setTimeout(r, 1500));
    setSendingOtp(false);
    setOtpSent(true);
    toast.success(`OTP sent to +91 ${form.adminPhone}`, { description: 'Use 123456 for demo' });
  };

  const verifyOTP = () => {
    if (form.otp === '123456' || form.otp.length === 6) {
      setOtpVerified(true);
      toast.success('Phone number verified!');
    } else {
      toast.error('Invalid OTP. Use 123456 for demo.');
    }
  };

  const handleStep1 = () => {
    if (!form.adminName || !form.adminEmail) { toast.error('Please fill in your name and email'); return; }
    if (!form.password || form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (!otpVerified && form.adminPhone) { toast.error('Please verify your phone number'); return; }
    setStep(2);
  };

  const handleStep2 = () => {
    if (!form.systemType) { toast.error('Please select a system type'); return; }
    setStep(3);
  };

  const handleStep3 = async () => {
    if (!form.projectDescription || form.projectDescription.length < 30) {
      toast.error('Please describe your project in at least 30 characters');
      return;
    }
    setAiGenerating(true);
    try {
      // 1. Generate Zones using Gemini AI
      const aiData = await generateZones(form.systemType, form.projectDescription);
      if (aiData.zones) {
        setDetectedZones(aiData.zones);
        setAiSuggestions([
          `AI detected ${aiData.zones.length} zones from your description.`,
          `Configured ${form.systemType} emergency protocols.`,
          `AI suggests adding ${Math.ceil(aiData.zones.length / 2)} responders.`
        ]);
      } else {
        // Fallback to mock if AI fails
        setDetectedZones(selectedType?.suggestions.split(', ') || []);
        setAiSuggestions(getAISuggestions(form.systemType, form.projectDescription));
      }

      const generated = generateSystemName(form.systemType, form.projectDescription, form.adminName);
      update('systemName', generated);
      setStep(4);
    } catch (e) {
      console.error('AI Generation Error:', e);
      toast.error('AI generation had a hiccup, using standard configuration.');
      setDetectedZones(selectedType?.suggestions.split(', ') || []);
      setStep(4);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreate = async () => {
    if (!form.systemName) { toast.error('System name is required'); return; }
    
    // Use AI detected zones, fallback to type suggestions
    const zones = detectedZones.length > 0 
      ? detectedZones 
      : (selectedType ? selectedType.suggestions.split(', ') : []);
    
    setCreating(true);
    try {
      const result = await createSystem({
        name: form.systemName,
        type: form.systemType as SystemType,
        description: form.projectDescription,
        adminEmail: form.adminEmail,
        adminPhone: form.adminPhone,
        adminName: form.adminName,
        primaryLocation: form.primaryLocation,
        staffCount: 0,
        zones: zones,
        customAccessCode: form.customAccessCode
      }, form.password);
      if (result.success) {
        toast.success('System created successfully!');
        setCreatedAccessCode(result.accessCode || form.customAccessCode);
        setStep(5);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to create system');
    } finally {
      setCreating(false);
    }
  };


  const steps = [
    { n: 1, label: 'Account' },
    { n: 2, label: 'System Type' },
    { n: 3, label: 'Details' },
    { n: 4, label: 'Launch' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Fixed header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <button onClick={() => step === 1 ? navigate('/') : setStep(s => (s - 1) as Step)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {step === 1 ? 'Home' : 'Back'}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="font-black text-white">SERS</span>
        </div>
        <div className="text-sm text-gray-500">Step {step}/4</div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <React.Fragment key={s.n}>
              <div className={`flex items-center gap-2 ${step >= s.n ? 'text-white' : 'text-gray-600'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > s.n ? 'bg-green-600' : step === s.n ? 'bg-red-600' : 'bg-white/10'
                }`}>
                  {step > s.n ? <CheckCircle className="w-4 h-4" /> : s.n}
                </div>
                <span className="text-xs hidden sm:block">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px max-w-12 ${step > s.n ? 'bg-green-600/50' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="w-full max-w-lg">
          {/* STEP 1: Account */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-red-600/20 border border-red-600/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-red-400" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">Create Your Account</h2>
                <p className="text-gray-500 text-sm">This will be the admin account for your system</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Full Name *</label>
                  <input
                    type="text" placeholder="John Smith"
                    value={form.adminName} onChange={e => update('adminName', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Gmail / Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="email" placeholder="admin@gmail.com"
                      value={form.adminEmail} onChange={e => update('adminEmail', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Phone Number (with OTP verification)</label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-sm">+91</div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                      <input
                        type="tel" placeholder="9876543210" maxLength={10}
                        value={form.adminPhone} onChange={e => update('adminPhone', e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                      />
                    </div>
                    <button
                      onClick={sendOTP} disabled={sendingOtp || otpVerified}
                      className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                        otpVerified ? 'bg-green-600/20 text-green-400 border border-green-600/30' :
                        'bg-red-600 hover:bg-red-500 text-white'
                      }`}
                    >
                      {otpVerified ? <><CheckCircle className="w-4 h-4 inline mr-1" />Verified</> :
                       sendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {otpSent && !otpVerified && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Enter OTP <span className="text-gray-600">(demo: 123456)</span></label>
                    <div className="flex gap-2">
                      <input
                        type="text" placeholder="6-digit OTP" maxLength={6}
                        value={form.otp} onChange={e => update('otp', e.target.value.replace(/\D/g, ''))}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 text-center tracking-widest"
                      />
                      <button onClick={verifyOTP} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-medium text-white">
                        Verify
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters"
                      value={form.password} onChange={e => update('password', e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <button onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Confirm Password *</label>
                  <input
                    type="password" placeholder="Repeat password"
                    value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <button onClick={handleStep1} className="w-full py-3.5 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all">
                Continue <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <span className="text-gray-500 text-sm">Already have a system? </span>
                <button onClick={() => navigate('/enter-system')} className="text-red-400 hover:text-red-300 text-sm font-medium">Enter System</button>
              </div>
            </div>
          )}

          {/* STEP 2: System Type */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-red-600/20 border border-red-600/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-7 h-7 text-red-400" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">What Are You Building?</h2>
                <p className="text-gray-500 text-sm">AI will tailor your emergency system to your environment</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {SYSTEM_TYPES.map(t => (
                  <button
                    key={t.type}
                    onClick={() => update('systemType', t.type)}
                    className={`p-4 rounded-xl border text-left transition-all hover:scale-105 ${
                      form.systemType === t.type
                        ? 'bg-red-600/20 border-red-500 shadow-lg shadow-red-600/10'
                        : 'bg-white/3 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-2">{t.emoji}</div>
                    <div className="text-sm font-semibold text-white leading-tight">{t.label}</div>
                    <div className="text-xs text-gray-500 mt-1 leading-tight">{t.description}</div>
                  </button>
                ))}
              </div>

              {selectedType && (
                <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-xl mb-6 text-sm text-gray-300">
                  <span className="text-red-400 font-medium">💡 AI Suggestion:</span> Your system will auto-configure zones like: {selectedType.suggestions}
                </div>
              )}

              <button onClick={handleStep2} disabled={!form.systemType} className="w-full py-3.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Project Details */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-red-600/20 border border-red-600/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-7 h-7 text-red-400" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">Describe Your Project</h2>
                <p className="text-gray-500 text-sm">The more detail you give, the better AI can configure your system</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Project Description *</label>
                <textarea
                  placeholder={`Example: We are a 5-star hotel with 200 rooms, 2 restaurants, a pool, and a spa. We need an emergency response system for medical emergencies, fire safety, and security incidents. Our staff includes doctors on call, security guards, and housekeeping. We want to track emergencies by floor and zone...`}
                  value={form.projectDescription} onChange={e => update('projectDescription', e.target.value)}
                  rows={7}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors resize-none text-sm leading-relaxed"
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-600">Min. 30 characters</span>
                  <span className={`text-xs ${form.projectDescription.length >= 30 ? 'text-green-400' : 'text-gray-600'}`}>
                    {form.projectDescription.length} chars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Primary Location Name <span className="text-gray-600">(optional)</span></label>
                <input
                  type="text" placeholder={`e.g. Grand Plaza Hotel, City General Hospital`}
                  value={form.primaryLocation} onChange={e => update('primaryLocation', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="p-4 bg-white/3 border border-white/10 rounded-xl">
                <p className="text-sm text-gray-400 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  <span>After you submit, our AI will analyze your description to generate a system name, pre-configure emergency protocols, and suggest staff roles tailored to your facility.</span>
                </p>
              </div>

              <button onClick={handleStep3} disabled={form.projectDescription.length < 30} className="w-full py-3.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all">
                {aiGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> AI Analyzing...</> : <>Generate with AI <Sparkles className="w-4 h-4" /></>}
              </button>
            </div>
          )}

          {/* STEP 4: Review & Launch */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-green-600/20 border border-green-600/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-green-400" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">Your System Is Ready!</h2>
                <p className="text-gray-500 text-sm">AI has configured everything. Review and launch.</p>
              </div>

              {/* System name */}
              <div className="p-5 bg-gradient-to-r from-red-600/20 to-red-900/10 border border-red-600/30 rounded-xl">
                <p className="text-xs text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Generated System Name
                </p>
                <input
                  type="text" value={form.systemName} onChange={e => update('systemName', e.target.value)}
                  className="w-full text-xl font-black text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-red-400 pb-1"
                />
                <p className="text-xs text-gray-500 mt-2">You can edit the name above</p>
              </div>

              {/* Summary */}
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Admin', value: `${form.adminName} (${form.adminEmail})` },
                  { label: 'System Type', value: `${SYSTEM_TYPES.find(t => t.type === form.systemType)?.emoji} ${SYSTEM_TYPES.find(t => t.type === form.systemType)?.label}` },
                  { label: 'Location', value: form.primaryLocation || 'To be configured' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-white/3 rounded-lg border border-white/[0.06]">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="text-sm text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Custom access code */}
              <div className="p-5 bg-white/5 border border-white/10 rounded-xl mb-6">
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-red-400" /> Preferred Access Code (Optional)
                </label>
                <input
                  type="text" placeholder="e.g. HOSPITAL-01 (or leave blank for random)"
                  value={form.customAccessCode} onChange={e => update('customAccessCode', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors uppercase font-mono tracking-widest"
                />
                <p className="text-[10px] text-gray-500 mt-2 italic">This code will be given to visitors/guests so they can report emergencies on your campus.</p>
              </div>

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="p-5 bg-yellow-600/10 border border-yellow-600/20 rounded-xl">
                  <p className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" /> AI Setup Suggestions
                  </p>
                  <ul className="space-y-2">
                    {aiSuggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <ChevronRight className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-600 mt-3">These suggestions will appear in your dashboard after launch</p>
                </div>
              )}

              <button onClick={handleCreate} disabled={creating || !form.systemName} className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-40 rounded-xl font-black text-white flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 text-lg transition-all">
                {creating ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating System...</> : <><Zap className="w-5 h-5" /> Launch SERS System</>}
              </button>
            </div>
          )}

          {/* STEP 5: Success & Access Code */}
          {step === 5 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-4xl font-black text-white mb-2">System Live!</h2>
              <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8">
                Your Smart Emergency Response System has been successfully created and is now active.
              </p>

              <div className="p-8 bg-[#0f0f17] border border-red-500/30 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400"></div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 text-red-500" /> Your Access Code
                </p>
                <div className="text-5xl font-black text-white tracking-widest font-mono">
                  {createdAccessCode}
                </div>
                <p className="text-xs text-red-400 mt-4 opacity-80">
                  ⚠️ Save this code! You and your staff need it to enter the system.
                </p>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-xl font-black text-white flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 text-lg transition-all hover:scale-[1.02]"
                >
                  Enter Dashboard <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
