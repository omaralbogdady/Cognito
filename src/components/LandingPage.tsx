import React, { useState } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  BookOpen, 
  BrainCircuit, 
  Layers, 
  Zap, 
  Shield, 
  Layout,
  ArrowRight,
  Moon,
  Sun,
  Github,
  Twitter,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
  onGuestMode: () => void;
  onGoogleLogin: () => void;
  authUI: React.ReactNode;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const FeatureCard = ({ icon: Icon, title, description, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="p-8 rounded-[2.5rem] bg-surface dark:bg-surface-muted-dark border-2 border-border dark:border-border-dark hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
  >
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
    <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-2xl font-extrabold text-text-main dark:text-text-main-dark mb-4 tracking-tight">{title}</h3>
    <p className="text-text-muted dark:text-text-muted-dark leading-relaxed font-medium">{description}</p>
  </motion.div>
);

export const LandingPage = ({ 
  onLogin, 
  onSignup, 
  onGuestMode, 
  onGoogleLogin, 
  authUI, 
  isAuthModalOpen, 
  setIsAuthModalOpen,
  darkMode,
  setDarkMode
}: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark text-text-main dark:text-text-main-dark font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 border-b border-border/50 dark:border-border-dark/50 glass z-50 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 rotate-3 group-hover:rotate-12 transition-transform">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tighter text-text-main dark:text-text-main-dark">Cognito</span>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-8">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-full hover:bg-surface-muted dark:hover:bg-surface-muted-dark transition-colors relative group"
          >
            <div className="absolute inset-0 bg-primary/10 rounded-full scale-0 group-hover:scale-100 transition-transform" />
            {darkMode ? <Sun className="w-5 h-5 text-yellow-500 relative z-10" /> : <Moon className="w-5 h-5 text-text-muted relative z-10" />}
          </button>
          <div className="hidden sm:flex items-center gap-6">
            <button 
              onClick={() => {
                onLogin();
                setIsAuthModalOpen(true);
              }}
              className="font-extrabold text-sm text-text-muted dark:text-text-muted-dark hover:text-primary transition-colors uppercase tracking-widest"
            >
              Log In
            </button>
            <button 
              onClick={() => {
                onSignup();
                setIsAuthModalOpen(true);
              }}
              className="bg-primary text-white px-8 py-3 rounded-2xl font-extrabold text-sm hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest"
            >
              Get Started
            </button>
          </div>
          <button 
            className="sm:hidden bg-primary text-white px-5 py-2 rounded-2xl font-extrabold text-sm"
            onClick={() => setIsAuthModalOpen(true)}
          >
            Start
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-24 px-6 sm:px-12 max-w-7xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary font-extrabold text-[10px] uppercase tracking-[0.25em] mb-10 border border-primary/20"
        >
          <Zap className="w-4 h-4" />
          <span>The Future of Academic Productivity</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl sm:text-8xl font-extrabold tracking-tighter text-text-main dark:text-text-main-dark mb-10 leading-[0.95]"
        >
          Master Your Studies with <br />
          <span className="text-primary italic">Cognitive Precision.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-xl sm:text-2xl text-text-muted dark:text-text-muted-dark max-w-3xl mx-auto mb-14 leading-relaxed font-medium"
        >
          Cognito is your minimalist academic command center. Organize assignments, 
          break down complex projects, and master key concepts—all in one seamless, 
          real-time dashboard.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <button 
            onClick={() => {
              onSignup();
              setIsAuthModalOpen(true);
            }}
            className="w-full sm:w-auto bg-primary text-white px-12 py-5 rounded-[2rem] font-extrabold text-xl hover:bg-primary-hover shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            Start Studying Free 
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={onGuestMode}
            className="w-full sm:w-auto px-12 py-5 rounded-[2rem] font-extrabold text-xl text-text-muted dark:text-text-muted-dark hover:bg-surface-muted dark:hover:bg-surface-muted-dark transition-all border-2 border-transparent hover:border-border dark:hover:border-border-dark"
          >
            Try Guest Mode
          </button>
        </motion.div>

        {/* Dashboard Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full -z-10 opacity-50" />
          <div className="bg-surface dark:bg-surface-dark rounded-[2.5rem] border-4 border-border dark:border-border-dark shadow-2xl overflow-hidden aspect-[16/10] flex">
            <div className="w-64 border-r border-border dark:border-border-dark bg-surface-muted/50 dark:bg-surface-muted-dark/50 p-6 space-y-6 hidden sm:block">
              <div className="h-4 w-32 bg-border dark:bg-border-dark rounded-full" />
              <div className="space-y-3">
                <div className="h-10 w-full bg-primary/10 rounded-xl" />
                <div className="h-10 w-full bg-border/20 rounded-xl" />
                <div className="h-10 w-full bg-border/20 rounded-xl" />
              </div>
            </div>
            <div className="flex-1 p-8 space-y-8">
              <div className="flex justify-between items-center">
                <div className="h-8 w-48 bg-border dark:bg-border-dark rounded-full" />
                <div className="h-10 w-10 bg-border dark:bg-border-dark rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="h-40 bg-primary/5 rounded-3xl border-2 border-primary/10" />
                <div className="h-40 bg-border/10 rounded-3xl border-2 border-border" />
              </div>
              <div className="h-64 bg-border/5 rounded-3xl border-2 border-border" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl sm:text-6xl font-extrabold tracking-tighter mb-6"
          >
            Built for High-Performance Learning
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-text-muted dark:text-text-muted-dark text-xl font-medium"
          >
            Everything you need to master your academic life, without the clutter.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={CheckCircle2}
            title="Task Orchestration"
            description="Manage assignments and exams with precision. Set due dates, track progress, and never miss a deadline again."
            delay={0.1}
          />
          <FeatureCard 
            icon={Layers}
            title="Project Breakdown"
            description="Complex projects are just a series of small steps. Use subtasks to dismantle big goals into manageable actions."
            delay={0.2}
          />
          <FeatureCard 
            icon={BrainCircuit}
            title="Cognitive Notes"
            description="Capture key concepts and create instant flashcards. Cognito helps you move information from the page to your memory."
            delay={0.3}
          />
          <FeatureCard 
            icon={Zap}
            title="Real-Time Sync"
            description="Your study command center is always up to date. Sync seamlessly across all your devices in real-time."
            delay={0.4}
          />
          <FeatureCard 
            icon={Shield}
            title="Secure & Private"
            description="Your academic data is yours. We use industry-standard security to keep your notes and tasks safe."
            delay={0.5}
          />
          <FeatureCard 
            icon={Layout}
            title="Minimalist Focus"
            description="A clean, distraction-free interface designed to help you stay in the flow and get more done in less time."
            delay={0.6}
          />
        </div>
      </section>

      {/* Goal Section */}
      <section className="py-24 px-6 sm:px-12 bg-surface-muted dark:bg-surface-muted-dark/30 border-y border-border dark:border-border-dark">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-8"
          >
            <BrainCircuit className="w-10 h-10 text-primary" />
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-8">Why we built this</h2>
          <p className="text-2xl sm:text-3xl text-text-main dark:text-text-main-dark font-medium leading-tight mb-8">
            We're building the study tool we always wanted—minimalist, fast, and actually helpful for getting through the semester.
          </p>
          <p className="text-text-muted dark:text-text-muted-dark text-lg leading-relaxed">
            Cognito was born out of late-night study sessions and the frustration of juggling too many tabs. 
            We're students ourselves, so we built this to cut through the noise and help you focus on what 
            actually matters: mastering your subjects without the stress.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 sm:px-12 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -z-10" />
        <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tighter mb-8">Ready to Level Up?</h2>
        <p className="text-text-muted dark:text-text-muted-dark text-xl mb-12 max-w-2xl mx-auto">
          Join thousands of students who are mastering their studies with Cognito. 
          Start your journey toward academic excellence today.
        </p>
        <button 
          onClick={() => {
            onSignup();
            setIsAuthModalOpen(true);
          }}
          className="bg-primary text-white px-12 py-5 rounded-3xl font-extrabold text-xl hover:bg-primary-hover shadow-2xl shadow-primary/30 transition-all active:scale-95"
        >
          Create Your Free Account
        </button>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 sm:px-12 border-t border-border dark:border-border-dark">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tighter">Cognito</span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://byomar.carrd.co/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-surface-muted dark:hover:bg-surface-muted-dark transition-colors"
              title="Profile"
            >
              <UserIcon className="w-5 h-5 text-text-muted" />
            </a>
            <a 
              href="https://x.com/IntriguingMango" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-surface-muted dark:hover:bg-surface-muted-dark transition-colors"
              title="Twitter"
            >
              <Twitter className="w-5 h-5 text-text-muted" />
            </a>
            <a 
              href="https://github.com/omaralbogdady/Cognito" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-surface-muted dark:hover:bg-surface-muted-dark transition-colors"
              title="GitHub"
            >
              <Github className="w-5 h-5 text-text-muted" />
            </a>
          </div>
        </div>
        <div className="text-center mt-12 text-xs text-text-muted dark:text-text-muted-dark opacity-50">
          © 2026 Cognito. Built for the next generation of scholars.
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-dark/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md"
            >
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowRight className="w-6 h-6 rotate-180" />
                <span className="sr-only">Close</span>
              </button>
              {authUI}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
