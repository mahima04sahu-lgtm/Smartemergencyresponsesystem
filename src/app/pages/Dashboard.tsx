import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getAlerts, updateAlertStatus } from '../../services/api';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmergency } from '../contexts/EmergencyContext';
import { SOSButton } from '../components/SOSButton';
import { EmergencyCard } from '../components/EmergencyCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  AlertTriangle, Clock, CheckCircle, Users, TrendingUp,
  QrCode, X, Download, ChevronRight, Sparkles, Brain,
  Shield, Zap, Bell, BarChart3, Building2, ChevronLeft,
  Settings, UserPlus, RefreshCw, Phone
} from 'lucide-react';
import { MOCK_LOCATIONS } from '../utils/mockData';
import { QRCodeSVG } from 'qrcode.react';
import { AISuggestion } from '../types';
import { useNavigate } from 'react-router';

// Generate AI suggestions for the system
function generateAISuggestions(systemType: string, staffCount: number, emergencyCount: number): AISuggestion[] {
  const base: AISuggestion[] = [
    {
      id: 'ai-1',
      type: 'staff',
      title: 'Add Medical Response Team',
      description: 'Your system lacks dedicated medical staff. Add at least 2 members with first-aid certification.',
      priority: 'high',
      implemented: false,
    },
    {
      id: 'ai-2',
      type: 'setting',
      title: 'Enable AI Auto-Escalation',
      description: 'Turn on automatic severity upgrading when emergencies go unacknowledged for 5+ minutes.',
      priority: 'high',
      implemented: false,
    },
    {
      id: 'ai-3',
      type: 'protocol',
      title: 'Set Response Time Target to 3 min',
      description: 'Industry best practice recommends 3-minute response target for Level 2+ emergencies.',
      priority: 'medium',
      implemented: false,
    },
    {
      id: 'ai-4',
      type: 'staff',
      title: 'Add Security Officer',
      description: 'Assign a dedicated security staff member with security & access control skills.',
      priority: 'medium',
      implemented: false,
    },
    {
      id: 'ai-5',
      type: 'training',
      title: 'Schedule Fire Safety Drill',
      description: 'No fire drills recorded. Schedule a monthly drill for all staff members.',
      priority: 'low',
      implemented: false,
    },
    {
      id: 'ai-6',
      type: 'setting',
      title: 'Configure Emergency Call Numbers',
      description: 'Set local police (100), ambulance (108), and fire brigade (101) numbers in Settings.',
      priority: 'medium',
      implemented: false,
    },
  ];
  return base;
}

const PRIORITY_COLORS = {
  high: 'bg-red-600/20 border-red-600/40 text-red-400',
  medium: 'bg-yellow-600/20 border-yellow-600/40 text-yellow-400',
  low: 'bg-blue-600/20 border-blue-600/40 text-blue-400',
};

const TYPE_ICONS = {
  staff: UserPlus,
  setting: Settings,
  protocol: Shield,
  training: Brain,
};

