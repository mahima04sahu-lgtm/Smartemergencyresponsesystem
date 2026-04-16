# SMART EMERGENCY RESPONSE SYSTEM (SERS)

A comprehensive real-time crisis detection and response coordination platform designed for hospitality environments such as hotels, resorts, and airports.

## 🎯 Features

### Core Functionality
- **SOS Emergency Button** - Prominent one-click emergency reporting
- **Multi-Level Emergency Classification**
  - Level 1: Minor (notify staff only)
  - Level 2: Moderate (notify staff + management)
  - Level 3: Critical (notify all + trigger alarm)
- **Real-Time Dashboard** - Live emergency tracking with auto-refresh
- **Smart Staff Assignment** - Automatic assignment based on availability and skills
- **Mass Alert System** - Targeted notifications based on emergency severity
- **Status Management** - Track emergencies from pending to resolution
- **Multi-Location Support** - Manage multiple properties from one system

### User Roles
- **Guest** - Report emergencies, view personal emergency history
- **Staff** - Respond to emergencies, update status, manage assignments
- **Admin** - Full access to all features, staff management, system settings

## 🚀 Getting Started

### Demo Accounts

Use these credentials to explore different user perspectives:

**Guest Account:**
- Email: `guest@example.com`
- Password: any (demo mode)

**Staff Account:**
- Email: `staff1@grandplaza.com`
- Password: any (demo mode)

**Admin Account:**
- Email: `admin@grandplaza.com`
- Password: any (demo mode)

### Quick Start
1. Click any demo account button on the login page
2. You'll be taken to the dashboard
3. Click the red SOS button to report an emergency
4. View real-time updates on the dashboard

## 📊 System Architecture

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- shadcn/ui component library
- Local Storage for data persistence

### Data Flow
1. User reports emergency via SOS button
2. Emergency classified and stored
3. Staff auto-assigned based on skills/availability
4. Alerts triggered based on severity level
5. Dashboard updates in real-time
6. Staff updates status as they respond
7. Emergency marked as resolved

## 🎨 Pages

### Login/Register
- Multi-tab authentication
- Role selection (Guest/Staff)
- Location assignment
- Demo account quick access

### Dashboard
- Real-time emergency monitoring
- Key statistics (active, pending, in-progress, resolved)
- Critical emergency alerts
- Filterable emergency views
- Auto-refresh every 5 seconds

### Emergency Report
- Detailed emergency form
- Emergency type selection (Medical, Fire, Security, etc.)
- Severity level selection (1-3)
- Location and room number
- Rich description field
- Immediate submission and routing

### History
- Complete emergency log
- Advanced filtering (type, level, status)
- Search functionality
- Timeline view for each emergency
- Performance statistics

### Staff Management
- Staff directory
- Availability status (Available, Busy, Offline)
- Skills and departments
- Real-time staff statistics

### Locations
- Multi-property management
- Zone configuration
- Location details and IDs

### Settings
- Notification preferences
- Emergency response configuration
- Data retention policies
- Integration toggles

## 🔧 Technical Details

### Emergency Levels
```typescript
Level 1 (Minor):
- Notifies: Staff only
- Color: Blue
- Examples: Minor maintenance, lost items

Level 2 (Moderate):
- Notifies: Staff + Management
- Color: Orange
- Examples: Medical assistance, security concerns

Level 3 (Critical):
- Notifies: All personnel
- Color: Red (pulsing)
- Examples: Fire, severe medical emergency, active threat
```

### Auto-Assignment Logic
```typescript
- Filters staff by location
- Matches emergency type to staff skills
- Checks staff availability
- Assigns based on emergency level:
  * Level 1: 1 staff member
  * Level 2: 2 staff members
  * Level 3: 3 staff members (if available)
```

### Real-Time Simulation
- Dashboard auto-refreshes every 5 seconds
- Emergency status updates propagate via LocalStorage
- Toast notifications for all emergency events
- Timeline tracking for emergency progression

## 🌟 Advanced Features Implemented

### ✅ Smart Staff Assignment
Automatically assigns the most appropriate staff based on:
- Emergency type and staff skills
- Staff availability status
- Location matching
- Emergency severity level

### ✅ Multi-Level Alert System
Targeted notifications to prevent panic:
- Level 1: Silent staff notification
- Level 2: Staff + management warning
- Level 3: All personnel critical alert with visual/audio cues

### ✅ Real-Time Dashboard
- Live emergency monitoring
- Auto-refresh functionality
- Status-based filtering
- Critical emergency highlighting

### ✅ Emergency Timeline
- Complete event tracking
- Timestamp for every action
- User attribution for accountability
- Exportable history

### ✅ Multi-Location Support
- Separate data streams per location
- Location-filtered views
- Scalable architecture

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1280px - 1920px)
- Tablet (768px - 1280px)
- Mobile (320px - 768px)

## 🔒 Security Notes

**Important:** This is a prototype demonstration. For production use:
- Implement proper authentication (OAuth, JWT)
- Use a real-time database (Firebase, Supabase, etc.)
- Add end-to-end encryption for sensitive data
- Implement role-based access control (RBAC)
- Add audit logging
- Comply with data protection regulations (GDPR, HIPAA)
- Never store PII without proper security measures

## 🎯 Future Enhancements

### Potential Features
- [ ] Voice-based SOS input
- [ ] AI panic detection and severity upgrade
- [ ] Indoor location tracking (GPS/Bluetooth beacons)
- [ ] Crisis replay mode (timeline playback)
- [ ] Integration with building management systems
- [ ] Mobile app (iOS/Android)
- [ ] Wearable device support
- [ ] Video call integration for remote assistance
- [ ] Analytics and reporting dashboard
- [ ] Multi-language support

### Business Model
- Free Tier: Up to 50 rooms/units
- Professional: $299/month per location
- Enterprise: Custom pricing for large chains

## 📄 License

This is a demonstration project. For production use, please implement proper security, authentication, and compliance measures.

## 🤝 Support

For questions or support, this is a prototype system designed to showcase emergency response workflows in hospitality environments.

---

**SERS** - Smart Emergency Response System
© 2026 - Reducing emergency response time through intelligent coordination
