
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="p-4 flex items-center justify-between border-b border-border-mech">
        <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary rounded">
                <div className="size-2 rounded-full bg-primary shadow-neon"></div>
                <span className="text-xs font-bold text-primary font-mono uppercase">
                  STEP {currentStep}/{totalSteps}
                </span>
            </div>
            {currentStep < totalSteps && (
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-border-mech rounded opacity-50">
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    NEXT: STEP {currentStep + 1}
                  </span>
              </div>
            )}
        </div>
        <span className="text-[10px] text-slate-500 font-mono">{progress}% COMPLETE</span>
    </div>
  );
};

export default StepIndicator;
