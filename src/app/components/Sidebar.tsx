import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  History,
  Settings,
  LogOut,
  MapPin,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Phone,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { useNavigate } from 'react-router';

export function Sidebar() {
  const { user, logout, systemConfig } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['guest', 'staff', 'admin'] },
    { path: '/emergency-report', label: 'Report Emergency', icon: AlertTriangle, roles: ['guest', 'staff', 'admin'] },
    { path: '/staff-management', label: 'Staff Management', icon: Users, roles: ['staff', 'admin'] },
    { path: '/history', label: 'History', icon: History, roles: ['staff', 'admin'] },
    { path: '/locations', label: 'Locations', icon: MapPin, roles: ['admin'] },
    { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ].filter(item => item.roles.includes(user?.role || 'guest'));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`${collapsed ? 'w-0 md:w-16 overflow-hidden' : 'w-60'} bg-gray-900 text-white h-full absolute md:relative flex flex-col transition-all duration-300 shrink-0 z-50 shadow-2xl md:shadow-none`}>
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(p => !p)}
        className="absolute -right-3 top-20 w-6 h-6 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors z-30"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-gray-300" /> : <ChevronLeft className="w-3.5 h-3.5 text-gray-300" />}
      </button>

      {/* Logo */}
      <div className={`${collapsed ? 'px-3 py-5' : 'px-5 py-5'} border-b border-gray-700/70`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="font-black text-base text-white leading-none">SERS</h1>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5 truncate">
                {systemConfig?.name || 'Emergency Response'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-4 py-3 mx-3 my-3 bg-gray-800/60 rounded-xl border border-gray-700/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-600/30 border border-red-600/40 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-xs font-black text-red-400">
                {(user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-none">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize mt-0.5 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${user?.availability === 'available' ? 'bg-green-400' : 'bg-gray-500'}`} />
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path}>
              <div
                className={`flex items-center ${collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'} rounded-xl transition-all cursor-pointer ${
                  active
                    ? 'bg-red-600 shadow-lg shadow-red-600/20'
                    : 'hover:bg-gray-800/70'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} style={{ width: '18px', height: '18px' }} />
                {!collapsed && (
                  <span className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-300'}`}>
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Emergency Quick Dial */}
      {!collapsed && (
        <div className="px-3 py-3 border-t border-gray-700/50">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 px-1">Quick Dial</p>
          <div className="space-y-1">
            {[
              { label: 'Police', number: systemConfig?.settings?.policeNumber || '100', emoji: '🚔' },
              { label: 'Ambulance', number: systemConfig?.settings?.ambulanceNumber || '108', emoji: '🚑' },
              { label: 'Fire', number: systemConfig?.settings?.fireNumber || '101', emoji: '🚒' },
            ].map(c => (
              <div key={c.label} className="flex items-center justify-between px-2 py-1">
                <span className="text-xs text-gray-500">{c.emoji} {c.label}</span>
                <span className="text-xs font-bold text-white">{c.number}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator className="bg-gray-700/50" />

      {/* Logout */}
      <div className="p-2">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${collapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'} rounded-xl text-gray-400 hover:bg-gray-800/70 hover:text-white transition-all`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut style={{ width: '18px', height: '18px' }} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
