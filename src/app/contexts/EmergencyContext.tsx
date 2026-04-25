import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Emergency, User, Alert, EmergencyType, EmergencyLevel } from '../types';
import { MOCK_EMERGENCIES, MOCK_USERS, autoAssignStaff } from '../utils/mockData';
import { toast } from 'sonner';

interface EmergencyContextType {
  emergencies: Emergency[];
  users: User[];
  alerts: Alert[];
  reportEmergency: (emergency: Omit<Emergency, 'id' | 'reportedAt' | 'assignedStaff' | 'assignedStaffNames' | 'timeline'>) => void;
  updateEmergencyStatus: (id: string, status: Emergency['status'], notes?: string) => void;
  assignStaff: (emergencyId: string, staffIds: string[]) => void;
  getEmergenciesByLocation: (locationId: string) => Emergency[];
  getActiveEmergencies: (locationId: string) => Emergency[];
  resolveEmergency: (id: string, notes?: string) => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export function EmergencyProvider({ children }: { children: React.ReactNode }) {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const storedEmergencies = localStorage.getItem('sers_emergencies');
    if (storedEmergencies) {
      setEmergencies(JSON.parse(storedEmergencies));
    } else {
      setEmergencies(MOCK_EMERGENCIES);
      localStorage.setItem('sers_emergencies', JSON.stringify(MOCK_EMERGENCIES));
    }

    const staffCache = localStorage.getItem('sers_staff_cache');
    const storedUsers = localStorage.getItem('sers_users');
    
    if (staffCache) {
      setUsers(JSON.parse(staffCache));
    } else if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(MOCK_USERS);
    }
  }, []);

  // Save emergencies to localStorage whenever they change
  useEffect(() => {
    if (emergencies.length > 0) {
      localStorage.setItem('sers_emergencies', JSON.stringify(emergencies));
    }
  }, [emergencies]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // This simulates checking for updates - in real app, this would be WebSocket/Firestore listener
      const storedEmergencies = localStorage.getItem('sers_emergencies');
      if (storedEmergencies) {
        const parsed = JSON.parse(storedEmergencies);
        setEmergencies(parsed);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const triggerAlert = useCallback((emergency: Emergency) => {
    const alert: Alert = {
      id: `ALT${Date.now()}`,
      emergencyId: emergency.id,
      message: `${emergency.level === 3 ? '🚨 CRITICAL' : emergency.level === 2 ? '⚠️ MODERATE' : 'ℹ️ MINOR'} EMERGENCY: ${emergency.type.toUpperCase()} at ${emergency.location}`,
      recipients: emergency.level === 3 ? ['guest', 'staff', 'admin'] :
                  emergency.level === 2 ? ['staff', 'admin'] :
                  ['staff'],
      timestamp: new Date().toISOString(),
      level: emergency.level
    };

    setAlerts(prev => [alert, ...prev]);

    // Show toast notification
    if (emergency.level === 3) {
      toast.error(alert.message, {
        duration: 10000,
        description: `Location: ${emergency.location} ${emergency.roomNumber ? `- Room ${emergency.roomNumber}` : ''}`
      });
    } else if (emergency.level === 2) {
      toast.warning(alert.message, {
        duration: 7000,
        description: `Location: ${emergency.location} ${emergency.roomNumber ? `- Room ${emergency.roomNumber}` : ''}`
      });
    } else {
      toast.info(alert.message, {
        duration: 5000,
        description: `Location: ${emergency.location} ${emergency.roomNumber ? `- Room ${emergency.roomNumber}` : ''}`
      });
    }
  }, []);

  const reportEmergency = useCallback((
    emergencyData: Omit<Emergency, 'id' | 'reportedAt' | 'assignedStaff' | 'assignedStaffNames' | 'timeline'>
  ) => {
    const newEmergency: Emergency = {
      ...emergencyData,
      id: `EMG${Date.now()}`,
      reportedAt: new Date().toISOString(),
      assignedStaff: [],
      assignedStaffNames: [],
      timeline: [
        {
          timestamp: new Date().toISOString(),
          event: 'Emergency reported',
          user: emergencyData.reportedByName
        }
      ]
    };

    // Auto-assign staff
    const assignedStaffIds = autoAssignStaff(newEmergency, users);
    const assignedStaffData = users.filter(u => assignedStaffIds.includes(u.id));

    newEmergency.assignedStaff = assignedStaffIds;
    newEmergency.assignedStaffNames = assignedStaffData.map(s => s.name);

    if (assignedStaffIds.length > 0) {
      newEmergency.timeline?.push({
        timestamp: new Date().toISOString(),
        event: `Staff assigned: ${assignedStaffData.map(s => s.name).join(', ')}`,
        user: 'System'
      });
    }

    setEmergencies(prev => [newEmergency, ...prev]);
    triggerAlert(newEmergency);

    toast.success('Emergency reported successfully', {
      description: 'Staff have been notified and assigned to your emergency.'
    });
  }, [users, triggerAlert]);

  const updateEmergencyStatus = useCallback((id: string, status: Emergency['status'], notes?: string) => {
    setEmergencies(prev => prev.map(emergency => {
      if (emergency.id === id) {
        const timeline = [...(emergency.timeline || [])];
        timeline.push({
          timestamp: new Date().toISOString(),
          event: `Status changed to ${status}${notes ? `: ${notes}` : ''}`,
          user: 'Staff'
        });

        return {
          ...emergency,
          status,
          notes: notes || emergency.notes,
          timeline
        };
      }
      return emergency;
    }));

    toast.success(`Emergency status updated to ${status}`);
  }, []);

  const assignStaff = useCallback((emergencyId: string, staffIds: string[]) => {
    setEmergencies(prev => prev.map(emergency => {
      if (emergency.id === emergencyId) {
        const staffData = users.filter(u => staffIds.includes(u.id));
        const timeline = [...(emergency.timeline || [])];
        timeline.push({
          timestamp: new Date().toISOString(),
          event: `Staff assigned: ${staffData.map(s => s.name).join(', ')}`,
          user: 'Admin'
        });

        return {
          ...emergency,
          assignedStaff: staffIds,
          assignedStaffNames: staffData.map(s => s.name),
          timeline
        };
      }
      return emergency;
    }));

    toast.success('Staff assigned successfully');
  }, [users]);

  const resolveEmergency = useCallback((id: string, notes?: string) => {
    setEmergencies(prev => prev.map(emergency => {
      if (emergency.id === id) {
        const timeline = [...(emergency.timeline || [])];
        timeline.push({
          timestamp: new Date().toISOString(),
          event: `Emergency resolved${notes ? `: ${notes}` : ''}`,
          user: 'Staff'
        });

        return {
          ...emergency,
          status: 'resolved' as const,
          resolvedAt: new Date().toISOString(),
          notes: notes || emergency.notes,
          timeline
        };
      }
      return emergency;
    }));

    toast.success('Emergency resolved successfully');
  }, []);

  const getEmergenciesByLocation = useCallback((locationId: string) => {
    return emergencies.filter(e => e.locationId === locationId);
  }, [emergencies]);

  const getActiveEmergencies = useCallback((locationId: string) => {
    return emergencies.filter(e => 
      e.locationId === locationId && 
      e.status !== 'resolved'
    );
  }, [emergencies]);

  return (
    <EmergencyContext.Provider value={{
      emergencies,
      users,
      alerts,
      reportEmergency,
      updateEmergencyStatus,
      assignStaff,
      getEmergenciesByLocation,
      getActiveEmergencies,
      resolveEmergency
    }}>
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (context === undefined) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
}
