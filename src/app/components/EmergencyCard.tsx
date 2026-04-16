import React from 'react';
import { Emergency } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle,
  PlayCircle,
  Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EmergencyCardProps {
  emergency: Emergency;
  onUpdateStatus?: (status: Emergency['status']) => void;
  onResolve?: () => void;
  showActions?: boolean;
}

export function EmergencyCard({ 
  emergency, 
  onUpdateStatus, 
  onResolve,
  showActions = false 
}: EmergencyCardProps) {
  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Minor';
      case 2: return 'Moderate';
      case 3: return 'Critical';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: Emergency['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in-progress': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      medical: '🏥',
      fire: '🔥',
      security: '🔒',
      maintenance: '🔧',
      'natural-disaster': '🌪️',
      other: '❓'
    };
    return icons[type] || '❓';
  };

  return (
    <Card className={`border-l-4 ${getLevelColor(emergency.level)} shadow-md hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getTypeIcon(emergency.type)}</div>
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="capitalize">{emergency.type.replace('-', ' ')}</span>
              </CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge className={getLevelColor(emergency.level)}>
                  Level {emergency.level} - {getLevelText(emergency.level)}
                </Badge>
                <Badge className={getStatusColor(emergency.status)} variant="outline">
                  {emergency.status.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          {emergency.level === 3 && (
            <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{emergency.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>
              {emergency.location}
              {emergency.roomNumber && ` - Room ${emergency.roomNumber}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{formatDistanceToNow(new Date(emergency.reportedAt), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span>Reported by: {emergency.reportedByName}</span>
          </div>
          {emergency.assignedStaffNames && emergency.assignedStaffNames.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span>Assigned: {emergency.assignedStaffNames.join(', ')}</span>
            </div>
          )}
        </div>

        {showActions && emergency.status !== 'resolved' && (
          <div className="flex gap-2 pt-2 border-t">
            {emergency.status === 'pending' && onUpdateStatus && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onUpdateStatus('in-progress')}
              >
                <PlayCircle className="w-4 h-4 mr-1" />
                Start Response
              </Button>
            )}
            {emergency.status === 'in-progress' && onResolve && (
              <Button 
                size="sm" 
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={onResolve}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark Resolved
              </Button>
            )}
          </div>
        )}

        {emergency.notes && (
          <div className="text-sm bg-gray-50 p-2 rounded">
            <strong>Notes:</strong> {emergency.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
