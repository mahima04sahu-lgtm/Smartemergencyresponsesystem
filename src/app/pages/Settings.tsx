import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Settings as SettingsIcon, Bell, Shield, Database, Smartphone, Brain,
  Phone, Plus, Trash2, Save, RefreshCw, ChevronRight,
  Volume2, MapPin, Clock, Users, Zap, Eye, Lock, Globe, Palette,
  AlertTriangle, CheckCircle, ToggleLeft, ToggleRight, X, Loader2
} from 'lucide-react';
import { SystemSettings, CustomEmergencyNumber } from '../types';
import { toast } from 'sonner';

type SettingsSection = 'notifications' | 'emergency' | 'ai' | 'integrations' | 'data' | 'appearance' | 'emergency-numbers' | 'system';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-red-600' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function Section({ id, icon: Icon, title, description, active, onClick }: {
  id: SettingsSection; icon: any; title: string; description: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
        active ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${active ? 'bg-white/20' : 'bg-gray-100'}`}>
        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${active ? 'text-white' : 'text-gray-800'}`}>{title}</p>
        <p className={`text-xs truncate ${active ? 'text-red-100' : 'text-gray-500'}`}>{description}</p>
      </div>
      <ChevronRight className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
    </button>
  );
}

const DEFAULT_SETTINGS: SystemSettings = {
  autoAssignStaff: true,
  aiClassification: true,
  silentMode: false,
  responseTimeTarget: 5,
  dataRetention: 90,
  soundAlerts: true,
  emailNotifications: true,
  smsAlerts: true,
  pushNotifications: true,
  allowGuestReports: true,
  requireGuestDetails: false,
  escalationTimeout: 10,
  aiSuggestions: true,
  theme: 'auto',
  language: 'en',
  policeNumber: '100',
  ambulanceNumber: '108',
  fireNumber: '101',
  customEmergencyNumbers: [],
};

