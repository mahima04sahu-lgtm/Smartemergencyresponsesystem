import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmergency } from '../contexts/EmergencyContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Search, Filter, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { EmergencyType, EmergencyLevel } from '../types';

export function History() {
  const { user } = useAuth();
  const { emergencies } = useEmergency();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<EmergencyType | 'all'>('all');
  const [filterLevel, setFilterLevel] = useState<EmergencyLevel | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');

  const userEmergencies = emergencies.filter(e => e.locationId === user?.locationId);

  const filteredEmergencies = userEmergencies.filter(emergency => {
    const matchesSearch = emergency.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emergency.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emergency.reportedByName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || emergency.type === filterType;
    const matchesLevel = filterLevel === 'all' || emergency.level === filterLevel;
    const matchesStatus = filterStatus === 'all' || emergency.status === filterStatus;

    return matchesSearch && matchesType && matchesLevel && matchesStatus;
  });

  const stats = {
    total: userEmergencies.length,
    resolved: userEmergencies.filter(e => e.status === 'resolved').length,
    critical: userEmergencies.filter(e => e.level === 3).length,
    avgResponseTime: '12 min' // Mock data
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in-progress': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Emergency History</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Emergencies</p>
                  <p className="text-3xl font-bold mt-2">{stats.total}</p>
                </div>
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-3xl font-bold mt-2">{stats.resolved}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical Events</p>
                  <p className="text-3xl font-bold mt-2">{stats.critical}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-3xl font-bold mt-2">{stats.avgResponseTime}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search emergencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="fire">Fire</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="natural-disaster">Natural Disaster</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterLevel.toString()} onValueChange={(value: any) => setFilterLevel(value === 'all' ? 'all' : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Emergency List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Emergency Records ({filteredEmergencies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEmergencies.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No emergencies found matching your filters</p>
                </div>
              ) : (
                filteredEmergencies
                  .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
                  .map(emergency => (
                    <div
                      key={emergency.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getLevelColor(emergency.level)}>
                              Level {emergency.level}
                            </Badge>
                            <Badge className={getStatusColor(emergency.status)} variant="outline">
                              {emergency.status.toUpperCase()}
                            </Badge>
                            <Badge variant="secondary" className="capitalize">
                              {emergency.type.replace('-', ' ')}
                            </Badge>
                          </div>
                          <p className="font-medium mb-1">{emergency.description}</p>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>📍 {emergency.location} {emergency.roomNumber && `- Room ${emergency.roomNumber}`}</p>
                            <p>👤 Reported by: {emergency.reportedByName}</p>
                            {emergency.assignedStaffNames && emergency.assignedStaffNames.length > 0 && (
                              <p>👥 Assigned to: {emergency.assignedStaffNames.join(', ')}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{format(new Date(emergency.reportedAt), 'MMM dd, yyyy')}</p>
                          <p>{format(new Date(emergency.reportedAt), 'HH:mm')}</p>
                          {emergency.resolvedAt && (
                            <p className="text-green-600 mt-2">
                              Resolved: {format(new Date(emergency.resolvedAt), 'HH:mm')}
                            </p>
                          )}
                        </div>
                      </div>
                      {emergency.timeline && emergency.timeline.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-gray-600 mb-2">Timeline:</p>
                          <div className="space-y-1">
                            {emergency.timeline.map((event, idx) => (
                              <div key={idx} className="text-xs text-gray-500 flex gap-2">
                                <span className="text-gray-400">
                                  {format(new Date(event.timestamp), 'HH:mm')}
                                </span>
                                <span>{event.event}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
