
import React, { useState } from 'react';
import { OnboardingState, SmartContractLab } from '../types';
import { generateContractCode } from '../services/geminiService';

interface StepContractLabProps {
  lab: SmartContractLab;
  onUpdate: (u: Partial<OnboardingState>) => void;
}

const StepContractLab: React.FC<StepContractLabProps> = ({ lab, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleGenerate = async (template: string) => {
    setLoading(true);
    const isRust = template === 'Anchor-Rust';
    setLogs(prev => [...prev, isRust ? `[CARGO] Initializing Anchor workspace...` : `[ZEPPELIN] Fetching ${template} blueprint...`]);
    
    const requirements = isRust 
      ? "Solana program using Anchor framework, basic account state, and initialize instruction." 
      : "Standard implementation with security modifiers.";
      
    const code = await generateContractCode(template, requirements);
    onUpdate({ contractLab: { ...lab, template: template as any, code } });
    setLoading(false);
    setLogs(prev => [...prev, `[SUCCESS] ${template} ${isRust ? 'program' : 'logic'} generated.`]);
  };

  const handleDeploy = () => {
    onUpdate({ contractLab: { ...lab, deploymentStatus: 'compiling' } });
    const isRust = lab.template === 'Anchor-Rust';
    
    setLogs(prev => [
      ...prev, 
      isRust ? "[ANCHOR] Running 'anchor build'..." : "[HARDHAT] Compiling 1 Solidity file...",
      isRust ? "[CARGO] Building Rust target..." : "[HARDHAT] Generating ABI/Bytecode..."
    ]);
    
    setTimeout(() => {
      setLogs(prev => [...prev, "[FORGE] Injecting artifacts into neural tunnel...", "[FORGE] Estimating gas/compute units..."]);
      onUpdate({ contractLab: { ...lab, deploymentStatus: 'deploying' } });
      
      setTimeout(() => {
        const hash = "0x" + Math.random().toString(16).slice(2, 12);
        const address = isRust ? "Fg6PaFv..." + Math.random().toString(16).slice(2, 6) : hash;
        setLogs(prev => [...prev, `[SUCCESS] ${isRust ? 'Program' : 'Contract'} deployed at ${address}`, "[WEB3] Verified on explorer."]);
        onUpdate({ contractLab: { ...lab, deploymentStatus: 'success' } });
      }, 2000);
    }, 1500);
  };

  return (
    <section className="space-y-4">
      <div className="pb-2">
        <h3 className="text-white text-sm font-bold tracking-widest flex items-center gap-2">
            <span className="text-primary">//</span> SMART CONTRACT LAB
        </h3>
        <p className="text-xs text-slate-500 mt-1">Forge OpenZeppelin blueprints or Solana Rust programs</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['ERC20', 'ERC721', 'Anchor-Rust'].map(t => (
          <button
            key={t}
            onClick={() => handleGenerate(t)}
            className={`flex-1 min-w-[100px] py-2 border rounded text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
              lab.template === t ? 'bg-primary text-black border-primary shadow-neon' : 'bg-[#101d23] border-border-mech text-slate-400 hover:border-primary/50'
            }`}
          >
            <span>{t}</span>
            <span className="text-[7px] opacity-50 font-mono tracking-tighter">
              {t === 'Anchor-Rust' ? 'SOLANA v0.29' : 'ZEPPELIN v5.0'}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-[#0a0f14] border border-border-mech rounded-lg overflow-hidden h-72 flex flex-col group relative">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
        <div className="bg-[#141f26] px-3 py-2 border-b border-border-mech flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 mr-2">
              <div className="size-2.5 rounded-full bg-[#ff5f56]"></div>
              <div className="size-2.5 rounded-full bg-[#ffbd2e]"></div>
              <div className="size-2.5 rounded-full bg-[#27c93f]"></div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">code</span>
              {lab.template === 'Anchor-Rust' ? 'lib.rs' : 'ForgeContract.sol'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-bold text-slate-600 tracking-widest font-mono">
              {lab.template === 'Anchor-Rust' ? 'ANCHOR_IDE' : 'REMIX_IDE_v0.3'}
            </span>
            {loading && <div className="size-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>}
          </div>
        </div>
        <div className="flex-1 p-3 overflow-y-auto font-mono text-[10px] text-slate-400 leading-relaxed scrollbar-thin">
          <pre className="whitespace-pre-wrap">
            {loading ? "// AI is generating cross-chain logic..." : lab.code || "// Select a template to begin coding..."}
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={handleDeploy}
          disabled={!lab.code || lab.deploymentStatus !== 'idle'}
          className="py-3 bg-primary text-black font-bold rounded shadow-neon hover:scale-[1.02] transition-all disabled:opacity-50 flex flex-col items-center justify-center leading-tight"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            {lab.deploymentStatus === 'idle' ? 'DEPLOY ON-CHAIN' : 'BUILDING...'}
          </div>
          <span className="text-[8px] font-mono tracking-tighter mt-0.5 opacity-70">
            {lab.template === 'Anchor-Rust' ? 'VIA ANCHOR KERNEL' : 'VIA HARDHAT KERNEL'}
          </span>
        </button>
        <button 
          className="py-3 border border-border-mech text-slate-400 font-bold rounded hover:text-white hover:bg-white/5 transition-all flex flex-col items-center justify-center leading-tight"
          onClick={() => window.open(lab.template === 'Anchor-Rust' ? 'https://beta.solpg.io' : 'https://remix.ethereum.org', '_blank')}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            EXTERNAL IDE
          </div>
          <span className="text-[8px] font-mono tracking-tighter mt-0.5 opacity-70">BROWSER SYNC</span>
        </button>
      </div>

      {logs.length > 0 && (
        <div className="bg-black/50 p-3 border border-border-mech rounded font-mono text-[9px] space-y-1 max-h-32 overflow-y-auto hide-scrollbar border-l-4 border-l-primary/50">
          {logs.map((log, i) => (
            <div key={i} className={
              log.includes('SUCCESS') ? 'text-green-500' : 
              log.includes('ZEPPELIN') || log.includes('ANCHOR') ? 'text-primary' :
              log.includes('HARDHAT') || log.includes('CARGO') ? 'text-orange-400' :
              'text-slate-500'
            }>
              <span className="opacity-50 mr-2">{i.toString().padStart(2, '0')}</span>
              {log}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default StepContractLab;
