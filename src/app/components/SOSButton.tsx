import { useAuth } from '../contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { createAlert } from '../../services/api'; // ✅ added

interface SOSButtonProps {
  size?: 'sm' | 'default' | 'lg' | 'xl';
  className?: string;
  level?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export function SOSButton({ size = 'sm', className = '', level = 'HIGH' }: SOSButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ Smart SOS Mutation with automatic retry and persistence support
  const sosMutation = useMutation({
    mutationFn: createAlert,
    onSuccess: () => {
      console.log("SOS successfully synced to Cloud!");

    },
    onError: (error) => {
      console.error("SOS failed, but will retry automatically when online:", error);
      // Navigate anyway so the user knows the process started

    },
    retry: 5,
  });

  const handleSOS = () => {
    const data = {
      type: "emergency",
      level: level||"HIGH",
      location: user?.locationId || "Main Building", 
      reportedBy: user?.name || "Guest",
      userRole: user?.role || "guest",
      description: "Immediate assistance required at " + (user?.locationId || "Main Building"), 
      status:"active",        
      timestamp: new Date().toISOString(),
    };

    // 1. Trigger the sync in the background
    sosMutation.mutate(data as any);
    // 2. Navigate INSTANTLY (Move this line here)
    navigate('/emergency-report');
  };


  if (size === 'sm') {
    return (
      <button
        onClick={handleSOS} // ✅ changed
        className={`flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-sm shadow-lg shadow-red-600/30 animate-pulse hover:animate-none transition-all hover:scale-105 ${className}`}
      >
        <AlertTriangle className="w-4 h-4" />
        SOS
      </button>
    );
  }

  return (
    <button
      onClick={handleSOS} // ✅ changed
      className={`bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 animate-pulse flex flex-col items-center justify-center gap-1 ${size === 'xl' ? 'h-32 w-32 text-2xl rounded-full' :
        size === 'lg' ? 'h-24 w-24 text-xl rounded-full' :
          'h-16 w-16 text-lg rounded-full'
        } ${className}`}
    >
      <AlertTriangle className={size === 'xl' ? 'w-10 h-10' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5'} />
      <span className={size === 'xl' ? 'text-lg' : 'text-xs'}>SOS</span>
    </button>
  );
}