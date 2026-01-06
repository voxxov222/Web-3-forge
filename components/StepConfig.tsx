
import React from 'react';
import { NodeType, OnboardingState } from '../types';
import { INSTANCE_SIZES } from '../constants';

interface StepConfigProps {
  nodeType: NodeType;
  instanceId: string;
  crossChain: boolean;
  onUpdate: (u: Partial<OnboardingState>) => void;
}

const StepConfig: React.FC<StepConfigProps> = ({ nodeType, instanceId, crossChain, onUpdate }) => {
  const nodeTypes: { id: NodeType, label: string }[] = [
    { id: 'full', label: 'FULL NODE' },
    { id: 'archive', label: 'ARCHIVE' },
    { id: 'light', label: 'LIGHT' },
  ];

  return (
    <section>
        <div className="pb-4">
            <h3 className="text-white text-sm font-bold tracking-widest flex items-center gap-2">
                <span className="text-primary">//</span> NODE CONFIGURATION
            </h3>
        </div>

        <div className="bg-[#101d23] border border-border-mech rounded-lg p-4 mb-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Node Type</label>
            <div className="grid grid-cols-3 gap-2">
                {nodeTypes.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => onUpdate({ nodeType: t.id })}
                    className={`text-[10px] py-2 px-3 rounded font-bold transition-all border-2 ${
                      nodeType === t.id 
                      ? 'bg-primary/20 border-primary text-white' 
                      : 'bg-[#0a0f14] border-border-mech text-slate-400 hover:border-primary/60'
                    }`}
                  >
                      {t.label}
                  </button>
                ))}
            </div>
        </div>

        <div className="bg-[#101d23] border border-border-mech rounded-lg p-4 mb-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Instance Size</label>
            <div className="space-y-2">
                {INSTANCE_SIZES.map(size => (
                  <div 
                    key={size.id}
                    onClick={() => onUpdate({ instanceSizeId: size.id })}
                    className={`bg-[#0a0f14] border-2 rounded p-3 cursor-pointer transition-all ${
                      instanceId === size.id ? 'border-primary' : 'border-border-mech hover:border-primary/60'
                    }`}
                  >
                      <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-bold ${instanceId === size.id ? 'text-white' : 'text-slate-300'}`}>
                            {size.name}
                          </span>
                          <span className={`${instanceId === size.id ? 'text-primary' : 'text-slate-400'} text-xs font-mono`}>
                            {size.price}
                          </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">{size.specs}</p>
                  </div>
                ))}
            </div>
        </div>

        <div className="bg-[#101d23] border border-border-mech rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cross-Chain Bridge</label>
                <div 
                  onClick={() => onUpdate({ crossChainEnabled: !crossChain })}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${crossChain ? 'bg-primary' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 size-3 bg-white rounded-full transition-all ${crossChain ? 'left-6' : 'left-1'}`}></div>
                </div>
            </div>
            <p className="text-[10px] text-slate-500 mb-3">Enable automatic asset bridging between deployed chains</p>
            <div className="flex gap-2">
                <span className={`text-[9px] px-2 py-1 rounded border transition-colors ${crossChain ? 'bg-primary/10 text-primary border-primary/30' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>LAYER ZERO</span>
                <span className={`text-[9px] px-2 py-1 rounded border transition-colors ${crossChain ? 'bg-primary/10 text-primary border-primary/30' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>WORMHOLE</span>
            </div>
        </div>
    </section>
  );
};

export default StepConfig;
