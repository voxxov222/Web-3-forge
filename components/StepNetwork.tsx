
import React, { useState, useEffect } from 'react';
import { NETWORKS } from '../constants';
import { NetworkStatusType } from '../types';
import { getNetworkStatusReport } from '../services/geminiService';

interface StepNetworkProps {
  selected: string[];
  onToggle: (id: string) => void;
}

const StepNetwork: React.FC<StepNetworkProps> = ({ selected, onToggle }) => {
  const [statuses, setStatuses] = useState<Record<string, NetworkStatusType>>({});
  const [loadingStatuses, setLoadingStatuses] = useState(true);

  useEffect(() => {
    const fetchStatuses = async () => {
      setLoadingStatuses(true);
      const networkNames = NETWORKS.map(n => n.name);
      const report = await getNetworkStatusReport(networkNames);
      
      // Map names back to IDs for easier lookup
      const statusMap: Record<string, NetworkStatusType> = {};
      NETWORKS.forEach(n => {
        if (report[n.name]) {
          statusMap[n.id] = report[n.name];
        } else {
          statusMap[n.id] = 'UP'; // Fallback
        }
      });
      
      setStatuses(statusMap);
      setLoadingStatuses(false);
    };

    fetchStatuses();
  }, []);

  const getStatusColor = (status: NetworkStatusType = 'UP') => {
    switch (status) {
      case 'UP': return 'bg-green-500';
      case 'DOWN': return 'bg-red-500';
      case 'DEGRADED':
      case 'MAINTENANCE': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusText = (status: NetworkStatusType = 'UP') => {
    switch (status) {
      case 'UP': return 'OPERATIONAL';
      case 'DOWN': return 'OUTAGE';
      case 'DEGRADED': return 'CONGESTED';
      case 'MAINTENANCE': return 'MAINTENANCE';
      default: return 'ONLINE';
    }
  };

  const getStatusTextColor = (status: NetworkStatusType = 'UP') => {
    switch (status) {
      case 'UP': return 'text-green-500';
      case 'DOWN': return 'text-red-500';
      case 'DEGRADED':
      case 'MAINTENANCE': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  return (
    <section>
        <div className="pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-white text-sm font-bold tracking-widest flex items-center gap-2">
                  <span className="text-primary">//</span> SELECT BLOCKCHAIN NETWORKS
              </h3>
              <p className="text-xs text-slate-500 mt-1">Deploy across multiple chains simultaneously</p>
            </div>
            {loadingStatuses && (
              <div className="flex items-center gap-2">
                <div className="size-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <span className="text-[9px] text-primary font-mono animate-pulse">SYNCING HEALTH...</span>
              </div>
            )}
        </div>

        <div className="grid grid-cols-2 gap-3">
            {NETWORKS.map(net => {
              const status = statuses[net.id];
              return (
                <div 
                  key={net.id}
                  onClick={() => onToggle(net.id)}
                  className={`group network-card bg-[#0f161b] border-2 rounded-lg p-3 cursor-pointer transition-all relative ${
                    selected.includes(net.id) ? 'border-primary shadow-neon bg-primary/5' : 'border-border-mech hover:border-primary/60'
                  }`}
                >
                    <div className={`absolute top-2 right-2 size-4 rounded border flex items-center justify-center transition-colors ${
                      selected.includes(net.id) ? 'bg-primary border-primary' : 'border-border-mech'
                    }`}>
                      {selected.includes(net.id) && <span className="material-symbols-outlined text-[10px] text-black font-bold">check</span>}
                    </div>
                    <div className="mb-2">
                        <div className={`size-8 bg-gradient-to-br ${net.color} rounded mb-2 shadow-inner`}></div>
                        <h4 className="text-white text-sm font-bold">{net.name}</h4>
                        <p className="text-[10px] text-slate-500">{net.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className={`flex items-center gap-1 text-[9px] font-mono ${getStatusTextColor(status)}`}>
                        <div className={`size-1.5 rounded-full ${getStatusColor(status)} ${status === 'UP' ? 'pulse-neon' : 'animate-pulse'}`}></div>
                        <span>{getStatusText(status)}</span>
                      </div>
                      
                      {status === 'DEGRADED' && (
                        <span className="material-symbols-outlined text-yellow-500 text-[12px]" title="High Gas/Latency">speed</span>
                      )}
                    </div>
                </div>
              );
            })}
        </div>
        
        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-[10px] text-slate-400 font-mono leading-tight">
            <span className="text-primary font-bold">NOTE:</span> Real-time statuses are grounded via Gemini Search. Network availability may fluctuate based on current on-chain activity.
          </p>
        </div>
    </section>
  );
};

export default StepNetwork;