export function Dashboard() {
  const { user, systemConfig } = useAuth();
  const { emergencies, getActiveEmergencies, updateEmergencyStatus, resolveEmergency } = useEmergency();
  const navigate = useNavigate();

  const systemId = localStorage.getItem('sers_system_id') || '';

  const { data: cloudEmergencies } = useQuery({
    queryKey: ['alerts', systemId],
    queryFn: getAlerts,
    refetchInterval: 5000,
  });

  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateAlertStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts', systemId] }),
  });

  // This combines your local context with the real MongoDB data
  const combinedEmergencies = (cloudEmergencies as any[]) || [];
  const [activeTab, setActiveTab] = useState('active');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setRefreshKey(p => p + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const s = generateAISuggestions(systemConfig?.type || 'hotel', 0, emergencies.length);
    setSuggestions(s);
  }, [systemConfig, emergencies.length]);

  const userLocation = MOCK_LOCATIONS.find(loc => loc.id === user?.locationId);
  const locationId = user?.locationId || 'LOC001';

  // Filter for Active Emergencies
  const activeEmergencies = combinedEmergencies.filter(e =>
    e.status !== 'resolved' &&
    (user?.role === 'guest' ? (e.reportedBy === user.name || e.reportedBy === user.id) : true)
  );

  // Filter for All Emergencies
  const allEmergencies = combinedEmergencies.filter(e =>
    user?.role === 'guest' ? (e.reportedBy === user.name || e.reportedBy === user.id) : true
  );


  const pendingCount = activeEmergencies.filter(e => e.status === 'pending').length;
  const inProgressCount = activeEmergencies.filter(e => e.status === 'in-progress').length;
  const criticalCount = activeEmergencies.filter(e => e.level === 3).length;
  const resolvedToday = allEmergencies.filter(e => {
    const today = new Date().toDateString();
    return e.resolvedAt && new Date(e.resolvedAt).toDateString() === today;
  }).length;


  const qrUrl = `${window.location.origin}/complaint/${systemId}`;

  const stats = [
    { title: 'Active', value: activeEmergencies.length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
    { title: 'Pending', value: pendingCount, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { title: 'In Progress', value: inProgressCount, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    { title: 'Resolved Today', value: resolvedToday, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
  ];

  const activeSuggestions = suggestions.filter(s => !dismissedSuggestions.includes(s.id));

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sers-qr-${systemId}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 max-w-5xl mx-auto">
          {/* ─── HEADER ─── */}
          <div className="flex items-start justify-between mb-5 gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-gray-900">
                  {systemConfig?.name || 'Emergency Dashboard'}
                </h1>
                {criticalCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                    {criticalCount} CRITICAL
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="capitalize flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${user?.availability === 'available' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {user?.name}
                </span>
                <span>·</span>
                <span className="capitalize">{user?.role}</span>
                {userLocation && <><span>·</span><span>{userLocation.name}</span></>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* QR Code Button */}
              <button
                onClick={() => setShowQR(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm hover:shadow"
                title="Generate QR Code for Guest Complaints"
              >
                <QrCode className="w-4 h-4 text-purple-600" />
                <span className="hidden sm:block">QR Code</span>
              </button>
              <SOSButton />
            </div>
          </div>

          {/* ─── CRITICAL BANNER ─── */}
          {user?.role !== 'guest' && criticalCount > 0 && (
            <div className="mb-5 bg-red-600 text-white p-4 rounded-xl shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <div>
                  <p className="font-black text-sm">🚨 CRITICAL EMERGENCY ACTIVE</p>
                  <p className="text-xs text-red-100">{criticalCount} critical {criticalCount === 1 ? 'emergency requires' : 'emergencies require'} immediate attention</p>
                </div>
                <button onClick={() => setActiveTab('critical')} className="ml-auto px-3 py-1 bg-white/20 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-white/30">
                  View Now →
                </button>
              </div>
            </div>
          )}

          {/* ─── PROJECT DETAIL CARD ─── */}
          {systemConfig && (
            <div className="mb-5 p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-gray-700 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{systemConfig.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{systemConfig.type} · {systemConfig.primaryLocation || 'System Active'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-green-600/20 border border-green-600/30 text-green-400 rounded-lg flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Live
                  </span>
                  <button
                    onClick={() => setShowQR(true)}
                    className="px-2 py-1 bg-purple-600/20 border border-purple-600/30 text-purple-300 rounded-lg flex items-center gap-1 hover:bg-purple-600/30 transition-colors"
                  >
                    <QrCode className="w-3 h-3" /> Guest QR
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── STATS GRID ─── */}
          {user?.role !== 'guest' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.title} className={`p-4 bg-white rounded-xl border shadow-sm`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500 font-medium">{stat.title}</p>
                      <div className={`w-7 h-7 ${stat.bg} border rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                  </div>
                );
              })}
            </div>)}

          {/* ─── EMERGENCIES ─── */}
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-black text-gray-900">Emergencies</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
                Auto-refresh 5s
              </div>
            </div>
            <div className="p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active ({activeEmergencies.length})</TabsTrigger>
                  <TabsTrigger value="all">All ({allEmergencies.length})</TabsTrigger>
                  <TabsTrigger value="critical">
                    <span className={criticalCount > 0 ? 'text-red-600' : ''}>Critical ({criticalCount})</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-3">
                  {activeEmergencies.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                      <p className="font-medium">No active emergencies</p>
                      <p className="text-sm text-gray-400">All clear — system is monitoring</p>
                    </div>
                  ) : (
                    activeEmergencies.sort((a, b) => b.level - a.level).map(e => (
                      <EmergencyCard key={e._id || e.id} emergency={e}
                        showActions={user?.role !== 'guest'}
                        onUpdateStatus={status => statusMutation.mutate({ id: e._id || e.id, status })}
                        onResolve={() => statusMutation.mutate({ id: e._id || e.id, status: 'resolved' })}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="all" className="space-y-3">
                  {allEmergencies.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()).map(e => (
                    <EmergencyCard key={e._id || e.id} emergency={e}
                      showActions={user?.role !== 'guest'}
                      onUpdateStatus={status => statusMutation.mutate({ id: e._id || e.id, status })}
                      onResolve={() => statusMutation.mutate({ id: e._id || e.id, status: 'resolved' })}
                    />
                  ))}
                  {allEmergencies.length === 0 && (
                    <div className="text-center py-12 text-gray-400"><p>No emergencies recorded yet</p></div>
                  )}
                </TabsContent>

                <TabsContent value="critical" className="space-y-3">
                  {activeEmergencies.filter(e => e.level === 3).length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                      <p className="font-medium">No critical emergencies</p>
                    </div>
                  ) : (
                    activeEmergencies.filter(e => e.level === 3).map(e => (
                      <EmergencyCard key={e._id || e.id} emergency={e}
                        showActions={user?.role !== 'guest'}
                        onUpdateStatus={status => statusMutation.mutate({ id: e._id || e.id, status })}
                        onResolve={() => statusMutation.mutate({ id: e._id || e.id, status: 'resolved' })}
                      />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL: AI SUGGESTIONS ─── */}
      {user?.role !== 'guest' && (
        <div className={`${showSuggestions ? 'w-72' : 'w-10'} transition-all duration-300 bg-gray-900 text-white shrink-0 flex flex-col border-l border-gray-800 relative overflow-hidden`}>
          {/* Toggle button */}
          <button
            onClick={() => setShowSuggestions(p => !p)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-gray-900 border border-gray-700 rounded-l-lg p-1.5 z-10 hover:bg-gray-800 transition-colors"
          >
            {showSuggestions ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronLeft className="w-4 h-4 text-gray-400" />}
          </button>

          {showSuggestions && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Panel header */}
              <div className="px-4 py-4 border-b border-gray-700 shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-yellow-400" />
                  <h3 className="font-bold text-sm">AI Suggestions</h3>
                </div>
                <p className="text-xs text-gray-500">Smart recommendations for your system</p>
              </div>
              {/* Quick actions */}
              <div className="px-3 py-3 border-b border-gray-700/50 shrink-0">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Quick Actions</p>
                <div className="space-y-1.5">
                  {[
                    { label: 'Add Staff', icon: UserPlus, path: '/staff-management', color: 'text-blue-400' },
                    { label: 'Settings', icon: Settings, path: '/settings', color: 'text-gray-400' },
                    { label: 'View History', icon: BarChart3, path: '/history', color: 'text-green-400' },
                  ].map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => navigate(action.path)}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors text-left"
                      >
                        <Icon className={`w-4 h-4 ${action.color}`} />
                        <span className="text-gray-300">{action.label}</span>
                        <ChevronRight className="w-3 h-3 text-gray-600 ml-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Suggestions list */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {activeSuggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">All suggestions implemented!</p>
                  </div>
                ) : (
                  activeSuggestions.map(s => {
                    const Icon = TYPE_ICONS[s.type] || Sparkles;
                    return (
                      <div key={s.id} className={`p-3 rounded-xl border ${PRIORITY_COLORS[s.priority]} bg-opacity-20`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs font-bold capitalize">{s.priority}</span>
                          </div>
                          <button
                            onClick={() => setDismissedSuggestions(p => [...p, s.id])}
                            className="text-gray-600 hover:text-gray-400 transition-colors shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-white mb-1 leading-tight">{s.title}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{s.description}</p>
                        <button
                          onClick={() => {
                            if (s.type === 'staff') navigate('/staff-management');
                            else navigate('/settings');
                            setDismissedSuggestions(p => [...p, s.id]);
                          }}
                          className="mt-2 text-xs text-current font-medium flex items-center gap-1 hover:opacity-80"
                        >
                          Apply → <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Emergency contacts strip */}
              <div className="px-3 py-3 border-t border-gray-700/50 shrink-0">
                <p className="text-xs text-gray-500 mb-2">Emergency Contacts</p>
                <div className="space-y-1">
                  {[
                    { label: '🚔 Police', number: systemConfig?.settings?.policeNumber || '100' },
                    { label: '🚑 Ambulance', number: systemConfig?.settings?.ambulanceNumber || '108' },
                    { label: '🚒 Fire', number: systemConfig?.settings?.fireNumber || '101' },
                  ].map(c => (
                    <div key={c.label} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{c.label}</span>
                      <span className="text-white font-bold">{c.number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Collapsed state icon */}
          {!showSuggestions && (
            <div className="flex flex-col items-center pt-4 gap-3">
              <Brain className="w-5 h-5 text-yellow-400" />
              <div className="text-xs text-gray-600 [writing-mode:vertical-lr] rotate-180">AI Suggestions</div>
            </div>
          )}
        </div>)}

      {/* ─── QR CODE MODAL ─── */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowQR(false)} />
          <div className="relative z-10 bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-black text-gray-900 text-lg">Guest QR Code</h3>
                <p className="text-xs text-gray-500 mt-0.5">Guests scan to report emergencies</p>
              </div>
              <button onClick={() => setShowQR(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* QR Code */}
            <div ref={qrRef} className="flex items-center justify-center p-5 bg-gray-50 rounded-xl border border-gray-200 mb-4">
              <QRCodeSVG
                value={qrUrl}
                size={180}
                bgColor="#f9fafb"
                fgColor="#111827"
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="text-center mb-4">
              <p className="text-xs text-gray-500 mb-1">Scan URL:</p>
              <p className="text-xs font-mono bg-gray-100 px-3 py-2 rounded-lg text-gray-700 break-all">{qrUrl}</p>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-5">
              {[
                '🔍 Place QR codes at key entry points, rooms, and zones',
                '📱 Guests scan with any camera app — no app needed',
                '🚨 Reports go directly to your emergency dashboard',
                '📞 Guests also get access to emergency call services',
              ].map((tip, i) => (
                <p key={i} className="text-xs text-gray-500 flex items-start gap-2">
                  <span>{tip}</span>
                </p>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={downloadQR}
                className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" /> Download QR
              </button>
              <button
                onClick={() => { window.open(qrUrl, '_blank'); }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" /> Preview Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}