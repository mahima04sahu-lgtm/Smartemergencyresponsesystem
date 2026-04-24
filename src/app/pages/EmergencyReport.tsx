import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useEmergency } from '../contexts/EmergencyContext';
import { createAlert } from '../../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { AlertTriangle, MapPin, FileText, Shield } from 'lucide-react';
import { EmergencyType, EmergencyLevel } from '../types';
import { MOCK_LOCATIONS } from '../utils/mockData';
import { toast } from 'sonner';

export function EmergencyReport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reportEmergency } = useEmergency();

  const [emergencyType, setEmergencyType] = useState<EmergencyType>('medical');
  const [emergencyLevel, setEmergencyLevel] = useState<EmergencyLevel>(2);
  const [location, setLocation] = useState(user?.locationId || '');
  const [roomNumber, setRoomNumber] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userLocation = MOCK_LOCATIONS.find(loc => loc.id === user?.locationId);
  // Read zones from the current system (saved on system create/enter), fallback to mock
  const systemZones: string[] = JSON.parse(localStorage.getItem('sers_system_zones') || '[]');

  const emergencyTypes: { value: EmergencyType; label: string; icon: string }[] = [
    { value: 'medical', label: 'Medical Emergency', icon: '🏥' },
    { value: 'fire', label: 'Fire', icon: '🔥' },
    { value: 'security', label: 'Security Threat', icon: '🔒' },
    { value: 'maintenance', label: 'Maintenance Emergency', icon: '🔧' },
    { value: 'natural-disaster', label: 'Natural Disaster', icon: '🌪️' },
    { value: 'other', label: 'Other', icon: '❓' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to MongoDB via API (so it shows on dashboard)
      await createAlert({
        type: emergencyType,
        level: emergencyLevel,
        status: 'active',
        location: location || user?.locationId || 'Unknown',
        roomNumber: roomNumber || undefined,
        description,                          // ← This is the text the user typed
        reportedBy: user?.name || 'Guest',
        reportedByName: user?.name || 'Guest',
        userRole: user?.role || 'guest',
        locationId: user?.locationId || '',
        timestamp: new Date().toISOString()
      });

      toast.success('Emergency reported! Help is on the way.');

      // Navigate back to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      toast.error('Failed to submit emergency report');
      setIsSubmitting(false);
    }
  };

  const getLevelDescription = (level: EmergencyLevel) => {
    switch (level) {
      case 1:
        return 'Minor - Notify staff only';
      case 2:
        return 'Moderate - Notify staff and management';
      case 3:
        return 'Critical - Notify all personnel and trigger alarm';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Report Emergency</h1>
              <p className="text-gray-600">{userLocation?.name}</p>
            </div>
          </div>
        </div>

        {/* Emergency Form */}
        <form onSubmit={handleSubmit}>
          <Card className="border-l-4 border-red-600">
            <CardHeader>
              <CardTitle>Emergency Details</CardTitle>
              <CardDescription>
                Provide accurate information to ensure quick response. Your report will be immediately processed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Emergency Type */}
              <div className="space-y-2">
                <Label htmlFor="emergency-type">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Emergency Type *
                </Label>
                <Select value={emergencyType} onValueChange={(value) => setEmergencyType(value as EmergencyType)}>
                  <SelectTrigger id="emergency-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {emergencyTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Emergency Level */}
              <div className="space-y-3">
                <Label>
                  <Shield className="w-4 h-4 inline mr-2" />
                  Emergency Level *
                </Label>
                <RadioGroup
                  value={emergencyLevel.toString()}
                  onValueChange={(value) => setEmergencyLevel(parseInt(value) as EmergencyLevel)}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="1" id="level-1" />
                    <Label htmlFor="level-1" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">Level 1 - Minor</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-5">{getLevelDescription(1)}</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="2" id="level-2" />
                    <Label htmlFor="level-2" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="font-medium">Level 2 - Moderate</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-5">{getLevelDescription(2)}</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 border-red-300">
                    <RadioGroupItem value="3" id="level-3" />
                    <Label htmlFor="level-3" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                        <span className="font-medium text-red-600">Level 3 - Critical</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-5">{getLevelDescription(3)}</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Zone/Location *
                  </Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {(systemZones.length > 0 ? systemZones : (userLocation?.zones || [])).map(zone => (
                        <SelectItem key={zone} value={zone}>
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-number">Room/Unit Number (Optional)</Label>
                  <Input
                    id="room-number"
                    type="text"
                    placeholder="e.g., 812, A-23"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the emergency situation in detail. Include any relevant information that can help responders."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
                <p className="text-sm text-gray-500">
                  Provide as much detail as possible to help emergency responders assess and handle the situation effectively.
                </p>
              </div>

              {/* Warning for Critical */}
              {emergencyLevel === 3 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Critical Emergency Alert</p>
                      <p className="text-sm text-red-700 mt-1">
                        This will trigger an immediate response from all available staff and management. 
                        Emergency services will be simulated and all personnel will be notified.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 ${emergencyLevel === 3 ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Emergency Report'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Help Text */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              <strong>Need immediate help?</strong> If this is a life-threatening emergency, 
              select Level 3 - Critical. For non-urgent issues, use Level 1 - Minor.
              All reports are monitored 24/7 by our emergency response team.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
