
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase, isDemoMode } from '../services/supabaseClient';
import { BrowserProvider } from 'ethers';

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onAuthSuccess }) => {
  const [method, setMethod] = useState<'email' | 'wallet'>('wallet');
  const [isConnecting, setIsConnecting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleWalletConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!(window as any).ethereum) {
        throw new Error("No EVM provider found. Please install MetaMask.");
      }

      const provider = new BrowserProvider((window as any).ethereum);
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      onAuthSuccess({
        id: `wallet_${address}`,
        walletAddress: address,
        chainId: network.chainId.toString(),
        authMethod: 'wallet'
      });
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setError(null);

    if (isDemoMode) {
      setTimeout(() => {
        onAuthSuccess({
          id: 'demo_user_123',
          email: email || 'operator@forge.sys',
          authMethod: 'email'
        });
        setIsConnecting(false);
      }, 1000);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        if (signUpData.user) {
          onAuthSuccess({
            id: signUpData.user.id,
            email: signUpData.user.email,
            authMethod: 'email'
          });
        }
      } else if (data.user) {
        onAuthSuccess({
          id: data.user.id,
          email: data.user.email,
          authMethod: 'email'
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface-dark border border-border-mech rounded-xl overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 scanlines opacity-10 pointer-events-none"></div>
        
        <header className="p-6 text-center border-b border-border-mech">
          <div className="size-16 mx-auto mb-4 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center text-primary shadow-neon">
            <span className="material-symbols-outlined text-3xl">fingerprint</span>
          </div>
          <h3 className="text-xl font-bold tracking-widest text-white uppercase">Identity Link</h3>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Neural Forge Access</span>
            {isDemoMode && method === 'email' && (
              <span className="text-[8px] bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-1.5 py-0.5 rounded font-bold">DEMO MODE</span>
            )}
          </div>
        </header>

        <div className="p-6">
          <div className="flex gap-2 p-1 bg-background-dark border border-border-mech rounded-lg mb-6">
            <button 
              onClick={() => { setMethod('wallet'); setError(null); }}
              className={`flex-1 py-2 text-[10px] font-bold rounded transition-all ${method === 'wallet' ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
            >
              CRYPTO WALLET
            </button>
            <button 
              onClick={() => { setMethod('email'); setError(null); }}
              className={`flex-1 py-2 text-[10px] font-bold rounded transition-all ${method === 'email' ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
            >
              NEURAL LINK
            </button>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-500/10 border border-red-500/30 rounded text-[10px] text-red-500 font-mono text-center">
              {error.toUpperCase()}
            </div>
          )}

          {method === 'wallet' ? (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-400">Establish a secure tunnel via your Web3 Provider.</p>
              <button 
                onClick={handleWalletConnect}
                disabled={isConnecting}
                className="w-full py-4 bg-transparent border-2 border-primary text-primary font-bold rounded hover:bg-primary/10 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                {isConnecting ? (
                  <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">account_balance_wallet</span>
                    CONNECT REAL WALLET
                  </>
                )}
              </button>
              <p className="text-[9px] text-slate-600 uppercase font-mono tracking-tighter">Powered by Ethers.js v6</p>
            </div>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Operator Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@forge.sys"
                  className="w-full bg-background-dark border border-border-mech rounded p-3 text-sm focus:border-primary outline-none transition-all placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Access Code</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background-dark border border-border-mech rounded p-3 text-sm focus:border-primary outline-none transition-all placeholder:text-slate-700"
                />
              </div>
              <button 
                type="submit"
                disabled={isConnecting}
                className="w-full py-3 bg-primary text-black font-bold rounded hover:shadow-neon transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isConnecting ? (
                  <div className="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                ) : 'INITIALIZE LINK'}
              </button>
            </form>
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 border-t border-border-mech text-[10px] text-slate-600 hover:text-slate-300 font-bold transition-colors"
        >
          ABORT PROTOCOL
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
