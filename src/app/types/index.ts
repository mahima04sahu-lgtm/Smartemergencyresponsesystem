// Type definitions for SERS

export type UserRole = 'guest' | 'staff' | 'admin';

export type EmergencyLevel = 1 | 2 | 3;

export type EmergencyStatus = 'active'|'pending' | 'in-progress' | 'resolved';

export type EmergencyType = 
  | 'medical'
  | 'fire'
  | 'security'
  | 'maintenance'
  | 'natural-disaster'
  | 'other';

export type SystemType = 
  | 'hotel'
  | 'hospital'
  | 'factory'
  | 'school'
  | 'restaurant'
  | 'airport'
  | 'resort'
  | 'mall'
  | 'office'
  | 'university'
  | 'other';

export type AuthorizationLevel = 'view-only' | 'respond' | 'full-access' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  locationId: string;
  department?: string;
  availability?: 'available' | 'busy' | 'offline';
  skills?: EmergencyType[];
  phone?: string;
  authorizationLevel?: AuthorizationLevel;
  age?: number;
  bloodType?: string;
  medicalConditions?: string;
  certifications?: string[];
  emergencyContact?: string;
  accessMethod?: 'email' | 'phone' | 'both';
}

export interface Emergency {
  id: string;
  type: EmergencyType;
  level: EmergencyLevel;
  status: EmergencyStatus;
  location: string;
  roomNumber?: string;
  description: string;
  reportedBy: string;
  reportedByName: string;
  reportedAt: string;
  locationId: string;
  assignedStaff?: string[];
  assignedStaffNames?: string[];
  resolvedAt?: string;
  notes?: string;
  timeline?: EmergencyTimelineEvent[];
}

export interface EmergencyTimelineEvent {
  timestamp: string;
  event: string;
  user: string;
}

export interface Location {
  id: string;
  name: string;
  type: 'hotel' | 'resort' | 'airport';
  address: string;
  zones: string[];
}

export interface Alert {
  id: string;
  emergencyId: string;
  message: string;
  recipients: UserRole[];
  timestamp: string;
  level: EmergencyLevel;
}

export interface SystemConfig {
  id: string;
  name: string;
  type: SystemType;
  description: string;
  adminEmail: string;
  adminPhone: string;
  adminName: string;
  createdAt: string;
  zones?: string[];          // Zones/areas within this system
  aiSuggestedName?: string;
  primaryLocation?: string;
  staffCount?: number;
  settings?: SystemSettings;
}

export interface SystemSettings {
  autoAssignStaff: boolean;
  aiClassification: boolean;
  silentMode: boolean;
  responseTimeTarget: number; // minutes
  dataRetention: number; // days
  soundAlerts: boolean;
  emailNotifications: boolean;
  smsAlerts: boolean;
  pushNotifications: boolean;
  allowGuestReports: boolean;
  requireGuestDetails: boolean;
  escalationTimeout: number; // minutes
  aiSuggestions: boolean;
  theme: 'dark' | 'light' | 'auto';
  language: string;
  policeNumber: string;
  ambulanceNumber: string;
  fireNumber: string;
  customEmergencyNumbers: CustomEmergencyNumber[];
}

export interface CustomEmergencyNumber {
  id: string;
  label: string;
  number: string;
  icon: string;
}

export interface GuestReport {
  id: string;
  systemId: string;
  reporterName: string;
  reporterPhone?: string;
  emergencyType: EmergencyType;
  location: string;
  description: string;
  reportedAt: string;
  status: EmergencyStatus;
}

export interface AISuggestion {
  id: string;
  type: 'staff' | 'setting' | 'protocol' | 'training';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  implemented: boolean;
}
