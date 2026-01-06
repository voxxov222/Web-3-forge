import React, { useState, useEffect, useRef } from 'react';
import { BrowserProvider, ContractFactory } from 'ethers';
import { OnboardingState } from '../types.ts';
import { 
  generateDeploymentBriefing, 
  generateDeploymentTTS, 
  generateContractArtifacts,
  executeShellCommand,
  generateContractCode
} from '../services/geminiService.ts';

interface DeploymentConsoleProps {
  state: OnboardingState;
  onFinished: () => void;
}

interface CommandShortcut {
  id: string;
  label: string;
  cmd: string;
  icon: string;
  category: 'CORE' | 'SOLANA' | 'EVM' | 'ZEPPELIN' | 'REMIX';
}

const COMMAND_SHORTCUTS: CommandShortcut[] = [
  { id: 'ls', label: 'List Files', cmd: 'ls', icon: 'list', category: 'CORE' },
  { id: 'status', label: 'Git Status', cmd: 'git status', icon: 'account_tree', category: 'CORE' },
  { id: 'z-deploy', label: 'Zeppelin Deploy', cmd: 'forge deploy --zeppelin', icon: 'security', category: 'ZEPPELIN' },
  { id: 'remix-push', label: 'Remix Push', cmd: 'remixd --push-current', icon: 'cloud_upload', category: 'REMIX' },
  { id: 'anchor-build', label: 'Anchor Build', cmd: 'anchor build', icon: 'architecture', category: 'SOLANA' },
  { id: 'solana-deploy', label: 'Solana Deploy', cmd: 'solana deploy', icon: 'rocket', category: 'SOLANA' },
  { id: 'hh-compile', label: 'Hardhat Compile', cmd: 'npx hardhat compile', icon: 'terminal', category: 'EVM' },
  { id: 'hh-node', label: 'Run Local Node', cmd: 'npx hardhat node', icon: 'router', category: 'EVM' },
];

