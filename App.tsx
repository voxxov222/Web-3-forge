import React, { useState, useEffect } from 'react';
import { OnboardingState, User } from './types.ts';
import Header from './components/Header.tsx';
import StepIndicator from './components/StepIndicator.tsx';
import StepTemplate from './components/StepTemplate.tsx';
import StepNetwork from './components/StepNetwork.tsx';
import StepConfig from './components/StepConfig.tsx';
import StepReview from './components/StepReview.tsx';
import StepNetworkArchitect from './components/StepNetworkArchitect.tsx';
import StepContractLab from './components/StepContractLab.tsx';
import DeploymentConsole from './components/DeploymentConsole.tsx';
import GeminiAssistant from './components/GeminiAssistant.tsx';
import AuthModal from './components/AuthModal.tsx';
import { supabase } from './services/supabaseClient.ts';

const App: React.FC = () => {
  const [state, setState] = useState<OnboardingState>({
    step: 1,
    template: 'full-stack',
    selectedNetworks: ['eth', 'bsc'],
    nodeType: 'full',
    instanceSizeId: 'performance',
    crossChainEnabled: true,
    customNetwork: {
      chainName: 'Forge-Mainnet',
      consensus: 'PoS',
      blockTime: 2.0,
      gasLimit: 30000000,
      nativeToken: 'FRG'
    },
    contractLab: {
      template: 'ERC20',
      code: '',
      deploymentStatus: 'idle'
    },
    isDeploying: false
  });

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          authMethod: 'email'
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          authMethod: 'email'
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const totalSteps = state.template === 'custom-network' ? 5 : 4;
  const nextStep = () => setState(prev => ({ ...prev, step: Math.min(prev.step + 1, totalSteps) }));
  const prevStep = () => setState(prev => ({ ...prev, step: Math.max(prev.step - 1, 1) }));

  const updateState = (updates: Partial<OnboardingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const startDeployment = () => {
    updateState({ isDeploying: true });
  };

  const finishDeployment = () => {
    updateState({ isDeploying: false, step: 1 });
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setIsAuthOpen(false);
  };

  const handleLogout = async () => {
    if (user?.authMethod === 'email') {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const renderStep = () => {
    if (state.template === 'custom-network') {
      switch (state.step) {
        case 1: return <StepTemplate selected={state.template} onSelect={(t) => updateState({ template: t })} />;
        case 2: return <StepNetworkArchitect params={state.customNetwork!} onUpdate={updateState} />;
        case 3: return <StepContractLab lab={state.contractLab!} onUpdate={updateState} />;
        case 4: return <StepConfig nodeType={state.nodeType} instanceId={state.instanceSizeId} crossChain={state.crossChainEnabled} onUpdate={updateState} />;
        case 5: return <StepReview state={state} user={user} onAuthRequired={() => setIsAuthOpen(true)} />;
        default: return null;
      }
    }

    switch (state.step) {
      case 1: return <StepTemplate selected={state.template} onSelect={(t) => updateState({ template: t, step: 1 })} />;
      case 2: return <StepNetwork selected={state.selectedNetworks} onToggle={(id) => {
        const newSelected = state.selectedNetworks.includes(id) ? state.selectedNetworks.filter(i => i !== id) : [...state.selectedNetworks, id];
        updateState({ selectedNetworks: newSelected });
      }} />;
      case 3: return <StepConfig nodeType={state.nodeType} instanceId={state.instanceSizeId} crossChain={state.crossChainEnabled} onUpdate={updateState} />;
      case 4: return <StepReview state={state} user={user} onAuthRequired={() => setIsAuthOpen(true)} />;
      default: return null;
    }
  };

  if (state.isDeploying) {
    return <DeploymentConsole state={state} onFinished={finishDeployment} />;
  }

  return (
    <div className="relative min-h-screen flex flex-col w-full max-w-md mx-auto bg-surface-dark border-x border-border-mech shadow-2xl overflow-hidden">
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none z-50"></div>
      
      <Header 
        onAssistantClick={() => setIsAssistantOpen(true)} 
        onAuthClick={() => user ? handleLogout() : setIsAuthOpen(true)}
        user={user}
      />

      <main className="flex-1 overflow-y-auto pb-32 hide-scrollbar">
        <StepIndicator currentStep={state.step} totalSteps={totalSteps} />
        
        <div className="p-4">
          {renderStep()}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto p-4 bg-surface-dark/90 backdrop-blur border-t border-border-mech z-40">
        <div className="flex gap-3">
          {state.step > 1 && (
            <button onClick={prevStep} className="flex-1 py-3 px-4 border border-border-mech rounded font-bold text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              BACK
            </button>
          )}
          <button 
            onClick={state.step === totalSteps ? startDeployment : nextStep}
            className="flex-[2] py-3 px-4 bg-primary text-black font-bold rounded shadow-neon hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
          >
            {state.step === totalSteps ? "INITIALIZE DEPLOYMENT" : "NEXT PROTOCOL"}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </footer>

      {isAssistantOpen && <GeminiAssistant onClose={() => setIsAssistantOpen(false)} currentState={state} />}
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} onAuthSuccess={handleAuthSuccess} />}
    </div>
  );
};

export default App;