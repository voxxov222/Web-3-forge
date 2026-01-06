
import React from 'react';
import { InfraTemplate } from '../types';

interface StepTemplateProps {
  selected: InfraTemplate;
  onSelect: (t: InfraTemplate) => void;
}

const StepTemplate: React.FC<StepTemplateProps> = ({ selected, onSelect }) => {
  const templates = [
    { 
      id: 'full-stack' as InfraTemplate, 
      name: 'Full Stack Deployment', 
      desc: 'Nodes, APIs, and monitoring.', 
      icon: 'stacks', 
      recommended: true,
      tags: ['RPC NODES', 'API GATEWAY', 'MONITORING']
    },
    { 
      id: 'custom-network' as InfraTemplate, 
      name: 'Network Architect', 
      desc: 'Build your own custom L1/L2 network.', 
      icon: 'settings_input_component', 
      tags: ['CONSENSUS', 'GENESIS', 'VALIDATORS']
    },
    { 
      id: 'node-only' as InfraTemplate, 
      name: 'Node Infrastructure', 
      desc: 'Standalone node deployment.', 
      icon: 'dns', 
      tags: ['ARCHIVE NODE', 'AUTO-SYNC']
    },
    { 
      id: 'api-gateway' as InfraTemplate, 
      name: 'API Gateway Only', 
      desc: 'Managed API endpoints.', 
      icon: 'api', 
      tags: ['REST API', 'WEBSOCKET']
    },
  ];

  return (
    <section>
        <div className="pb-4 flex items-center justify-between">
            <h3 className="text-white text-sm font-bold tracking-widest flex items-center gap-2">
                <span className="text-primary">//</span> SELECT INFRASTRUCTURE TEMPLATE
            </h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
            {templates.map(t => (
              <div 
                key={t.id}
                onClick={() => onSelect(t.id)}
                className={`group template-card bg-[#141f26] border-2 rounded-lg p-4 cursor-pointer transition-all relative overflow-hidden ${
                  selected === t.id ? 'border-primary shadow-neon' : 'border-border-mech hover:border-primary/60'
                }`}
              >
                  {t.recommended && (
                    <div className="absolute top-2 right-2 bg-primary text-black text-[9px] font-bold px-2 py-1 rounded">RECOMMENDED</div>
                  )}
                  <div className="flex items-start gap-3">
                      <div className={`size-12 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                        selected === t.id ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-slate-900 border-border-mech text-slate-500'
                      }`}>
                          <span className="material-symbols-outlined text-xl">{t.icon}</span>
                      </div>
                      <div className="flex-1">
                          <h4 className={`font-bold mb-1 transition-colors ${selected === t.id ? 'text-white' : 'text-slate-300'}`}>
                            {t.name}
                          </h4>
                          <p className="text-slate-400 text-xs mb-2">{t.desc}</p>
                          <div className="flex flex-wrap gap-1">
                              {t.tags.map(tag => (
                                <span key={tag} className="text-[9px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                                  {tag}
                                </span>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
            ))}
        </div>
    </section>
  );
};

export default StepTemplate;
