
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  onAssistantClick: () => void;
  onAuthClick: () => void;
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ onAssistantClick, onAuthClick, user }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#101d23]/95 backdrop-blur border-b border-primary/30">
        <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded bg-primary/10 border border-primary/30 shadow-neon text-primary">
                    <span className="material-symbols-outlined text-[24px]">hub</span>
                </div>
                <div>
                    <h2 className="text-sm font-bold tracking-widest text-white leading-none">WEB3 INFRA</h2>
                    <span className="text-xs text-primary font-mono tracking-widest">ONBOARDING SYS</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={onAssistantClick}
                className="size-10 flex items-center justify-center rounded border border-border-mech hover:border-primary transition-colors text-primary pulse-neon"
                title="AI Assistant"
              >
                  <span className="material-symbols-outlined">auto_awesome</span>
              </button>
              
              <button 
                onClick={onAuthClick}
                className={`flex items-center gap-2 px-3 h-10 rounded border transition-all ${user ? 'border-primary/50 bg-primary/5' : 'border-border-mech hover:border-primary/40'}`}
              >
                <div className="text-right hidden sm:block">
                  {user ? (
                    <>
                      <div className="text-[10px] font-bold text-white uppercase leading-none">Verified</div>
                      <div className="text-[9px] text-primary font-mono mt-0.5">{user.walletAddress || user.email?.split('@')[0]}</div>
                    </>
                  ) : (
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Unauthorized</div>
                  )}
                </div>
                <div className={`size-7 rounded-full flex items-center justify-center border ${user ? 'border-primary text-primary shadow-neon' : 'border-slate-700 text-slate-500'}`}>
                  <span className="material-symbols-outlined text-lg">{user ? 'account_circle' : 'login'}</span>
                </div>
              </button>
            </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
    </header>
  );
};

export default Header;