export function Settings() {
  const { systemConfig, updateSystemSettings, user } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('notifications');
  const [settings, setSettings] = useState<SystemSettings>({ ...DEFAULT_SETTINGS, ...systemConfig?.settings });
  const [saving, setSaving] = useState(false);
  const [newNumber, setNewNumber] = useState({ label: '', number: '', icon: '📞' });
  const [showAddNumber, setShowAddNumber] = useState(false);

  const updateSetting = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings(p => ({ ...p, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    updateSystemSettings(settings);
    setSaving(false);
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    toast.info('Settings reset to defaults');
  };

  const addCustomNumber = () => {
    if (!newNumber.label || !newNumber.number) { toast.error('Enter label and number'); return; }
    const updated = [...(settings.customEmergencyNumbers || []), { ...newNumber, id: `CN${Date.now()}` }];
    updateSetting('customEmergencyNumbers', updated);
    setNewNumber({ label: '', number: '', icon: '📞' });
    setShowAddNumber(false);
    toast.success('Emergency contact added');
  };

  const removeCustomNumber = (id: string) => {
    updateSetting('customEmergencyNumbers', (settings.customEmergencyNumbers || []).filter(n => n.id !== id));
  };

  const sections: { id: SettingsSection; icon: any; title: string; description: string }[] = [
    { id: 'notifications', icon: Bell, title: 'Notifications', description: 'Alerts, sounds & push messages' },
    { id: 'emergency', icon: Shield, title: 'Emergency Response', description: 'Response time, escalation & auto-assign' },
    { id: 'ai', icon: Brain, title: 'AI & Automation', description: 'AI classification, suggestions & escalation' },
    { id: 'emergency-numbers', icon: Phone, title: 'Emergency Numbers', description: 'Police, ambulance, fire & custom contacts' },
    { id: 'integrations', icon: Smartphone, title: 'Integrations', description: 'Maps, external services & APIs' },
    { id: 'data', icon: Database, title: 'Data & Privacy', description: 'Retention, export & data management' },
    { id: 'appearance', icon: Palette, title: 'Appearance & Language', description: 'Theme, language & display settings' },
    { id: 'system', icon: SettingsIcon, title: 'System Info', description: 'System details & advanced config' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-5 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-0.5">{systemConfig?.name || 'SERS System'} · {user?.name}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleReset} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 shadow-sm">
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/20 transition-all">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </div>

        <div className="flex gap-5">
          {/* Sidebar nav */}
          <div className="w-64 shrink-0">
            <div className="bg-white rounded-xl border shadow-sm p-2 space-y-1 sticky top-5">
              {sections.map(s => (
                <Section key={s.id} {...s} active={activeSection === s.id} onClick={() => setActiveSection(s.id)} />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">
            {/* ─── NOTIFICATIONS ─── */}
            {activeSection === 'notifications' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border shadow-sm p-5">
                  <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-red-600" /> Notification Settings</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Receive emergency alerts in your Gmail inbox' },
                      { key: 'smsAlerts' as const, label: 'SMS Alerts', desc: 'SMS for Level 2+ emergencies to admin phone' },
                      { key: 'pushNotifications' as const, label: 'Push Notifications', desc: 'Browser push notifications for live alerts' },
                      { key: 'soundAlerts' as const, label: 'Sound Alerts', desc: 'Play alarm sound when Level 3 emergency triggers' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                        <Toggle checked={settings[item.key] as boolean} onChange={v => updateSetting(item.key, v)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Alert Levels</h3>
                  <div className="space-y-2">
                    {[
                      { level: 1, label: 'Level 1 — Minor', desc: 'Notify assigned staff only', color: 'text-blue-600 bg-blue-50' },
                      { level: 2, label: 'Level 2 — Moderate', desc: 'Notify staff + department manager', color: 'text-orange-600 bg-orange-50' },
                      { level: 3, label: 'Level 3 — Critical', desc: 'Notify everyone + trigger alarm + call emergency services', color: 'text-red-600 bg-red-50' },
                    ].map(l => (
                      <div key={l.level} className={`flex items-center gap-3 p-3 rounded-xl ${l.color}`}>
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <div>
                          <p className="text-sm font-bold">{l.label}</p>
                          <p className="text-xs opacity-80">{l.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── EMERGENCY RESPONSE ─── */}
            {activeSection === 'emergency' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border shadow-sm p-5">
                  <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-red-600" /> Emergency Response</h2>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">Auto-Assign Staff</p>
                        <p className="text-xs text-gray-500">Automatically assign available staff to emergencies</p>
                      </div>
                      <Toggle checked={settings.autoAssignStaff} onChange={v => updateSetting('autoAssignStaff', v)} />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">Silent Mode</p>
                        <p className="text-xs text-gray-500">Staff can report emergencies without visible alerts to guests</p>
                      </div>
                      <Toggle checked={settings.silentMode} onChange={v => updateSetting('silentMode', v)} />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">Allow Guest Reports via QR</p>
                        <p className="text-xs text-gray-500">Guests can report emergencies by scanning the QR code</p>
                      </div>
                      <Toggle checked={settings.allowGuestReports} onChange={v => updateSetting('allowGuestReports', v)} />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">Require Guest Details</p>
                        <p className="text-xs text-gray-500">Require name & phone from guests before submitting report</p>
                      </div>
                      <Toggle checked={settings.requireGuestDetails} onChange={v => updateSetting('requireGuestDetails', v)} />
                    </div>

                    <div>
                      <p className="font-medium text-gray-800 text-sm mb-2">Response Time Target</p>
                      <p className="text-xs text-gray-500 mb-3">Expected response time (minutes) for staff to reach the emergency</p>
                      <div className="flex gap-2 flex-wrap">
                        {[2, 3, 5, 7, 10, 15].map(t => (
                          <button key={t} onClick={() => updateSetting('responseTimeTarget', t)}
                            className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${settings.responseTimeTarget === t ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'}`}>
                            {t} min
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-gray-800 text-sm mb-2">Auto-Escalation Timeout</p>
                      <p className="text-xs text-gray-500 mb-3">Minutes before unacknowledged emergencies auto-escalate to next level</p>
                      <div className="flex gap-2 flex-wrap">
                        {[5, 10, 15, 20, 30].map(t => (
                          <button key={t} onClick={() => updateSetting('escalationTimeout', t)}
                            className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${settings.escalationTimeout === t ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                            {t} min
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="font-medium text-gray-800 text-sm mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-red-600" /> Default Staff Password
                      </p>
                      <p className="text-xs text-gray-500 mb-3">New staff will use this password by default when you add them</p>
                      <div className="relative max-w-sm">
                        <input
                          type="text" placeholder="e.g. Campus123"
                          value={settings.defaultStaffPassword || ''} onChange={e => updateSetting('defaultStaffPassword', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── AI SETTINGS ─── */}
            {activeSection === 'ai' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border shadow-sm p-5">
                  <h2 className="font-black text-gray-900 mb-1 flex items-center gap-2"><Brain className="w-5 h-5 text-yellow-500" /> AI & Automation</h2>
                  <p className="text-sm text-gray-500 mb-5">Configure how Gemini AI and automation systems work in your SERS instance</p>
                  <div className="space-y-4">
                    {[
                      { key: 'aiClassification' as const, label: 'AI Emergency Classification', desc: 'Use Gemini AI to auto-classify emergency type and severity from description' },
                      { key: 'aiSuggestions' as const, label: 'AI Suggestions Panel', desc: 'Show AI-powered recommendations in dashboard sidebar for staff & settings' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div className="flex-1 pr-4">
                          <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                        <Toggle checked={settings[item.key] as boolean} onChange={v => updateSetting(item.key, v)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                  <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> AI Advanced Features (WOW Mode)</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'AI Panic Detection', desc: 'Detect unclear/panic-typed emergency descriptions and classify them', status: 'active' },
                      { label: 'Silent SOS Mode', desc: 'Hidden trigger that staff can use without alerting suspects', status: 'active' },
                      { label: 'AI Severity Auto-Upgrade', desc: 'AI monitors situation and escalates level if conditions worsen', status: 'active' },
                      { label: 'Crisis Replay Mode', desc: 'Timeline playback of emergency events for post-incident review', status: 'beta' },
                      { label: 'Uber-style Staff Tracking', desc: 'Real-time map showing staff locations and dispatch routes', status: 'coming' },
                      { label: 'Voice SOS Input', desc: 'Voice-based emergency reporting using speech recognition', status: 'coming' },
                    ].map(f => (
                      <div key={f.label} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-yellow-200">
                        <Brain className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-800">{f.label}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                              f.status === 'active' ? 'bg-green-100 text-green-700' :
                              f.status === 'beta' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>{f.status}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── EMERGENCY NUMBERS ─── */}
            {activeSection === 'emergency-numbers' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border shadow-sm p-5">
                  <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2"><Phone className="w-5 h-5 text-red-600" /> Emergency Services Numbers</h2>
                  <div className="space-y-3 mb-5">
                    {[
                      { key: 'policeNumber' as const, label: '🚔 Police', placeholder: '100' },
                      { key: 'ambulanceNumber' as const, label: '🚑 Ambulance', placeholder: '108' },
                      { key: 'fireNumber' as const, label: '🚒 Fire Brigade', placeholder: '101' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center gap-3">
                        <label className="w-36 text-sm font-medium text-gray-700">{item.label}</label>
                        <input
                          type="text" placeholder={item.placeholder}
                          value={settings[item.key]} onChange={e => updateSetting(item.key, e.target.value)}
                          className="flex-1 px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800 text-sm">Custom Emergency Contacts</h3>
                      <button onClick={() => setShowAddNumber(true)} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-500 font-bold">
                        <Plus className="w-4 h-4" /> Add Contact
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(settings.customEmergencyNumbers || []).map(cn => (
                        <div key={cn.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-xl">{cn.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">{cn.label}</p>
                            <p className="text-xs text-gray-500">{cn.number}</p>
                          </div>
                          <button onClick={() => removeCustomNumber(cn.id)} className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center">
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      ))}
                      {(settings.customEmergencyNumbers || []).length === 0 && (
                        <div className="text-center py-6 text-gray-400 text-sm">
                          <Phone className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                          No custom contacts yet. Add hospital, security, or any specialized service.
                        </div>
                      )}
                    </div>

                    {showAddNumber && (
                      <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <h4 className="text-sm font-bold text-red-800 mb-3">Add Custom Contact</h4>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input placeholder="Icon (emoji)" value={newNumber.icon} onChange={e => setNewNumber(p => ({ ...p, icon: e.target.value }))}
                              className="w-16 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400 text-center" />
                            <input placeholder="Label (e.g. Hospital)" value={newNumber.label} onChange={e => setNewNumber(p => ({ ...p, label: e.target.value }))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400" />
                          </div>
                          <input placeholder="Number (e.g. 011-12345678)" value={newNumber.number} onChange={e => setNewNumber(p => ({ ...p, number: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400" />
                          <div className="flex gap-2">
                            <button onClick={addCustomNumber} className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-bold">Add</button>
                            <button onClick={() => setShowAddNumber(false)} className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-xl text-sm">Cancel</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ─── INTEGRATIONS ─── */}
            {activeSection === 'integrations' && (
              <div className="bg-white rounded-xl border shadow-sm p-5">
                <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2"><Smartphone className="w-5 h-5 text-red-600" /> Integrations</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Google Maps API', desc: 'Show emergency locations on interactive map', icon: '🗺️', status: 'Ready' },
                    { label: 'Gemini AI API', desc: 'AI-powered emergency classification (configure API key)', icon: '🤖', status: 'Configure' },
                    { label: 'Firebase Cloud Messaging', desc: 'Real-time push notifications across all devices', icon: '🔔', status: 'Ready' },
                    { label: 'Emergency Services API', desc: 'Automatically notify police/ambulance on Level 3', icon: '🚨', status: 'Coming' },
                    { label: 'Twilio SMS', desc: 'Send SMS alerts to staff mobile numbers', icon: '📱', status: 'Configure' },
                    { label: 'Slack / Teams Webhook', desc: 'Send emergency notifications to team channels', icon: '💬', status: 'Configure' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        item.status === 'Ready' ? 'bg-green-100 text-green-700' :
                        item.status === 'Coming' ? 'bg-gray-100 text-gray-600' :
                        'bg-blue-100 text-blue-700'
                      }`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── DATA & PRIVACY ─── */}
            {activeSection === 'data' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border shadow-sm p-5">
                  <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2"><Database className="w-5 h-5 text-red-600" /> Data & Privacy</h2>
                  <div>
                    <p className="font-medium text-gray-800 text-sm mb-2">Data Retention Period</p>
                    <p className="text-xs text-gray-500 mb-3">How long emergency records are stored before auto-deletion</p>
                    <div className="flex gap-2 flex-wrap">
                      {[30, 60, 90, 180, 365].map(d => (
                        <button key={d} onClick={() => updateSetting('dataRetention', d)}
                          className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${settings.dataRetention === d ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'}`}>
                          {d < 365 ? `${d} days` : '1 year'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t space-y-2">
                    <button className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                      <Database className="w-4 h-4" /> Export All Emergency Data (CSV)
                    </button>
                    <button onClick={() => toast.info('Emergency history cleared (demo)')} className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-sm font-bold transition-colors border border-red-200 flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" /> Clear Emergency History
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── APPEARANCE ─── */}
            {activeSection === 'appearance' && (
              <div className="bg-white rounded-xl border shadow-sm p-5">
                <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2"><Palette className="w-5 h-5 text-red-600" /> Appearance & Language</h2>
                <div className="space-y-5">
                  <div>
                    <p className="font-medium text-gray-800 text-sm mb-2">Theme</p>
                    <div className="flex gap-3">
                      {(['light', 'dark', 'auto'] as const).map(t => (
                        <button key={t} onClick={() => updateSetting('theme', t)}
                          className={`flex-1 py-3 rounded-xl border text-sm font-bold capitalize transition-all flex flex-col items-center gap-1 ${
                            settings.theme === t ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-200 text-gray-600'
                          }`}>
                          <span>{t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '⚙️'}</span>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm mb-2">Language</p>
                    <select value={settings.language} onChange={e => updateSetting('language', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400">
                      <option value="en">🇬🇧 English</option>
                      <option value="hi">🇮🇳 Hindi</option>
                      <option value="es">🇪🇸 Spanish</option>
                      <option value="fr">🇫🇷 French</option>
                      <option value="ar">🇸🇦 Arabic</option>
                      <option value="zh">🇨🇳 Chinese</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ─── SYSTEM INFO ─── */}
            {activeSection === 'system' && (
              <div className="bg-white rounded-xl border shadow-sm p-5">
                <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2"><SettingsIcon className="w-5 h-5 text-red-600" /> System Information</h2>
                <div className="space-y-3">
                  {systemConfig && [
                    { label: 'System Name', value: systemConfig.name },
                    { label: 'System ID', value: systemConfig.id },
                    { label: 'System Type', value: systemConfig.type },
                    { label: 'Admin Email', value: systemConfig.adminEmail },
                    { label: 'Admin Phone', value: systemConfig.adminPhone || '—' },
                    { label: 'Created', value: new Date(systemConfig.createdAt).toLocaleDateString() },
                    { label: 'Primary Location', value: systemConfig.primaryLocation || '—' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2.5 border-b last:border-0">
                      <span className="text-sm text-gray-500">{item.label}</span>
                      <span className="text-sm font-medium text-gray-800 font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-700 mb-2">🔧 Tech Stack</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['React', 'TypeScript', 'Tailwind CSS', 'Flask (Backend)', 'Firebase Auth', 'Firestore', 'Gemini AI', 'Google Maps', 'FCM'].map(t => (
                      <span key={t} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
