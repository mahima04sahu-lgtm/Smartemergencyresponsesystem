import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SystemConfig, SystemSettings } from '../types';
import { MOCK_USERS } from '../utils/mockData';
import { createSystem as apiCreateSystem, enterSystem as apiEnterSystem, updateSystemSettings as apiUpdateSystemSettings, loginStaff } from '../../services/api';

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
  enterSystem: (accessCode: string, email: string) => Promise<boolean>;
  updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('sers_current_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(() => {
    const storedSystem = localStorage.getItem('sers_system_config');
    return storedSystem ? JSON.parse(storedSystem) : null;
  });
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const storedUsers = localStorage.getItem('sers_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(MOCK_USERS);
      localStorage.setItem('sers_users', JSON.stringify(MOCK_USERS));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await loginStaff(email, password);
      
      if (result.success) {
        const userData = result.user;
        const systemData = result.system;

        setUser(userData);
        setSystemConfig(systemData);

        // Store everything needed for system isolation
        localStorage.setItem('sers_current_user', JSON.stringify(userData));
        if (systemData) {
          localStorage.setItem('sers_system_id', systemData._id);
          localStorage.setItem('sers_system_zones', JSON.stringify(systemData.zones || []));
          localStorage.setItem('sers_system_config', JSON.stringify(systemData));
        }

        return true;
      }
    } catch (error) {
      console.warn('Backend login failed, trying fallback:', error);
    }

    // Fallback for demo users and old systems not in MongoDB
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
    try {
      // 1. Save to MongoDB via API
      const result = await apiCreateSystem({
        ...config,
        settings: DEFAULT_SETTINGS
      }, adminPassword); // Pass password as second argument as defined in api.js

      if (!result.success) throw new Error('Failed to create system');

      const systemData = result.system;
      const systemId = result.systemId;

      // 2. Store system info in localStorage
      localStorage.setItem('sers_system_id', systemId);
      localStorage.setItem('sers_system_config', JSON.stringify(systemData));
      localStorage.setItem('sers_system_zones', JSON.stringify(systemData.zones || []));
      
      setSystemConfig(systemData);

      // 3. Create the local admin user object (matches the one created in backend)
      const adminUser: User = {
        id: `USR_ADMIN_${systemId}`,
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

      // 🧹 Wipe any old local emergencies so the new dashboard is clean
      localStorage.removeItem('sers_emergencies');
      window.dispatchEvent(new Event('sers_system_changed'));

      return { success: true, systemId };
    } catch (error) {
      console.error('System creation error:', error);
      return { success: false };
    }
  };

  const enterSystem = async (accessCode: string, email: string): Promise<boolean> => {
    try {
      const result = await apiEnterSystem(accessCode, email);
      
      if (result.success) {
        const userData = result.user;
        const systemData = result.system;

        setUser(userData);
        setSystemConfig(systemData);

        localStorage.setItem('sers_current_user', JSON.stringify(userData));
        localStorage.setItem('sers_system_id', systemData._id);
        localStorage.setItem('sers_system_zones', JSON.stringify(systemData.zones || []));
        localStorage.setItem('sers_system_config', JSON.stringify(systemData));

        // 🧹 Wipe old emergencies when entering a different system
        localStorage.removeItem('sers_emergencies');
        window.dispatchEvent(new Event('sers_system_changed'));

        return true;
      }
      return false;
    } catch (error) {
      console.warn('Backend entry failed, trying offline fallback:', error);
      
      // OFFLINE FALLBACK: Check if this user has successfully entered this system before
      const cachedSystem = JSON.parse(localStorage.getItem('sers_system_config') || 'null');
      const cachedUser = JSON.parse(localStorage.getItem('sers_current_user') || 'null');
      const staffCache = JSON.parse(localStorage.getItem('sers_staff_cache') || '[]');

      if (cachedSystem && (cachedSystem.accessCode === accessCode || cachedSystem.id === accessCode)) {
        // System code matches, now check user email
        // 1. Check if it's the last logged in user
        if (cachedUser && cachedUser.email === email) {
          setUser(cachedUser);
          setSystemConfig(cachedSystem);
          return true;
        }
        
        // 2. Check if it's ANY staff in the cached list
        const foundInCache = staffCache.find((s: any) => s.email === email);
        if (foundInCache) {
          setUser(foundInCache);
          setSystemConfig(cachedSystem);
          return true;
        }

        // 3. Guest fallback: If code matches, let any new email in as guest (offline)
        const guestUser: User = {
          id: `USR_GUEST_${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: 'guest',
          locationId: cachedSystem.id || cachedSystem._id,
        };
        setUser(guestUser);
        setSystemConfig(cachedSystem);
        return true;
      }
      
      return false;
    }
  };

  const updateSystemSettings = async (settings: Partial<SystemSettings>) => {
    if (!systemConfig) return;
    try {
      const updated: SystemConfig = {
        ...systemConfig,
        settings: { ...(systemConfig.settings || DEFAULT_SETTINGS), ...settings },
      };
      
      // Save to Backend
      const result = await apiUpdateSystemSettings(systemConfig._id, updated.settings);
      
      if (result.success) {
        setSystemConfig(updated);
        localStorage.setItem('sers_system_config', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Failed to sync settings:', error);
      toast.error('Settings saved locally but failed to sync to cloud');
    }
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
