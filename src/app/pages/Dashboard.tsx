import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getAlerts, updateAlertStatus, getAISuggestions, getAllStaff, createAlert } from '../../services/api';
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
  Settings, UserPlus, RefreshCw, Phone, Trash2
} from 'lucide-react';
import { MOCK_LOCATIONS } from '../utils/mockData';
import { QRCodeSVG } from 'qrcode.react';
import { AISuggestion } from '../types';
import { useNavigate } from 'react-router';
import { AIAssistant } from '../components/AIAssistant';

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
  const { user, logout, systemConfig } = useAuth();
  const { emergencies, getActiveEmergencies, updateEmergencyStatus, resolveEmergency } = useEmergency();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const systemId = localStorage.getItem('sers_system_id') || '';
  const isStaff = user?.role?.toLowerCase() === 'staff' || user?.role?.toLowerCase() === 'admin';

  const { data: cloudEmergencies } = useQuery({
    queryKey: ['alerts', systemId],
    queryFn: getAlerts,
    refetchInterval: 5000,
  });

  const { data: aiSuggestions } = useQuery({
    queryKey: ['ai-suggestions', systemId],
    queryFn: () => getAISuggestions(),
    refetchInterval: 30000, // Refresh AI advice every 30s
    enabled: !!systemId && user?.role !== 'guest'
  });

  // ─── OFFLINE+ONLINE SYNC LOGIC ───
  // Combine cloud data with any "unsynced" local data
  // ─── OFFLINE+ONLINE SYNC LOGIC ───
  const localEmergencies = emergencies || [];
  const cachedCloudData = queryClient.getQueryData(['alerts', systemId]) as any[];
  const cloudList = (cloudEmergencies as any[]) || cachedCloudData || [];
  
  // Deduplicate and Merge: Prefer local status if it has been updated
  const combinedEmergencies = [
    ...cloudList.map(cloud => {
      // Find the matching local alert
      const localUpdate = localEmergencies.find(l => 
        (l.timestamp === cloud.timestamp || l.reportedAt === cloud.reportedAt) && 
        l.location === cloud.location
      );
      // If the local alert exists, it might have a newer status from offline actions
      return localUpdate ? { ...cloud, ...localUpdate, _id: cloud._id } : cloud;
    }),
    ...localEmergencies.filter(local => 
      !cloudList.some(cloud => 
        (cloud.timestamp === local.timestamp || cloud.reportedAt === local.reportedAt) && 
        cloud.location === local.location
      )
    )
  ];

  // ─── STAFF MEMORY (For Offline Assignment) ───
  const { data: staffList } = useQuery({
    queryKey: ['staff', systemId],
    queryFn: getAllStaff,
    enabled: !!systemId && isStaff,
    staleTime: 1000 * 60 * 30, // Consider staff data fresh for 30 mins
  });


  // 🧠 PERSIST STAFF: Save to localStorage so AuthContext can use it offline
  useEffect(() => {
    if (staffList && staffList.length > 0) {
      localStorage.setItem('sers_staff_cache', JSON.stringify(staffList));
    }
  }, [staffList]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateAlertStatus(id, status),
    // 🚀 OPTIMISTIC UPDATE: Update UI instantly before server responds
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: ['alerts', systemId] });
      const previousAlerts = queryClient.getQueryData(['alerts', systemId]);
      queryClient.setQueryData(['alerts', systemId], (old: any) => {
        return old?.map((a: any) => {
          const alertId = a._id || a.id;
          return alertId === newStatus.id ? { ...a, status: newStatus.status } : a;
        });
      });
      return { previousAlerts };
    },
    onError: (err, newStatus, context) => {
      // 🧠 OFFLINE PERSISTENCE: We keep the local update.
      toast.warning("Cloud sync pending. Action saved locally.");
    },
  });

  // 🚀 AUTO-SYNC ENGINE: Upload offline alerts AND status changes when online
  const syncingIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const syncOfflineAlerts = async () => {
      if (navigator.onLine && combinedEmergencies.length > 0) {
        for (const emergency of combinedEmergencies) {
          const id = emergency._id || emergency.id;
          if (syncingIds.current.has(id)) continue;

          // 1. Sync New Alerts
          const isInCloud = cloudList.some(c => (c._id || c.id === emergency._id) && (c.timestamp === emergency.timestamp || c.location === emergency.location));
          if (!isInCloud && !emergency._id) {
            syncingIds.current.add(id);
            try {
              await createAlert({ ...emergency, systemId: systemId || 'default' } as any);
              queryClient.invalidateQueries({ queryKey: ['alerts', systemId] });
            } catch (e) { syncingIds.current.delete(id); }
            continue;
          }

          // 2. Sync Status Changes (If cloud version has different status)
          const cloudVersion = cloudList.find(c => c._id === emergency._id);
          if (cloudVersion && cloudVersion.status !== emergency.status) {
             syncingIds.current.add(id);
             try {
               await updateAlertStatus(emergency._id, emergency.status);
               queryClient.invalidateQueries({ queryKey: ['alerts', systemId] });
             } catch (e) { syncingIds.current.delete(id); }
          }
        }
      }
    };
    const interval = setInterval(syncOfflineAlerts, 10000);
    return () => clearInterval(interval);
  }, [combinedEmergencies, cloudList, navigator.onLine]);

  const [activeTab, setActiveTab] = useState('active');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(window.innerWidth >= 1024);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setRefreshKey(p => p + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const userLocation = MOCK_LOCATIONS.find(loc => loc.id === user?.locationId);
  const locationId = user?.locationId || 'LOC001';


  // Filter for Active Emergencies
  const activeEmergencies = combinedEmergencies.filter(e =>
    e.status !== 'resolved' &&
    (!isStaff ? (e.reportedBy === user.name || e.reportedBy === user.id) : true)
  );

  // Filter for All Emergencies
  const allEmergencies = combinedEmergencies.filter(e =>
    !isStaff ? (e.reportedBy === user.name || e.reportedBy === user.id) : true
  );

  const pendingCount = activeEmergencies.filter(e => e.status === 'active' || e.status === 'pending').length;
  const inProgressCount = activeEmergencies.filter(e => e.status === 'in-progress').length;
  const criticalCount = activeEmergencies.filter(e => String(e.level) === '3' || e.level === 'HIGH' || e.level === 3).length;
  const resolvedToday = allEmergencies.filter(e => {
    if (e.status !== 'resolved') return false;
    const today = new Date().toDateString();
    const resolvedDate = e.resolvedAt || e.updatedAt || new Date();
    return new Date(resolvedDate).toDateString() === today;
  }).length;


  const qrUrl = `${window.location.origin}/complaint/${systemId}`;

  const handleBulkResolve = async () => {
    if (!window.confirm(`Are you sure you want to resolve all ${activeEmergencies.length} active alerts? This cannot be undone.`)) return;
    
    const resolvePromise = (async () => {
      for (const e of activeEmergencies) {
        const id = e._id || e.id;
        try {
          await updateAlertStatus(id, 'resolved');
          // Also update local context
          resolveEmergency(id);
        } catch (err) {
          console.warn("Failed to resolve:", id);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['alerts', systemId] });
    })();

    toast.promise(resolvePromise, {
      loading: 'Sweeping system clean...',
      success: 'Dashboard cleared successfully!',
      error: 'Some alerts could not be resolved.',
    });
  };

  const stats = [
    { title: 'Active', value: activeEmergencies.length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
    { title: 'Pending', value: pendingCount, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { title: 'In Progress', value: inProgressCount, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    { title: 'Resolved Today', value: resolvedToday, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
  ];

  const activeSuggestions = (aiSuggestions as any[] || []).filter(s => !dismissedSuggestions.includes(s.id || s.title));

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

              {/* Bulk Resolve (ONLY SHOWS IF MESSY) */}
              {isStaff && activeEmergencies.length > 5 && (
                <button
                  onClick={handleBulkResolve}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-sm font-bold text-red-600 hover:bg-red-100 transition-all shadow-sm"
                  title="Clear all active alerts"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:block">Clear All ({activeEmergencies.length})</span>
                </button>
              )}
              <SOSButton />
            </div>
          </div>

          {/* ─── CRITICAL BANNER ─── */}
          {isStaff && criticalCount > 0 && (
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
          {isStaff && (
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
                    activeEmergencies.sort((a, b) => (b.level as any) - (a.level as any)).map(e => (
                      <EmergencyCard key={e._id || e.id} emergency={e}
                        showActions={isStaff}
                        onUpdateStatus={status => {
                          updateEmergencyStatus(e.id || (e as any)._id, status as any);
                          statusMutation.mutate({ id: e._id || e.id, status });
                        }}
                        onResolve={() => {
                          resolveEmergency(e.id || (e as any)._id);
                          statusMutation.mutate({ id: e._id || e.id, status: 'resolved' });
                        }}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="all" className="space-y-3">
                  {allEmergencies.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()).map(e => (
                    <EmergencyCard key={e._id || e.id} emergency={e}
                      showActions={isStaff}
                      onUpdateStatus={status => {
                        updateEmergencyStatus(e.id || (e as any)._id, status as any);
                        statusMutation.mutate({ id: e._id || e.id, status });
                      }}
                      onResolve={() => {
                        resolveEmergency(e.id || (e as any)._id);
                        statusMutation.mutate({ id: e._id || e.id, status: 'resolved' });
                      }}
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
                        showActions={isStaff}
                        onUpdateStatus={status => {
                          updateEmergencyStatus(e.id || (e as any)._id, status as any);
                          statusMutation.mutate({ id: e._id || e.id, status });
                        }}
                        onResolve={() => {
                          resolveEmergency(e.id || (e as any)._id);
                          statusMutation.mutate({ id: e._id || e.id, status: 'resolved' });
                        }}
                      />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating AI Button */}
      {!showSuggestions && (
        <button
          onClick={() => setShowSuggestions(true)}
          className="lg:hidden fixed bottom-6 right-6 w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-600/50 z-40 border-2 border-red-500"
        >
          <Brain className="w-6 h-6" />
        </button>
      )}

      {/* ─── RIGHT PANEL: AI ASSISTANT & SUGGESTIONS ─── */}
      <div className={`${showSuggestions ? 'w-72 md:w-80 translate-x-0' : 'w-0 translate-x-full lg:w-10 lg:translate-x-0'} absolute lg:relative right-0 top-0 bottom-0 z-50 flex transition-all duration-300 bg-gray-900 text-white shrink-0 flex-col border-l border-gray-800 overflow-hidden shadow-2xl lg:shadow-none`}>
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
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-red-500" />
                  <h3 className="font-bold text-sm">
                    {isStaff ? 'AI Suggestions' : 'Safety Assistant'}
                  </h3>
                </div>
                {/* Mobile Close Button */}
                <button 
                  onClick={() => setShowSuggestions(false)}
                  className="lg:hidden w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {isStaff ? 'Smart recommendations' : 'Live help for your emergency'}
              </p>
            </div>

            {isStaff ? (
              /* --- ADMIN/STAFF VIEW --- */
              <div className="flex flex-col h-full overflow-hidden">
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

                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Live AI Feed</p>

                  {/* REAL-TIME EMERGENCY MONITOR (Scans ALL alerts) */}
                  {(() => {
                    if (activeEmergencies.length === 0) return null;

                    const sorted = [...activeEmergencies].sort((a, b) => {
                      const ageA = new Date().getTime() - new Date(a.createdAt || a.timestamp || new Date()).getTime();
                      const ageB = new Date().getTime() - new Date(b.createdAt || b.timestamp || new Date()).getTime();
                      
                      const isA3 = String(a.level) === '3' || a.level === 'HIGH' || a.level === 3;
                      const isB3 = String(b.level) === '3' || b.level === 'HIGH' || b.level === 3;
                      
                      if (isA3 && !isB3) return -1;
                      if (!isA3 && isB3) return 1;
                      return ageB - ageA; 
                    });

                    const urgentAlert = sorted.find(e => {
                      const now = new Date().getTime();
                      const reportedAt = new Date(e.createdAt || e.timestamp || now).getTime();
                      const rawDiff = now - reportedAt;
                    
                      // Account for system clock drift (if server is behind local time)
                      // If local time is 5m ahead, rawDiff will be +300s immediately.
                      const driftOffset = (rawDiff >= 240000 && rawDiff <= 900000 && e.status === 'active') ? 300000 : 0; 
                      const timeElapsedMs = Math.max(0, rawDiff - driftOffset);
                      const elapsedMins = Math.floor(timeElapsedMs / 60000);
                      const isLevel3 = String(e.level) === '3' || e.level === 'HIGH' || e.level === 3;

                      // DEBUG: Log to help identify if trigger is blocked
                      console.log(`AI MONITOR: ${e.type} | Elapsed: ${elapsedMins}m | rawDiff: ${rawDiff}ms`);

                      // ONLY show if it's Level 3 OR Overdue (>3m)
                      return isLevel3 || elapsedMins >= 3;
                    });

                    if (!urgentAlert) return null;

                    const now = new Date().getTime();
                    const reportedAt = new Date(urgentAlert.createdAt || urgentAlert.timestamp || now).getTime();
                    const rawDiff = now - reportedAt;
                    const driftOffset = (rawDiff >= 240000 && rawDiff <= 900000 && urgentAlert.status === 'active') ? 300000 : 0; 
                    const elapsedMins = Math.floor(Math.max(0, rawDiff - driftOffset) / 60000);
                    const isLevel3 = String(urgentAlert.level) === '3' || urgentAlert.level === 'HIGH' || urgentAlert.level === 3;



                    return (
                      <div className={`p-4 rounded-2xl border-2 shadow-xl transition-all duration-700 ${
                        elapsedMins >= 9 ? 'bg-red-600 animate-[pulse_0.5s_infinite] border-white shadow-[0_0_25px_rgba(220,38,38,0.8)] text-white' :
                        elapsedMins >= 6 ? 'bg-orange-500 animate-pulse border-white/20 text-white' :
                        elapsedMins >= 3 ? 'bg-yellow-400 animate-bounce border-black/10 text-black' :
                        'bg-gray-800 border-gray-700 text-white shadow-lg'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {elapsedMins >= 9 ? <Zap className="w-4 h-4 text-white fill-white" /> : 
                           elapsedMins >= 6 ? <AlertTriangle className="w-4 h-4 text-white" /> : 
                           elapsedMins >= 3 ? <AlertTriangle className="w-4 h-4 text-black" /> : 
                           <Brain className="w-4 h-4 text-yellow-400 animate-pulse" />}
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {elapsedMins >= 9 ? 'LEVEL 3: EXTREME ESCALATION' :
                             elapsedMins >= 6 ? 'LEVEL 2: CRITICAL DELAY' :
                             elapsedMins >= 3 ? 'LEVEL 1: RESPONSE OVERDUE' :
                             'IMMEDIATE AI ACTION'}
                          </span>
                        </div>
                        
                        <div className="text-[10px] font-bold mb-1 uppercase opacity-70">
                          {urgentAlert.type} in {urgentAlert.location}
                        </div>

                        <p className="text-sm font-bold mb-3 italic leading-tight">
                          {isStaff 
                            ? `ACTION: ${urgentAlert.aiAdvice?.replace(/Staff have been notified\.?\s?/i, '').replace(/Please stay where you are\.?\s?/i, '').replace(/Please stay safe\.?\s?/i, '') || 'Immediate response needed.'}`
                            : `"${urgentAlert.aiAdvice || 'Help is on the way.'}"`}
                        </p>

                        <div className="pt-3 border-t border-current/10 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase opacity-80">
                            <span>{elapsedMins >= 3 ? `Time Elapsed: ${elapsedMins}m` : 'Responders'}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {urgentAlert.assignedStaffNames?.length || 0}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {urgentAlert.assignedStaffNames?.slice(0, 3).map((name: string) => (
                              <span key={name} className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter bg-current/10">
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {aiSuggestions && (aiSuggestions as any[]).length > 0 ? (
                    (aiSuggestions as any[]).map((s, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-red-500/30 bg-red-600/5 hover:bg-red-600/10 transition-all group">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge className={`${s.priority === 'high' ? 'bg-red-600' : 'bg-yellow-600'} text-[8px] h-4 uppercase font-black`}>
                            {s.priority}
                          </Badge>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">{s.type}</span>
                        </div>
                        <p className="text-xs font-black text-white mb-1">{s.title}</p>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{s.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Sparkles className="w-6 h-6 text-gray-700 mx-auto mb-2 animate-pulse" />
                      <p className="text-[11px] text-gray-600 italic">Analyzing system status...</p>
                    </div>
                  )}

                  {/* SYSTEM HEALTH CARD */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/5 rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-gray-500 uppercase">System Pulse</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-3 bg-red-600 animate-pulse" />
                        <div className="w-1 h-5 bg-red-600 animate-pulse [animation-delay:0.2s]" />
                        <div className="w-1 h-2 bg-red-600 animate-pulse [animation-delay:0.4s]" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-medium">Alert Coverage</span>
                        <span className="text-white font-bold">100%</span>
                      </div>
                      <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600 w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* --- GUEST VIEW --- */
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-4 shadow-inner">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Rescue Progress</span>
                  </div>

                  <p className="text-sm font-bold text-gray-100 leading-snug mb-3">
                    {activeEmergencies.length > 0
                      ? "The system has matching responders for your location. Help is on the way."
                      : "Campus Monitoring Active. System is clear."}
                  </p>

                  {activeEmergencies.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase">
                        <span>Staff Arrival</span>
                        <span className="text-blue-400">In Route</span>
                      </div>
                      <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[65%] animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>

                {activeEmergencies.length > 0 && (
                  <div className="bg-gradient-to-br from-yellow-600/20 to-gray-800/50 rounded-xl p-4 border border-yellow-600/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">AI Safety Advice</span>
                    </div>
                    <p className="text-xs text-gray-100 italic font-medium leading-relaxed">
                      "{activeEmergencies[0].aiAdvice || 'Stay calm. Our team is arriving shortly. Keep your phone nearby and follow on-site directions.'}"
                    </p>
                  </div>
                )}

                <button
                  onClick={() => window.location.href = `tel:${systemConfig?.settings?.policeNumber || '100'}`}
                  className="w-full py-4 mt-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                  <Phone className="w-4 h-4" /> Call Dispatch Center
                </button>
              </div>
            )}


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
      </div>

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