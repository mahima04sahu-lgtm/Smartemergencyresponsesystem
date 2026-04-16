import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SystemConfig, SystemSettings } from '../types';
import { MOCK_USERS } from '../utils/mockData';

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

interface AuthContextType {
  user: User | null;
  systemConfig: SystemConfig | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginByPhone: (phone: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string, role: 'guest' | 'staff', locationId: string) => Promise<boolean>;
  createSystem: (config: Omit<SystemConfig, 'id' | 'createdAt'>, adminPassword: string) => Promise<{ success: boolean; systemId?: string }>;
  enterSystem: (identifier: string) => Promise<boolean>;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);

  useEffect(() => {
    // Load users from localStorage or use mock data
    const storedUsers = localStorage.getItem('sers_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(MOCK_USERS);
      localStorage.setItem('sers_users', JSON.stringify(MOCK_USERS));
    }

    // Check if user is logged in
    const storedUser = localStorage.getItem('sers_current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Load system config
    const storedSystem = localStorage.getItem('sers_system_config');
    if (storedSystem) {
      setSystemConfig(JSON.parse(storedSystem));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const allUsers: User[] = JSON.parse(localStorage.getItem('sers_users') || JSON.stringify(MOCK_USERS));
    const foundUser = allUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('sers_current_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const loginByPhone = async (phone: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const allUsers: User[] = JSON.parse(localStorage.getItem('sers_users') || JSON.stringify(MOCK_USERS));
    const foundUser = allUsers.find(u => u.phone === phone);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('sers_current_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sers_current_user');
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: 'guest' | 'staff',
    locationId: string
  ): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const allUsers: User[] = JSON.parse(localStorage.getItem('sers_users') || '[]');
    if (allUsers.find(u => u.email === email)) return false;

    const newUser: User = {
      id: `USR${Date.now()}`,
      email,
      name,
      role,
      locationId,
      availability: role === 'staff' ? 'available' : undefined,
      skills: role === 'staff' ? [] : undefined,
      authorizationLevel: role === 'staff' ? 'respond' : 'view-only',
    };

    const updatedUsers = [...allUsers, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('sers_users', JSON.stringify(updatedUsers));
    setUser(newUser);
    localStorage.setItem('sers_current_user', JSON.stringify(newUser));
    return true;
  };

  const createSystem = async (
    config: Omit<SystemConfig, 'id' | 'createdAt'>,
    adminPassword: string
  ): Promise<{ success: boolean; systemId?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1200));

    const systemId = `SYS${Date.now()}`;
    const newSystem: SystemConfig = {
      ...config,
      id: systemId,
      createdAt: new Date().toISOString(),
      settings: DEFAULT_SETTINGS,
    };

    localStorage.setItem('sers_system_config', JSON.stringify(newSystem));
    setSystemConfig(newSystem);

    // Create admin user for this system
    const adminUser: User = {
      id: `USR${Date.now()}`,
      email: config.adminEmail,
      name: config.adminName,
      role: 'admin',
      locationId: systemId,
      department: 'Administration',
      availability: 'available',
      phone: config.adminPhone,
      authorizationLevel: 'admin',
    };

    const allUsers: User[] = JSON.parse(localStorage.getItem('sers_users') || JSON.stringify(MOCK_USERS));
    const updatedUsers = [...allUsers, adminUser];
    localStorage.setItem('sers_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    setUser(adminUser);
    localStorage.setItem('sers_current_user', JSON.stringify(adminUser));

    return { success: true, systemId };
  };

  const enterSystem = async (identifier: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const allUsers: User[] = JSON.parse(localStorage.getItem('sers_users') || JSON.stringify(MOCK_USERS));
    const foundUser = allUsers.find(u => u.email === identifier || u.phone === identifier);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('sers_current_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const updateSystemSettings = (settings: Partial<SystemSettings>) => {
    if (!systemConfig) return;
    const updated: SystemConfig = {
      ...systemConfig,
      settings: { ...(systemConfig.settings || DEFAULT_SETTINGS), ...settings },
    };
    setSystemConfig(updated);
    localStorage.setItem('sers_system_config', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{
      user,
      systemConfig,
      login,
      loginByPhone,
      logout,
      register,
      createSystem,
      enterSystem,
      updateSystemSettings,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
