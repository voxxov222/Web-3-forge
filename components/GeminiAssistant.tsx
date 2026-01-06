
import React, { useState, useEffect } from 'react';
import { OnboardingState, GroundingSource, SavedConfig } from '../types';
import { getNetworkInsights, getOptimizedArchitecture, getSimpleExplanation } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';

interface GeminiAssistantProps {
  onClose: () => void;
  currentState: OnboardingState;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ onClose, currentState }) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'optimize' | 'vault'>('insights');
  const [content, setContent] = useState<string>('');
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await getNetworkInsights(currentState.selectedNetworks);
      setContent(res.text);
      setSources(res.sources);
    } catch (e) {
      setContent("Failed to fetch real-time network insights.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOptimization = async () => {
    setLoading(true);
    try {
      const res = await getOptimizedArchitecture(currentState);
      setContent(res);
      setSources([]);
    } catch (e) {
      setContent("Analysis engine offline.");
    } finally {
      setLoading(false);
    }
  };

  const fetchVault = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setContent("Login required to access the Infra Vault.");
        setSavedConfigs([]);
        return;
      }
      const { data, error } = await supabase
        .from('user_configs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSavedConfigs(data || []);
      setContent(`Found ${data?.length || 0} configurations in your decentralized vault.`);
    } catch (e) {
      setContent("Vault synchronization error.");
    } finally {
      setLoading(false);
    }
  };

  const handleTermSearch = async (term: string) => {
    setLoading(true);
    try {
      const res = await getSimpleExplanation(term);
      setContent(res);
      setSources([]);
    } catch (e) {
      setContent("Glossary access failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'insights') fetchInsights();
    else if (activeTab === 'optimize') fetchOptimization();
    else fetchVault();
  }, [activeTab]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-sm bg-surface-dark border-l border-primary/30 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <header className="p-4 border-b border-border-mech flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary pulse-neon">auto_awesome</span>
            <h3 className="font-bold tracking-widest text-sm">FORGE_AI ASSISTANT</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <nav className="flex border-b border-border-mech bg-[#0a0f14]">
          {[
            { id: 'insights', label: 'NETWORK', icon: 'public' },
            { id: 'optimize', label: 'OPTIMIZE', icon: 'architecture' },
            { id: 'vault', label: 'VAULT', icon: 'cloud_done' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 text-[10px] font-bold flex flex-col items-center gap-1 transition-colors ${
                activeTab === tab.id ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 text-slate-500">
              <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-[10px] font-mono animate-pulse uppercase">Syncing Protocol...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#101d23] border border-border-mech rounded p-4">
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
                  {content}
                </p>
              </div>

              {activeTab === 'vault' && savedConfigs.length > 0 && (
                <div className="space-y-2">
                  {savedConfigs.map(config => (
                    <div key={config.id} className="p-3 bg-background-dark border border-border-mech rounded-lg text-[10px] font-mono">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-primary font-bold">{config.template.toUpperCase()}</span>
                        <span className="text-slate-600">{new Date(config.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-slate-400">Networks: {config.selected_networks.join(', ').toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              )}

              {sources.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Grounded Sources</h4>
                  {sources.map((s, idx) => s.web && (
                    <a 
                      key={idx}
                      href={s.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[10px] text-primary hover:underline truncate bg-primary/5 border border-primary/20 p-2 rounded"
                    >
                      {s.web.title || s.web.uri}
                    </a>
                  ))}
                </div>
              )}

              {activeTab !== 'vault' && (
                <div className="space-y-2 pt-4 border-t border-border-mech">
                  <h4 className="text-[10px] font-bold text-slate-500 mb-2">INFRA GLOSSARY</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Supabase', 'F-Assets', 'SGB Canary', 'BSC Mainnet'].map(t => (
                      <button
                        key={t}
                        onClick={() => handleTermSearch(t)}
                        className="text-[9px] bg-slate-900 border border-border-mech px-2 py-1 rounded hover:border-primary transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="p-4 bg-[#0a0f14] border-t border-border-mech">
           <div className="flex items-center gap-2 p-3 bg-primary/5 rounded border border-primary/20 text-[9px] text-primary font-mono uppercase tracking-tighter">
              <span className="material-symbols-outlined text-sm">database</span>
              Supabase Instance: Production_Vault_Alpha
           </div>
        </footer>
      </div>
    </div>
  );
};

export default GeminiAssistant;
