import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  BookOpen, 
  BrainCircuit, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: () => void;
  onStepChange?: (stepIndex: number) => void;
}

const steps = [
  {
    title: "Welcome to Cognito",
    description: "Your new minimalist command center for academic mastery. Let's show you how to get the most out of it.",
    target: "body",
    icon: GraduationCap,
    color: "text-blue-500"
  },
  {
    title: "Your Academic Hub",
    description: "This is where all your assignments and exams live. You can switch between them easily.",
    target: "aside:first-of-type",
    icon: BookOpen,
    color: "text-purple-500"
  },
  {
    title: "Create New Tasks",
    description: "Ready to start something new? Use this button to add your next assignment or exam.",
    target: "button:has(svg.lucide-plus)",
    icon: Sparkles,
    color: "text-yellow-500"
  },
  {
    title: "Master Your Progress",
    description: "The center panel shows all the details. Break tasks into sub-tasks and track your progress.",
    target: "section.flex-1",
    icon: CheckCircle2,
    color: "text-green-500"
  },
  {
    title: "Study Smarter",
    description: "Capture key ideas and turn them into flashcards here. It's your secret weapon for exams.",
    target: "aside:last-of-type",
    icon: BrainCircuit,
    color: "text-orange-500"
  },
  {
    title: "Personalize Your Space",
    description: "Switch to dark mode or manage your profile here. You're all set to excel!",
    target: "header .flex.items-center.gap-2",
    icon: GraduationCap,
    color: "text-blue-500"
  }
];

export const Onboarding = ({ onComplete, onStepChange }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  
  useEffect(() => {
    const updatePosition = () => {
      const step = steps[currentStep];
      const element = document.querySelector(step.target);
      
      if (!element || step.target === 'body') {
        setCoords({ top: 0, left: 0, width: 0, height: 0 });
        return;
      }

      const rect = element.getBoundingClientRect();
      setCoords({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    };

    updatePosition();
    onStepChange?.(currentStep);
    
    window.addEventListener('resize', updatePosition);
    // Also update on a slight delay to account for layout shifts
    const timer = setTimeout(updatePosition, 100);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      clearTimeout(timer);
    };
  }, [currentStep, onStepChange]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Spotlight Overlay */}
      <div className="absolute inset-0 bg-surface-dark/60 backdrop-blur-[4px] transition-opacity duration-700" style={{
        clipPath: step.target === 'body' 
          ? 'none' 
          : `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)`
      }} />

      {/* Floating Card - Now always centered */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <motion.div 
          layout
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="pointer-events-auto w-full max-w-[380px] bg-surface dark:bg-surface-muted-dark rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.4)] border-2 border-primary/20 dark:border-primary/10 overflow-hidden glass"
        >
          <div className="p-8 md:p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className={cn("p-3 rounded-2xl bg-primary/10 shadow-inner", step.color)}>
              <Icon className="w-6 h-6" />
            </div>
            <button 
              onClick={onComplete}
              className="p-2 hover:bg-surface-muted dark:hover:bg-surface-dark rounded-full transition-colors text-text-muted group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h3 className="font-extrabold text-xl text-text-main dark:text-text-main-dark tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-sm font-medium text-text-muted dark:text-text-muted-dark leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === currentStep ? "w-6 bg-primary" : "w-1.5 bg-border dark:bg-border-dark"
                  )}
                />
              ))}
            </div>
            
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button 
                  onClick={prevStep}
                  className="p-3 rounded-2xl border-2 border-border dark:border-border-dark hover:bg-surface-muted dark:hover:bg-surface-dark transition-colors text-text-muted active:scale-90"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={nextStep}
                className="bg-primary text-white px-6 py-3 rounded-2xl font-extrabold text-sm flex items-center gap-2 hover:bg-primary-hover shadow-xl shadow-primary/30 transition-all active:scale-95 uppercase tracking-widest"
              >
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Animated Progress Bar at bottom */}
        <div className="h-1.5 w-full bg-border/10 dark:bg-border-dark/10">
          <motion.div 
            className="h-full bg-primary shadow-[0_0_10px_rgba(79,70,229,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        </motion.div>
      </div>
    </div>
  );
};
