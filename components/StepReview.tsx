
import React, { useState } from 'react';
import { OnboardingState, User } from '../types';
import { NETWORKS, INSTANCE_SIZES } from '../constants';
import { supabase, isDemoMode } from '../services/supabaseClient';

interface StepReviewProps {
  state: OnboardingState;
  user: User | null;
  onAuthRequired: () => void;
}

const StepReview: React.FC<StepReviewProps> = ({ state, user, onAuthRequired }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const selectedNetworkDetails = NETWORKS.filter(n => state.selectedNetworks.includes(n.id));
  const instanceDetail = INSTANCE_SIZES.find(i => i.id === state.instanceSizeId);

  const handleSaveConfig = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    
    setIsSaving(true);
    setSaveStatus('idle');

    if (isDemoMode && user.authMethod === 'email') {
      setTimeout(() => {
        setIsSaving(false);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }, 1200);
      return;
    }

    try {
      const { error } = await supabase
        .from('user_configs')
        .insert({
          user_id: user.id,
          template: state.template,
          selected_networks: state.selectedNetworks,
          node_type: state.nodeType,
          instance_size_id: state.instanceSizeId,
          cross_chain_enabled: state.crossChainEnabled,
          metadata: {
            wallet: user.walletAddress,
            chainId: user.chainId
          }
        });

      if (error) throw error;

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-4 animate-in fade-in duration-500">
        <div className="pb-2 flex items-center justify-between">
            <div>
              <h3 className="text-white text-sm font-bold tracking-widest flex items-center gap-2">
                  <span className="text-primary">//</span> FINAL SYSTEM REVIEW
              </h3>
              <p className="text-xs text-slate-500 mt-1">Verify cluster configuration & identity</p>
            </div>
            
            <button 
              onClick={handleSaveConfig}
              disabled={isSaving || saveStatus === 'saved'}
              className={`flex items-center gap-2 px-3 py-1.5 rounded border text-[10px] font-bold transition-all ${
                saveStatus === 'saved' 
                  ? 'border-green-500 bg-green-500/10 text-green-500' 
                  : saveStatus === 'error'
                    ? 'border-red-500 text-red-500 hover:bg-red-500/5'
                    : 'border-primary text-primary hover:bg-primary/10'
              } disabled:opacity-50`}
            >
              {isSaving ? (
                <div className="size-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-sm">
                  {saveStatus === 'saved' ? 'check' : saveStatus === 'error' ? 'report_problem' : 'cloud_sync'}
                </span>
              )}
              {saveStatus === 'saved' ? 'VAULTED' : saveStatus === 'error' ? 'CONFIG ERROR' : 'SYNC TO VAULT'}
            </button>
        </div>

        <div className="bg-[#101d23] border border-border-mech rounded-lg p-4 font-mono relative">
            <div className="absolute top-4 right-4 flex flex-col items-end">
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${user?.authMethod === 'wallet' ? 'border-primary text-primary shadow-neon' : 'border-slate-700 text-slate-500'}`}>
                {user?.authMethod === 'wallet' ? 'BLOCKCHAIN_AUTH' : 'NEURAL_AUTH'}
              </span>
            </div>
            
            <div className="flex justify-between items-center mb-4 border-b border-border-mech pb-2">
              <span className="text-xs text-slate-400">OPERATOR_ID</span>
              <span className="text-xs text-primary font-bold uppercase truncate max-w-[150px]">
                {user?.walletAddress || user?.email || 'UNIDENTIFIED'}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">DEPLOYMENT_TEMPLATE</span>
                <span className="text-sm text-white">{state.template.replace('-', '_').toUpperCase()}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block mb-1">TARGET_NETWORKS</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedNetworkDetails.length > 0 ? selectedNetworkDetails.map(n => (
                    <span key={n.id} className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded border border-border-mech flex items-center gap-1">
                      <div className={`size-1.5 rounded-full bg-gradient-to-br ${n.color}`}></div>
                      {n.name.toUpperCase()}
                    </span>
                  )) : <span className="text-[9px] text-slate-600">NONE_SELECTED</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">NODE_TYPE</span>
                  <span className="text-sm text-white">{state.nodeType.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">BRIDGING</span>
                  <span className={`text-sm ${state.crossChainEnabled ? 'text-primary' : 'text-slate-500'}`}>
                    {state.crossChainEnabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block mb-1">HARDWARE_PROFILE</span>
                <span className="text-sm text-white">{instanceDetail?.name || 'NOT_SELECTED'}</span>
                <p className="text-[9px] text-slate-500">{instanceDetail?.specs}</p>
              </div>
            </div>
        </div>

        {user?.authMethod === 'wallet' && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl">token</span>
            <div className="flex-1">
              <div className="text-[10px] text-slate-300 font-bold uppercase">Connected Network</div>
              <div className="text-[9px] text-primary font-mono">CHAIN_ID: {user.chainId}</div>
            </div>
            <div className="size-2 rounded-full bg-primary animate-ping"></div>
          </div>
        )}

        {!user && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 flex gap-3 animate-pulse">
              <span className="material-symbols-outlined text-yellow-500">warning</span>
              <div>
                <h4 className="text-xs font-bold text-white mb-1">Identity Sync Required</h4>
                <p className="text-[10px] text-slate-400">Authenticate your operator profile or connect a wallet to finalize deployment.</p>
              </div>
          </div>
        )}

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
            <span className="material-symbols-outlined text-primary">verified_user</span>
            <div>
              <h4 className="text-xs font-bold text-white mb-1">Security Audit</h4>
              <p className="text-[10px] text-slate-400">Configurations verified against Web3 standards. Your vault entries are protected via Neural Encryption.</p>
            </div>
        </div>
    </section>
  );
};

export default StepReview;
