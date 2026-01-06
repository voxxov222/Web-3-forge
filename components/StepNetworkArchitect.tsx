
import React from 'react';
import { CustomNetworkParams, OnboardingState } from '../types';

interface StepNetworkArchitectProps {
  params: CustomNetworkParams;
  onUpdate: (u: Partial<OnboardingState>) => void;
}

const StepNetworkArchitect: React.FC<StepNetworkArchitectProps> = ({ params, onUpdate }) => {
  const updateParams = (updates: Partial<CustomNetworkParams>) => {
    onUpdate({ customNetwork: { ...params, ...updates } });
  };

  return (
    <section className="space-y-6">
      <div className="pb-2">
        <h3 className="text-white text-sm font-bold tracking-widest flex items-center gap-2">
            <span className="text-primary">//</span> NETWORK ARCHITECTURE
        </h3>
        <p className="text-xs text-slate-500 mt-1">Define genesis parameters and consensus rules</p>
      </div>

      <div className="space-y-4">
        <div className="bg-[#101d23] border border-border-mech rounded-lg p-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Network Identity</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 ml-1">CHAIN NAME</span>
              <input 
                type="text" 
                value={params.chainName}
                onChange={(e) => updateParams({ chainName: e.target.value })}
                className="w-full bg-[#0a0f14] border border-border-mech rounded p-2 text-xs font-mono text-primary outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 ml-1">NATIVE SYMBOL</span>
              <input 
                type="text" 
                value={params.nativeToken}
                onChange={(e) => updateParams({ nativeToken: e.target.value })}
                className="w-full bg-[#0a0f14] border border-border-mech rounded p-2 text-xs font-mono text-primary outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#101d23] border border-border-mech rounded-lg p-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 block">Consensus Engine</label>
          <div className="flex gap-2">
            {['PoS', 'PoA', 'IBFT2'].map(c => (
              <button
                key={c}
                onClick={() => updateParams({ consensus: c as any })}
                className={`flex-1 py-2 rounded text-[10px] font-bold border-2 transition-all ${
                  params.consensus === c ? 'bg-primary/20 border-primary text-white' : 'bg-[#0a0f14] border-border-mech text-slate-500'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#101d23] border border-border-mech rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Block Target</label>
            <span className="text-primary font-mono text-xs">{params.blockTime}s</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="15" 
            step="0.5"
            value={params.blockTime}
            onChange={(e) => updateParams({ blockTime: parseFloat(e.target.value) })}
            className="w-full accent-primary h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between mt-2 text-[8px] text-slate-600 font-mono">
            <span>FAST (1s)</span>
            <span>STANDARD (5s)</span>
            <span>STABLE (15s)</span>
          </div>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg font-mono">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-sm text-primary">terminal</span>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest">Genesis Preview</span>
          </div>
          <div className="text-[9px] text-slate-500 overflow-hidden">
            {`{ "config": { "chainId": 888, "homesteadBlock": 0, "eip155Block": 0, "${params.consensus.toLowerCase()}": { "period": ${params.blockTime} } }, "alloc": {}, "gasLimit": "${params.gasLimit}" }`}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepNetworkArchitect;
