import React, { useState } from 'react';
import { Brain, X, Sparkles, Zap, Shield, MessageSquare, ChevronRight } from 'lucide-react';

interface AIAssistantProps {
  alerts?: any[];
  staffCount?: number;
  activeStaff?: number;
}

export function AIAssistant({ alerts = [], staffCount = 0, activeStaff = 0 }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getInsights = () => {
    if (alerts.length === 0) return "All systems clear. No active emergencies reported.";
    const critical = alerts.filter(a => a.level === '3').length;
    if (critical > 0) return `Caution: There are ${critical} critical alerts. Staff matching has been prioritized for these zones.`;
    return `System monitoring ${alerts.length} active alerts. ${activeStaff}/${staffCount} responders are currently on site.`;
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gray-900 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
        <Brain className="w-6 h-6 relative z-10" />
      </button>

      {/* AI Panel */}
      <div className={`fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 transition-all duration-500 z-50 origin-bottom-right overflow-hidden ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10'}`}>
        {/* Header */}
        <div className="bg-gray-900 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black tracking-widest uppercase opacity-70">SERS Intelligence</p>
              <h3 className="text-sm font-bold">CrisisSync AI</h3>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
          {/* Real-time Insight */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-3">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">Live Insight</span>
            </div>
            <p className="text-xs text-gray-800 font-medium leading-relaxed">
              {getInsights()}
            </p>
          </div>

          {/* AI Suggestions List */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-1">Smart Suggestions</p>
            
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white border rounded-lg flex items-center justify-center text-blue-600">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-700">Optimize Staff Routes</span>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white border rounded-lg flex items-center justify-center text-purple-600">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-700">Generate Incident Report</span>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white border rounded-lg flex items-center justify-center text-green-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-700">Ask AI Dispatcher</span>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">AI Online</span>
          </span>
          <span className="text-[10px] text-gray-400">Powered by Gemini 1.5</span>
        </div>
      </div>
    </>
  );
}
