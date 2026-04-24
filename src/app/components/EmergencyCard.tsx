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
  PauseCircle,
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

  const getLevelColor = (level: any) => {
    if (level === 3 || level === 'HIGH') return 'bg-red-500';
    if (level === 2 || level === 'MEDIUM') return 'bg-amber-400';
    if (level === 1 || level === 'LOW') return 'bg-sky-400';
    return 'bg-slate-200';
  };

  const getLevelText = (level: any) => {
    if (level === 3 || level === 'HIGH') return 'Critical';
    if (level === 2 || level === 'MEDIUM') return 'Moderate';
    if (level === 1 || level === 'LOW') return 'Minor';
    return 'Unknown';
  };


  const getStatusColor = (status: Emergency['status']) => {
    switch (status as string) {
      case 'active':      return 'bg-orange-500';
      case 'pending':     return 'bg-yellow-500';
      case 'in-progress': return 'bg-blue-500';
      case 'resolved':    return 'bg-green-500';
      default:            return 'bg-gray-500';
    }
  };

  // Dynamic border color based on status
  const getBorderColor = (status: Emergency['status']) => {
    switch (status as string) {
      case 'in-progress': return 'border-l-blue-500';
      case 'resolved':    return 'border-l-green-500';
      default:            return 'border-l-red-500';
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      medical: '🏥',
      fire: '🔥',
      security: '🔒',
      emergency: '🚨',
      maintenance: '🔧',
      'natural-disaster': '🌪️',
      other: '❓'
    };
    return icons[type] || '❓';
  };

  return (
    <Card className={`bg-white dark:bg-slate-900 border-l-8 ${getBorderColor(emergency.status)} shadow-sm overflow-hidden transition-all`}>
      <CardHeader className="pb-2">
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
                  {(emergency.status || 'active').toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          {(emergency.status as string) === 'in-progress' && (
            <div className="flex items-center gap-1 text-blue-600 animate-pulse">
              <PauseCircle className="w-6 h-6" />
              <span className="text-xs font-bold">RESPONDING</span>
            </div>
          )}
          {(emergency.status as string) === 'resolved' && (
            <CheckCircle className="w-7 h-7 text-green-500" />
          )}
          {(emergency.status as string) !== 'in-progress' && (emergency.status as string) !== 'resolved' && emergency.level === 3 && (
            <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{emergency.description || 'No description provided.'}</p>

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
            <span>{formatDistanceToNow(new Date(emergency.reportedAt || (emergency as any).createdAt || new Date()), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span>Reported by: {emergency.reportedByName || emergency.reportedBy || 'Guest'}</span>
          </div>
          {emergency.assignedStaffNames && emergency.assignedStaffNames.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span>Assigned: {emergency.assignedStaffNames.join(', ')}</span>
            </div>
          )}
        </div>

        {/* RESOLVED STATE — show green banner, no buttons */}
        {(emergency.status as string) === 'resolved' && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mt-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-semibold">Marked Resolved</span>
          </div>
        )}

        {/* ACTIVE BUTTONS — only shown to staff when not resolved */}
        {showActions && (emergency.status as string) !== 'resolved' && (
          <div className="flex gap-3 pt-4 border-t mt-2">
            {/* Show Start Responding only when active/pending */}
            {((emergency.status as string) === 'active' || (emergency.status as string) === 'pending') && (
              <Button
                variant="outline"
                className="flex-1 border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => onUpdateStatus && onUpdateStatus('in-progress')}
              >
                <PlayCircle className="w-5 h-5 mr-2 text-blue-600" />
                Start Responding
              </Button>
            )}

            {/* Show Pause/Resume when in-progress */}
            {(emergency.status as string) === 'in-progress' && (
              <Button
                variant="outline"
                className="flex-1 border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => onUpdateStatus && onUpdateStatus('pending' as any)}
              >
                <PauseCircle className="w-5 h-5 mr-2 text-blue-600" />
                Pause Response
              </Button>
            )}

            {/* Mark Resolved always visible for staff */}
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
              onClick={() => onResolve && onResolve()}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Resolve
            </Button>
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