const DeploymentConsole: React.FC<DeploymentConsoleProps> = ({ state, onFinished }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'executing' | 'complete'>('idle');
  const [briefing, setBriefing] = useState("Initializing kernel components...");
  const [currentFile, setCurrentFile] = useState('README.md');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [showEliteMenu, setShowEliteMenu] = useState(false);
  const [activeEliteModule, setActiveEliteModule] = useState<string | null>(null);
  const [showZeppelinWizard, setShowZeppelinWizard] = useState(false);
  
  const [wizardConfig, setWizardConfig] = useState({
    name: 'ForgeToken',
    symbol: 'FRG',
    type: 'ERC20',
    features: ['Mintable', 'Pausable', 'Ownable']
  });

  const [integrations, setIntegrations] = useState({
    hardhat: 'offline',
    remix: 'offline',
    zeppelin: 'offline',
    solana: 'ready'
  });

  const logEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const initializeShell = async () => {
    addLog("ForgeOS v5.2.5 (tty1) - Interactive Infrastructure Kernel");
    addLog("Project: " + (state.customNetwork?.chainName || "Generic-Cluster"));
    addLog("Ready for deployment. Use 'help' to see system capabilities.");
    
    const b = await generateDeploymentBriefing(state);
    setBriefing(b);
    await generateDeploymentTTS("Shell active. Systems standing by for instruction.");
  };

  const simulateProgress = async (label: string, duration: number = 2000) => {
    const steps = 10;
    const interval = duration / steps;
    for (let i = 0; i <= steps; i++) {
      const percent = i * 10;
      const bar = '█'.repeat(i) + '░'.repeat(steps - i);
      setLogs(prev => {
        const last = prev[prev.length - 1];
        const logLine = `${label} [${bar}] ${percent}%`;
        if (last && last.startsWith(label)) {
          return [...prev.slice(0, -1), logLine];
        }
        return [...prev, logLine];
      });
      await new Promise(r => setTimeout(r, interval));
    }
  };

  const runCommand = async (fullCmd: string) => {
    const cmd = fullCmd.trim().toLowerCase();
    
    setLogs(prev => [...prev, `forge@kernel:~$ ${fullCmd}`]);
    setStatus('executing');

    if (cmd === 'help') {
      addLog("Available commands:");
      addLog("  ls                      - List project directory structure");
      addLog("  cat [file]              - Display file contents");
      addLog("  forge deploy            - Initiate standard cluster deployment");
      addLog("  forge zeppelin --wizard - Open interactive OpenZeppelin Wizard");
      addLog("  remixd --push           - Synchronize current project with Remix IDE");
      addLog("  clear                   - Wipe terminal buffer");
      setStatus('idle');
      return;
    }

    if (cmd === '1337') {
      addLog(">>> UNLOCKING ELITE MODULES...");
      setShowEliteMenu(true);
      setStatus('idle');
      return;
    }

    if (cmd.includes('zeppelin --wizard') || cmd === 'zeppelin') {
      setShowZeppelinWizard(true);
      addLog(">>> Opening Zeppelin Protocol Bridge...");
      setStatus('idle');
      return;
    }

    if (cmd.includes('deploy --zeppelin')) {
      setIntegrations(prev => ({ ...prev, zeppelin: 'active' }));
      addLog(">>> INITIATING OPENZEPPELIN SECURE DEPLOYMENT...");
      await simulateProgress("[ZEPPELIN] Fetching secure library v5.0.0", 1200);
      addLog("[ZEPPELIN] Verifying AccessControl.sol, ERC20.sol, ReentrancyGuard.sol...");
      await simulateProgress("[ZEPPELIN] Injecting security modifiers", 1500);
      addLog("[ZEPPELIN] Local static analysis passed.");
      await runRealDeployment();
      setIntegrations(prev => ({ ...prev, zeppelin: 'synced' }));
      setStatus('idle');
      return;
    }

    if (cmd === 'clear') {
      setLogs([]);
      setStatus('idle');
      return;
    }

    if (cmd === 'exit') {
      onFinished();
      return;
    }

    const output = await executeShellCommand(fullCmd, state, logs);
    addLog(output);
    setStatus('idle');
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === 'executing') return;
    runCommand(input.trim());
    setInput('');
  };

  const handleWizardSubmit = async () => {
    setShowZeppelinWizard(false);
    addLog(`>>> [ZEPPELIN] Generating ${wizardConfig.type} Contract: ${wizardConfig.name}...`);
    setStatus('executing');
    
    const requirements = `Create a ${wizardConfig.type} named ${wizardConfig.name} (${wizardConfig.symbol}). Features: ${wizardConfig.features.join(', ')}. Use OpenZeppelin v5.0.`;
    const code = await generateContractCode(wizardConfig.type, requirements);
    
    setGeneratedCode(code);
    setCurrentFile('contracts/Forge.sol');
    addLog("[SUCCESS] Logic generated via Gemini Pro 3.");
    addLog("View generated code in contracts/Forge.sol");
    setStatus('idle');
    await generateDeploymentTTS("Contract logic synthesized successfully.");
  };

  const runRealDeployment = async () => {
    try {
      if (!(window as any).ethereum) {
        addLog("CRITICAL: No EVM provider found. Transaction aborted.");
        return;
      }
      addLog(">>> INITIATING ON-CHAIN HANDSHAKE...");
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      addLog("COMPILING ARTIFACTS...");
      const artifacts = await generateContractArtifacts(state.contractLab?.template || 'ERC20', "On-chain deploy");
      addLog("REQUESTING SIGNATURE...");
      await generateDeploymentTTS("Please authorize the transaction signature.");
      const factory = new ContractFactory(artifacts.abi, artifacts.bytecode, signer);
      const contract = await factory.deploy();
      addLog(`TX_HASH: ${contract.deploymentTransaction()?.hash}`);
      await contract.waitForDeployment();
      addLog(`SUCCESS: Deployed at ${await contract.getAddress()}`);
    } catch (err: any) {
      addLog(`ERROR: ${err.message || 'Aborted.'}`);
    }
  };

  useEffect(() => {
    initializeShell();
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="fixed inset-0 z-[100] bg-background-dark flex flex-col font-mono text-primary animate-in fade-in duration-300">
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none"></div>
      
      {showZeppelinWizard && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="w-full max-w-md bg-surface-dark border-2 border-primary shadow-neon rounded-lg overflow-hidden flex flex-col">
            <header className="bg-primary text-black px-4 py-3 font-black flex justify-between items-center italic">
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">auto_fix_high</span>ZEPPELIN_WIZARD</span>
              <button onClick={() => setShowZeppelinWizard(false)}><span className="material-symbols-outlined">close</span></button>
            </header>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-black uppercase">Token Name</label>
                <input 
                  type="text" 
                  value={wizardConfig.name}
                  onChange={(e) => setWizardConfig({...wizardConfig, name: e.target.value})}
                  className="w-full bg-black border border-border-mech rounded p-2 text-xs text-white focus:border-primary outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-black uppercase">Symbol</label>
                  <input 
                    type="text" 
                    value={wizardConfig.symbol}
                    onChange={(e) => setWizardConfig({...wizardConfig, symbol: e.target.value})}
                    className="w-full bg-black border border-border-mech rounded p-2 text-xs text-white focus:border-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-black uppercase">Standard</label>
                  <select 
                    value={wizardConfig.type}
                    onChange={(e) => setWizardConfig({...wizardConfig, type: e.target.value})}
                    className="w-full bg-black border border-border-mech rounded p-2 text-xs text-white focus:border-primary outline-none"
                  >
                    <option>ERC20</option>
                    <option>ERC721</option>
                    <option>ERC1155</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-black uppercase">Features</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Mintable', 'Burnable', 'Pausable', 'Ownable', 'Permit', 'Votes'].map(feat => (
                    <button 
                      key={feat}
                      onClick={() => {
                        const newFeatures = wizardConfig.features.includes(feat) 
                          ? wizardConfig.features.filter(f => f !== feat) 
                          : [...wizardConfig.features, feat];
                        setWizardConfig({...wizardConfig, features: newFeatures});
                      }}
                      className={`text-[9px] py-1 px-2 border rounded font-bold text-left transition-colors ${wizardConfig.features.includes(feat) ? 'border-primary text-primary bg-primary/10' : 'border-border-mech text-slate-500'}`}
                    >
                      {feat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={handleWizardSubmit}
                className="w-full py-3 bg-primary text-black font-black uppercase text-xs rounded shadow-neon hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined text-sm">memory</span>
                GENERATE_LOGIC
              </button>
            </div>
          </div>
        </div>
      )}

      {showEliteMenu && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="w-full max-w-5xl bg-[#05080b] border-2 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.2)] rounded-lg overflow-hidden flex flex-col md:flex-row h-[85vh]">
            <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-green-500/30 flex flex-col bg-black/40">
              <div className="bg-green-500 text-black px-4 py-3 font-black flex justify-between items-center tracking-tighter uppercase italic">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">security</span>FORGE_ELITE_OS</span>
                <button onClick={() => { setShowEliteMenu(false); setActiveEliteModule(null); }}><span className="material-symbols-outlined">close</span></button>
              </div>
              <div className="p-2 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                {[
                  { id: '3d-charts', title: '3D Telemetry', icon: 'bar_chart_4_bars', desc: 'Real-time 3D data metrics' },
                  { id: 'gui-plugin', title: 'GUI Plugin Hub', icon: 'extension', desc: 'Hardhat / Remix / Zeppelin control' },
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => setActiveEliteModule(item.id)}
                    className={`w-full p-4 rounded text-left transition-all border ${activeEliteModule === item.id ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-transparent border-transparent text-green-900 hover:bg-green-500/10'}`}
                  >
                    <div className="flex items-center gap-3 mb-1"><span className="material-symbols-outlined text-lg">{item.icon}</span><span className="text-xs font-black uppercase tracking-widest">{item.title}</span></div>
                    <p className="text-[9px] font-mono leading-tight">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-black overflow-hidden relative">
              {activeEliteModule === 'gui-plugin' && (
                <div className="p-8 grid grid-cols-2 gap-6 bg-[#020406] h-full">
                   <div className="col-span-2 border-b border-green-500/20 pb-4 mb-2 flex justify-between items-center"><h2 className="text-green-500 font-black tracking-tighter text-lg uppercase">Plugin Dashboard</h2></div>
                   {[{ name: 'Zeppelin Wizard', icon: 'auto_fix_high', action: () => { setShowEliteMenu(false); setShowZeppelinWizard(true); } }, { name: 'Remix Sync', icon: 'sync_alt', action: () => runCommand('remixd --push') }].map(p => (
                     <div key={p.name} className="bg-green-500/5 border border-green-500/20 p-5 rounded-lg flex items-start gap-4 h-fit">
                        <div className="size-12 rounded bg-green-500/10 flex items-center justify-center text-green-500"><span className="material-symbols-outlined">{p.icon}</span></div>
                        <div><div className="text-green-400 text-xs font-black uppercase mb-1">{p.name}</div><button onClick={p.action} className="px-3 py-1 bg-green-500 text-black font-bold text-[9px] rounded">RUN</button></div>
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="h-10 bg-[#101d23] border-b border-border-mech flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-sm text-primary">terminal</span>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">FORGE_KERNEL_TTY</span>
        </div>
        <button onClick={onFinished} className="text-primary/70 hover:text-primary transition-colors text-[9px] font-bold border border-primary/20 px-2 py-0.5 rounded">TERMINATE</button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-52 bg-[#0a0f14] border-r border-border-mech hidden lg:flex flex-col">
          <div className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter border-b border-border-mech">Workspace</div>
          <div className="p-2 space-y-1 overflow-y-auto custom-scrollbar flex-1">
            {['README.md', 'Anchor.toml', 'hardhat.config.js', 'package.json', 'contracts/Forge.sol', 'programs/src/lib.rs'].map(file => (
              <button 
                key={file} 
                onClick={() => setCurrentFile(file)} 
                className={`w-full p-2 text-[10px] text-left rounded transition-all flex items-center gap-2 ${currentFile === file ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-slate-500 hover:bg-white/5 border-l-2 border-transparent'}`}
              >
                <span className="material-symbols-outlined text-[14px]">{file.endsWith('.md') ? 'description' : 'code'}</span>
                {file}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-black overflow-hidden border-r border-border-mech">
          <div className="h-1/3 border-b border-border-mech bg-[#05080b] p-4 text-[11px] text-slate-400 font-mono whitespace-pre-wrap overflow-y-auto custom-scrollbar relative">
            <div className="absolute top-2 right-4 text-[8px] font-bold text-slate-700 bg-black/40 px-2 py-0.5 rounded border border-white/5">BUFFER_PREVIEW // {currentFile}</div>
            {currentFile === 'contracts/Forge.sol' && generatedCode ? generatedCode : currentFile === 'README.md' ? briefing : `// Reading ${currentFile}\n\n// Content handled via Forge Kernel bridge.`}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#020406] custom-scrollbar" onClick={() => inputRef.current?.focus()}>
            {logs.map((log, i) => (
              <div key={i} className={`text-[11px] font-mono leading-snug whitespace-pre-wrap ${
                log.startsWith('forge@kernel') ? 'text-primary/70' : 
                log.includes('ERROR') ? 'text-red-500' :
                log.includes('SUCCESS') ? 'text-green-500' : 
                log.includes('>>>') ? 'text-yellow-500 font-bold' :
                'text-slate-300'
              }`}>{log}</div>
            ))}
            <div ref={logEndRef} />
          </div>

          <form onSubmit={handleCommandSubmit} className="p-3 bg-[#0a0f14] border-t border-border-mech flex items-center gap-2">
            <span className="text-[11px] font-bold text-primary font-mono shrink-0">forge@kernel:~$</span>
            <input 
              ref={inputRef} 
              type="text" 
              autoFocus 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              disabled={status === 'executing'} 
              className="flex-1 bg-transparent border-none outline-none text-[11px] text-white font-mono placeholder:text-slate-800" 
              placeholder={status === 'executing' ? "Syncing..." : "Enter command..."}
            />
          </form>
        </main>

        <aside className="w-64 bg-[#0a0f14] hidden xl:flex flex-col overflow-hidden">
          <div className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter border-b border-border-mech">Quick Actions</div>
          <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
            {(['ZEPPELIN', 'REMIX', 'SOLANA', 'EVM'] as const).map(cat => (
              <div key={cat} className="space-y-1">
                <div className="px-2 pb-1 text-[9px] font-black text-slate-700 tracking-[0.2em]">{cat}</div>
                <div className="space-y-1">
                  {COMMAND_SHORTCUTS.filter(s => s.category === cat).map(s => (
                    <button
                      key={s.id}
                      onClick={() => runCommand(s.cmd)}
                      disabled={status === 'executing'}
                      className="w-full text-left p-2 rounded bg-white/5 border border-transparent hover:border-primary/40 hover:bg-primary/5 transition-all group flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm text-slate-500 group-hover:text-primary">{s.icon}</span>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-slate-400 group-hover:text-primary transition-colors">{s.label}</div>
                        <div className="text-[8px] font-mono text-slate-600 truncate">{s.cmd}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <footer className="h-6 bg-primary text-black flex items-center justify-between px-3 text-[9px] font-black uppercase tracking-tighter shrink-0">
        <div className="flex gap-4">
          <span>LINK: ESTABLISHED</span>
          <span>KERNEL: Web3-POSIX</span>
        </div>
        <div className="flex gap-3">
          <span className="hidden sm:inline">CHAIN_ID: {(state.customNetwork?.chainName || 'NULL')}</span>
          <span className="flex items-center gap-1 animate-pulse">● LIVE_SYNC</span>
        </div>
      </footer>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a3b47; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #0da6f2; }
      `}</style>
    </div>
  );
};

export default DeploymentConsole;