import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  Users, UserCheck, UserX, Clock, Plus, X, Mail, Phone,
  Shield, Activity, Search, Filter, ChevronDown, Loader2,
  Heart, Calendar, Droplet, Award, AlertCircle, Check,
  Edit2, Trash2, Eye, EyeOff, UserPlus, Lock
} from 'lucide-react';
import { User, EmergencyType, AuthorizationLevel } from '../types';
import { toast } from 'sonner';

type AccessMethod = 'email' | 'phone' | 'both';

interface StaffForm {
  name: string;
  email: string;
  phone: string;
  accessMethod: AccessMethod;
  authorizationLevel: AuthorizationLevel;
  department: string;
  skills: EmergencyType[];
  age: string;
  bloodType: string;
  medicalConditions: string;
  certifications: string;
  emergencyContact: string;
  availability: 'available' | 'busy' | 'offline';
  password?: string;
}

const EMPTY_FORM: StaffForm = {
  name: '', email: '', phone: '', accessMethod: 'both',
  authorizationLevel: 'respond', department: '', skills: [],
  age: '', bloodType: '', medicalConditions: '',
  certifications: '', emergencyContact: '', availability: 'available',
  password: '',
};

const AUTH_LEVELS: { value: AuthorizationLevel; label: string; description: string; color: string }[] = [
  { value: 'view-only', label: 'View Only', description: 'Can see alerts & status but cannot respond', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'respond', label: 'Responder', description: 'Can acknowledge and respond to emergencies', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'full-access', label: 'Full Access', description: 'Can manage emergencies, staff & settings', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'admin', label: 'Admin', description: 'Complete system access including all configurations', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const SKILL_OPTIONS: { value: EmergencyType; label: string; emoji: string }[] = [
  { value: 'medical', label: 'Medical / First Aid', emoji: '🏥' },
  { value: 'fire', label: 'Fire Safety', emoji: '🔥' },
  { value: 'security', label: 'Security', emoji: '🛡️' },
  { value: 'maintenance', label: 'Maintenance', emoji: '🔧' },
  { value: 'natural-disaster', label: 'Disaster Response', emoji: '⛈️' },
  { value: 'other', label: 'General Response', emoji: '⚡' },
];

const DEPARTMENTS = ['Medical', 'Security', 'Maintenance', 'Emergency Response', 'Management', 'Housekeeping', 'Front Desk', 'IT Support', 'Kitchen', 'Logistics'];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvailabilityBadge(availability?: string) {
  switch (availability) {
    case 'available': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'busy': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'offline': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

function getAuthColor(level?: AuthorizationLevel) {
  return AUTH_LEVELS.find(a => a.value === level)?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}
import { addStaff, getAllStaff, deleteStaff } from '../../services/api';

export function StaffManagement() {
  const { user, systemConfig } = useAuth();
  const [staff, setStaff] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<User | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAuth, setFilterAuth] = useState<AuthorizationLevel | 'all'>('all');
  const [formStep, setFormStep] = useState<1 | 2>(1);

  const systemId = localStorage.getItem('sers_system_id');

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await getAllStaff();
      // data might be an array or { staff: [] } depending on backend response
      const staffList = Array.isArray(data) ? data : (data.staff || []);
      setStaff(staffList);
      
      // 🧠 OFFLINE SYNC: Instantly save to local memory so AuthContext can use it when Wi-Fi drops
      if (staffList.length > 0) {
        localStorage.setItem('sers_staff_cache', JSON.stringify(staffList));
      }
    } catch (error) {
      console.error('Failed to load staff:', error);
      toast.error('Failed to load staff from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (systemId) loadStaff(); 
  }, [systemId]);

  const update = (key: keyof StaffForm, value: any) => setForm(p => ({ ...p, [key]: value }));

  const toggleSkill = (skill: EmergencyType) => {
    setForm(p => ({
      ...p,
      skills: p.skills.includes(skill) ? p.skills.filter(s => s !== skill) : [...p.skills, skill],
    }));
  };

  const openAdd = () => {
    setForm({
      ...EMPTY_FORM,
      password: systemConfig?.settings?.defaultStaffPassword || ''
    });
    setEditingId(null);
    setFormStep(1);
    setShowModal(true);
  };

  const openEdit = (member: User) => {
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      accessMethod: member.accessMethod || 'both',
      authorizationLevel: member.authorizationLevel || 'respond',
      department: member.department || '',
      skills: member.skills || [],
      age: member.age?.toString() || '',
      bloodType: member.bloodType || '',
      medicalConditions: member.medicalConditions || '',
      certifications: member.certifications?.join(', ') || '',
      emergencyContact: member.emergencyContact || '',
      availability: member.availability || 'available',
    });
    setEditingId(member.id);
    setFormStep(1);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required'); return; }
    if (form.accessMethod !== 'phone' && !form.email) { toast.error('Email is required'); return; }
    if (!editingId && !form.password) { toast.error('Initial password is required'); return; }

    setSaving(true);
    try {
      const result = await addStaff({
        ...form,
        role: form.authorizationLevel === 'admin' ? 'admin' : 'staff',
        id: editingId, // backend will handle update if id exists
        systemId
      });

      if (result.success) {
        toast.success(editingId ? 'Staff member updated!' : 'Staff member added successfully!');
        setShowModal(false);
        setForm(EMPTY_FORM); // Reset form
        loadStaff();
      } else {
        throw new Error(result.error || 'Failed to save staff');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error connecting to server');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    
    try {
      const result = await deleteStaff(memberId);
      if (result.success) {
        toast.success('Staff member removed');
        loadStaff();
      } else {
        toast.error('Failed to delete staff');
      }
    } catch (error) {
      toast.error('Error connecting to server');
    }
  };

  const filteredStaff = staff.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.department?.toLowerCase().includes(search.toLowerCase());
    const matchAuth = filterAuth === 'all' || m.authorizationLevel === filterAuth;
    return matchSearch && matchAuth;
  });

  const availableCount = staff.filter(s => s.availability === 'available').length;
  const busyCount = staff.filter(s => s.availability === 'busy').length;
  const offlineCount = staff.filter(s => s.availability === 'offline').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Staff Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">{staff.length} staff members · {availableCount} available</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-600/20 transition-all hover:scale-105">
              <UserPlus className="w-4 h-4" /> Add Staff Member
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total Staff', value: staff.length, icon: Users, color: 'text-gray-700', bg: 'bg-gray-100' },
            { label: 'Available', value: availableCount, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Busy', value: busyCount, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Offline', value: offlineCount, icon: UserX, color: 'text-gray-500', bg: 'bg-gray-50' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-black text-gray-900">{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Search by name, email, department..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-red-400 shadow-sm"
            />
          </div>
          <select
            value={filterAuth} onChange={e => setFilterAuth(e.target.value as any)}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-red-400 shadow-sm"
          >
            <option value="all">All Access Levels</option>
            {AUTH_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStaff.map(member => (
            <div key={member.id} className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="font-black text-blue-600">{getInitials(member.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{member.name}</h3>
                  {member.email && !member.email.includes('@phone.sers') && (
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</p>
                  )}
                  {member.phone && (
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{member.phone}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setShowDetailModal(member)} className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors" title="View details">
                    <Eye className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  {(user?.role === 'admin') && (
                    <>
                      <button onClick={() => openEdit(member)} className="w-7 h-7 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                        <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getAvailabilityBadge(member.availability)}`}>
                  {member.availability || 'Unknown'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getAuthColor(member.authorizationLevel)}`}>
                  {AUTH_LEVELS.find(a => a.value === member.authorizationLevel)?.label || 'Responder'}
                </span>
              </div>

              {member.department && (
                <p className="text-xs text-gray-500 mb-2">📁 {member.department}</p>
              )}

              {member.skills && member.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {member.skills.map(skill => (
                    <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {SKILL_OPTIONS.find(s => s.value === skill)?.emoji} {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Access method badge */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Access via: <span className="text-gray-600 font-medium capitalize">{member.accessMethod || 'email'}</span>
                  {member.age && <> · Age: <span className="text-gray-600 font-medium">{member.age}</span></>}
                  {member.bloodType && <> · <span className="text-red-500 font-medium">{member.bloodType}</span></>}
                </p>
              </div>
            </div>
          ))}

          {/* Add Staff Card */}
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <button
              onClick={openAdd}
              className="bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-red-300 p-5 flex flex-col items-center justify-center gap-2 transition-all group min-h-[180px]"
            >
              <div className="w-12 h-12 bg-red-50 group-hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-sm font-bold text-gray-500 group-hover:text-red-600 transition-colors">Add Staff Member</span>
              <span className="text-xs text-gray-400">Gmail, phone or both</span>
            </button>
          )}
        </div>

        {filteredStaff.length === 0 && staff.length > 0 && (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No staff found matching your search</p>
          </div>
        )}
      </div>

      {/* ─── ADD/EDIT MODAL ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <div>
                <h3 className="font-black text-gray-900">{editingId ? 'Edit Staff Member' : 'Add Staff Member'}</h3>
                <p className="text-xs text-gray-500">Step {formStep} of 2 · {formStep === 1 ? 'Access & Identity' : 'Personal Details'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex">
              {[1, 2].map(s => (
                <div key={s} className={`flex-1 h-1 ${formStep >= s ? 'bg-red-600' : 'bg-gray-200'} transition-colors`} />
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {formStep === 1 ? (
                <>
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <input type="text" placeholder="John Smith" value={form.name} onChange={e => update('name', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400" />
                  </div>

                  {/* Access Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Access Method *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['email', 'phone', 'both'] as AccessMethod[]).map(m => (
                        <button key={m} type="button" onClick={() => update('accessMethod', m)}
                          className={`py-2 rounded-xl border text-sm font-medium capitalize transition-all ${
                            form.accessMethod === m ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'
                          }`}>
                          {m === 'email' ? '✉️ Email' : m === 'phone' ? '📱 Phone' : '🔗 Both'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email */}
                  {(form.accessMethod === 'email' || form.accessMethod === 'both') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Gmail / Email {form.accessMethod !== 'phone' && '*'}</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input type="email" placeholder="staff@gmail.com" value={form.email} onChange={e => update('email', e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400" />
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {(form.accessMethod === 'phone' || form.accessMethod === 'both') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number {form.accessMethod !== 'email' && '*'}</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input type="tel" placeholder="9876543210" value={form.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400" />
                      </div>
                    </div>
                  )}

                  {/* Password (Only for new staff or if editing) */}
                  {!editingId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Set Initial Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => update('password', e.target.value)}
                          className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Authorization Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">System Authorization *</label>
                    <div className="space-y-2">
                      {AUTH_LEVELS.map(level => (
                        <button key={level.value} type="button" onClick={() => update('authorizationLevel', level.value)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                            form.authorizationLevel === level.value ? `${level.color} ring-2 ring-current ring-offset-1` : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}>
                          <Shield className="w-4 h-4 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-bold">{level.label}</p>
                            <p className="text-xs opacity-80">{level.description}</p>
                          </div>
                          {form.authorizationLevel === level.value && <Check className="w-4 h-4 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                    <select value={form.department} onChange={e => update('department', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400">
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Emergency Skills</label>
                    <div className="grid grid-cols-2 gap-2">
                      {SKILL_OPTIONS.map(skill => (
                        <button key={skill.value} type="button" onClick={() => toggleSkill(skill.value)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm transition-all ${
                            form.skills.includes(skill.value) ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200'
                          }`}>
                          <span>{skill.emoji}</span>
                          <span className="text-xs">{skill.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Initial Status</label>
                    <div className="flex gap-2">
                      {(['available', 'busy', 'offline'] as const).map(a => (
                        <button key={a} type="button" onClick={() => update('availability', a)}
                          className={`flex-1 py-2 rounded-xl border text-xs font-medium capitalize transition-all ${
                            form.availability === a
                              ? a === 'available' ? 'bg-green-600 border-green-600 text-white'
                              : a === 'busy' ? 'bg-orange-600 border-orange-600 text-white'
                              : 'bg-gray-600 border-gray-600 text-white'
                              : 'bg-white border-gray-200 text-gray-500'
                          }`}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Personal Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input type="number" placeholder="25" min="16" max="80" value={form.age} onChange={e => update('age', e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Type</label>
                      <div className="relative">
                        <Droplet className="absolute left-3 top-2.5 w-4 h-4 text-red-400" />
                        <select value={form.bloodType} onChange={e => update('bloodType', e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400">
                          <option value="">Select</option>
                          {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Medical Conditions / Allergies</label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-2.5 w-4 h-4 text-red-400" />
                      <input type="text" placeholder="None / Penicillin allergy / Diabetic" value={form.medicalConditions} onChange={e => update('medicalConditions', e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Certifications / Training</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-2.5 w-4 h-4 text-yellow-500" />
                      <input type="text" placeholder="CPR, First Aid, Fire Safety (comma separated)" value={form.certifications} onChange={e => update('certifications', e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Emergency Contact</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input type="text" placeholder="Name: 9876543210" value={form.emergencyContact} onChange={e => update('emergencyContact', e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400" />
                    </div>
                  </div>

                  {/* Summary preview */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs font-bold text-gray-700 mb-2">📋 Summary</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p><span className="font-medium">Name:</span> {form.name}</p>
                      <p><span className="font-medium">Access:</span> {form.accessMethod === 'email' ? form.email : form.accessMethod === 'phone' ? form.phone : `${form.email} / ${form.phone}`}</p>
                      <p><span className="font-medium">Auth Level:</span> {AUTH_LEVELS.find(a => a.value === form.authorizationLevel)?.label}</p>
                      <p><span className="font-medium">Department:</span> {form.department || 'Not set'}</p>
                      <p><span className="font-medium">Skills:</span> {form.skills.length ? form.skills.join(', ') : 'None'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
              {formStep === 2 && (
                <button onClick={() => setFormStep(1)} className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-sm font-bold transition-colors">
                  ← Back
                </button>
              )}
              {formStep === 1 ? (
                <button onClick={() => setFormStep(2)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                  Next: Personal Details →
                </button>
              ) : (
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> {editingId ? 'Update Member' : 'Add to System'}</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── DETAIL MODAL ─── */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailModal(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
              <button onClick={() => setShowDetailModal(null)} className="absolute top-4 right-4 w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="w-16 h-16 bg-blue-500/30 rounded-xl flex items-center justify-center mb-3">
                <span className="text-2xl font-black text-white">{getInitials(showDetailModal.name)}</span>
              </div>
              <h3 className="text-xl font-black">{showDetailModal.name}</h3>
              <p className="text-gray-400 text-sm">{showDetailModal.department || 'No department'}</p>
              <div className="flex gap-2 mt-3">
                <span className={`text-xs px-2 py-1 rounded-lg border ${getAvailabilityBadge(showDetailModal.availability)}`}>{showDetailModal.availability || 'Unknown'}</span>
                <span className={`text-xs px-2 py-1 rounded-lg border ${getAuthColor(showDetailModal.authorizationLevel)}`}>{AUTH_LEVELS.find(a => a.value === showDetailModal.authorizationLevel)?.label || 'Responder'}</span>
              </div>
            </div>

            <div className="p-5 space-y-3 max-h-[50vh] overflow-y-auto">
              {[
                { icon: Mail, label: 'Email', value: showDetailModal.email?.includes('@phone.sers') ? '—' : showDetailModal.email },
                { icon: Phone, label: 'Phone', value: showDetailModal.phone || '—' },
                { icon: Calendar, label: 'Age', value: showDetailModal.age ? `${showDetailModal.age} years` : '—' },
                { icon: Droplet, label: 'Blood Type', value: showDetailModal.bloodType || '—' },
                { icon: Heart, label: 'Medical', value: showDetailModal.medicalConditions || 'None' },
                { icon: Award, label: 'Certifications', value: showDetailModal.certifications?.join(', ') || 'None' },
                { icon: Phone, label: 'Emergency Contact', value: showDetailModal.emergencyContact || '—' },
              ].map(row => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{row.label}</p>
                      <p className="text-sm font-medium text-gray-800">{row.value}</p>
                    </div>
                  </div>
                );
              })}

              {showDetailModal.skills && showDetailModal.skills.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {showDetailModal.skills.map(skill => (
                      <span key={skill} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {SKILL_OPTIONS.find(s => s.value === skill)?.emoji} {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
