// Mock data for SERS prototype
import { User, Emergency, Location } from '../types';

export const MOCK_LOCATIONS: Location[] = [
  {
    id: 'LOC001',
    name: 'Grand Plaza Hotel',
    type: 'hotel',
    address: '123 Main Street, New York, NY',
    zones: ['Lobby', 'Floor 1-5', 'Floor 6-10', 'Floor 11-15', 'Restaurant', 'Pool Area', 'Parking']
  },
  {
    id: 'LOC002',
    name: 'Seaside Resort & Spa',
    type: 'resort',
    address: '456 Ocean Drive, Miami, FL',
    zones: ['Beach', 'Main Building', 'Villa Area', 'Spa', 'Conference Center']
  },
  {
    id: 'LOC003',
    name: 'International Airport Terminal 3',
    type: 'airport',
    address: '789 Airport Blvd, Los Angeles, CA',
    zones: ['Gate A', 'Gate B', 'Gate C', 'Baggage Claim', 'Security Check', 'Food Court']
  }
];

export const MOCK_USERS: User[] = [
  // Admin
  {
    id: 'USR001',
    email: 'admin@grandplaza.com',
    name: 'Sarah Johnson',
    role: 'admin',
    locationId: 'LOC001',
    department: 'Management',
    availability: 'available'
  },
  // Staff members
  {
    id: 'USR002',
    email: 'staff1@grandplaza.com',
    name: 'Mike Chen',
    role: 'staff',
    locationId: 'LOC001',
    department: 'Medical',
    availability: 'available',
    skills: ['medical']
  },
  {
    id: 'USR003',
    email: 'staff2@grandplaza.com',
    name: 'Jessica Martinez',
    role: 'staff',
    locationId: 'LOC001',
    department: 'Security',
    availability: 'available',
    skills: ['security', 'fire']
  },
  {
    id: 'USR004',
    email: 'staff3@grandplaza.com',
    name: 'David Brown',
    role: 'staff',
    locationId: 'LOC001',
    department: 'Maintenance',
    availability: 'busy',
    skills: ['maintenance']
  },
  {
    id: 'USR005',
    email: 'staff4@grandplaza.com',
    name: 'Emily Davis',
    role: 'staff',
    locationId: 'LOC001',
    department: 'Emergency Response',
    availability: 'available',
    skills: ['medical', 'fire', 'security']
  },
  // Guests
  {
    id: 'USR006',
    email: 'guest@example.com',
    name: 'John Doe',
    role: 'guest',
    locationId: 'LOC001'
  }
];

export const MOCK_EMERGENCIES: Emergency[] = [
  {
    id: 'EMG001',
    type: 'medical',
    level: 2,
    status: 'in-progress',
    location: 'Floor 6-10',
    roomNumber: '812',
    description: 'Guest experiencing chest pain, needs immediate medical attention',
    reportedBy: 'USR006',
    reportedByName: 'John Doe',
    reportedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    locationId: 'LOC001',
    assignedStaff: ['USR002', 'USR005'],
    assignedStaffNames: ['Mike Chen', 'Emily Davis'],
    timeline: [
      {
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        event: 'Emergency reported',
        user: 'John Doe'
      },
      {
        timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        event: 'Staff assigned',
        user: 'System'
      },
      {
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        event: 'Staff en route',
        user: 'Mike Chen'
      }
    ]
  },
  {
    id: 'EMG002',
    type: 'security',
    level: 1,
    status: 'pending',
    location: 'Parking',
    description: 'Suspicious activity reported in parking lot section B',
    reportedBy: 'USR003',
    reportedByName: 'Jessica Martinez',
    reportedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    locationId: 'LOC001',
    assignedStaff: ['USR003'],
    assignedStaffNames: ['Jessica Martinez'],
    timeline: [
      {
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        event: 'Emergency reported',
        user: 'Jessica Martinez'
      }
    ]
  }
];

// Helper to get available staff
export function getAvailableStaff(locationId: string, emergencyType?: string): User[] {
  return MOCK_USERS.filter(user => 
    user.role === 'staff' && 
    user.locationId === locationId && 
    user.availability === 'available' &&
    (!emergencyType || !user.skills || user.skills.includes(emergencyType as any))
  );
}

// Auto-assign staff based on emergency type and availability
export function autoAssignStaff(emergency: Emergency, allUsers: User[]): string[] {
  const availableStaff = allUsers.filter(user =>
    user.role === 'staff' &&
    user.locationId === emergency.locationId &&
    user.availability === 'available' &&
    (!user.skills || user.skills.includes(emergency.type))
  );

  // For critical emergencies, assign multiple staff
  const numToAssign = emergency.level === 3 ? Math.min(3, availableStaff.length) : 
                      emergency.level === 2 ? Math.min(2, availableStaff.length) : 1;

  return availableStaff.slice(0, numToAssign).map(s => s.id);
}
