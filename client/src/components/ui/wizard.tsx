import React, { createContext, useContext, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardContextType {
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a Wizard component');
  }
  return context;
}

interface WizardProps {
  children: React.ReactNode;
  className?: string;
}

export function Wizard({ children, className }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = React.Children.toArray(children);
  const totalSteps = steps.length;

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  const value: WizardContextType = {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
  };

  return (
    <WizardContext.Provider value={value}>
      <div className={cn('w-full', className)}>
        {steps[currentStep]}
      </div>
    </WizardContext.Provider>
  );
}

interface WizardStepProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function WizardStep({ children, title, description }: WizardStepProps) {
  return (
    <Card className="w-full">
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

interface WizardNavigationProps {
  onNext?: () => void;
  onPrev?: () => void;
  onFinish?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  finishLabel?: string;
  canProceed?: boolean;
}

export function WizardNavigation({
  onNext,
  onPrev,
  onFinish,
  nextLabel = 'Siguiente',
  prevLabel = 'Anterior',
  finishLabel = 'Finalizar',
  canProceed = true,
}: WizardNavigationProps) {
  const { nextStep, prevStep, isFirstStep, isLastStep } = useWizard();

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    } else {
      prevStep();
    }
  };

  const handleFinish = () => {
    if (onFinish) {
      onFinish();
    }
  };

  return (
    <div className="flex justify-between pt-4">
      <Button
        variant="outline"
        onClick={handlePrev}
        disabled={isFirstStep}
        className="flex items-center space-x-2"
      >
        <ChevronLeft size={16} />
        <span>{prevLabel}</span>
      </Button>

      {isLastStep ? (
        <Button
          onClick={handleFinish}
          disabled={!canProceed}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
        >
          <Check size={16} />
          <span>{finishLabel}</span>
        </Button>
      ) : (
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex items-center space-x-2"
        >
          <span>{nextLabel}</span>
          <ChevronRight size={16} />
        </Button>
      )}
    </div>
  );
}

interface WizardProgressProps {
  className?: string;
}

export function WizardProgress({ className }: WizardProgressProps) {
  const { currentStep, totalSteps } = useWizard();

  return (
    <div className={cn('w-full mb-6', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Paso {currentStep + 1} de {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round(((currentStep + 1) / totalSteps) * 100)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}