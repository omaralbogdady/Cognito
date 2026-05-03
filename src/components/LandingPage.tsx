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
  User as UserIcon,
  Sparkles,
  Calendar,
  MessageSquare,
  Search,
  Command,
  ArrowUpRight
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

const FeatureCard = ({ icon: Icon, title, description, delay, accent }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="p-8 rounded-[2rem] bg-surface dark:bg-surface-muted-dark border border-border dark:border-border-dark hover:border-primary/50 transition-all group relative overflow-hidden flex flex-col h-full"
  >
    <div className={cn("inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3", accent)} >
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold text-text-main dark:text-text-main-dark mb-3 tracking-tight">{title}</h3>
    <p className="text-text-main/70 dark:text-text-main-dark/70 leading-relaxed text-sm">{description}</p>
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
    <div className="min-h-screen bg-[#FDFDFB] dark:bg-[#070707] text-text-main dark:text-text-main-dark font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse opacity-50" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 blur-[150px] rounded-full animate-pulse opacity-50" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-blue-400/5 blur-[120px] rounded-full animate-pulse opacity-30" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 border-b border-border/40 dark:border-border-dark/40 bg-white/70 dark:bg-black/70 backdrop-blur-xl z-50 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-9 h-9 bg-primary dark:bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-text-main dark:text-text-main-dark italic">Lumina</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'AI Assistant', 'Calendar'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-bold text-text-main/70 hover:text-primary dark:text-text-main-dark/70 dark:hover:text-primary transition-all tracking-tight"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="h-6 w-px bg-border dark:bg-border-dark mx-2 hidden md:block" />

          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-surface-muted dark:hover:bg-surface-muted-dark transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-text-muted" />}
          </button>

          <div className="hidden sm:flex items-center gap-4">
            <button 
              onClick={() => { onLogin(); setIsAuthModalOpen(true); }}
              className="text-sm font-bold text-text-main/60 hover:text-text-main dark:text-text-main-dark/70 dark:hover:text-text-main-dark transition-all px-4 py-2"
            >
              Sign In
            </button>
            <button 
              onClick={() => { onSignup(); setIsAuthModalOpen(true); }}
              className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 sm:px-12 max-w-7xl mx-auto overflow-visible">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-[11px] uppercase tracking-wider border border-primary/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enhanced with Gemini AI</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl sm:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.9] text-text-main dark:text-text-main-dark"
            >
              Study <span className="text-primary italic">Smarter,</span> <br />
              and Faster.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-lg sm:text-xl text-text-main/70 dark:text-text-main-dark/70 max-w-xl leading-relaxed font-medium"
            >
              The unified workspace for students. Organize your academic life with AI-powered conceptual tools, real-time calendar syncing, and a focus-first interface.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-4 pt-4"
            >
              <button 
                onClick={() => { onSignup(); setIsAuthModalOpen(true); }}
                className="w-full sm:w-auto bg-primary text-white px-10 py-4.5 rounded-2xl font-bold text-lg hover:bg-primary-hover shadow-xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
              >
                Join Lumina
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={onGuestMode}
                className="w-full sm:w-auto px-10 py-4.5 rounded-2xl font-bold text-lg text-text-main dark:text-text-main-dark bg-surface-muted dark:bg-surface-muted-dark hover:bg-border/30 transition-all border border-border dark:border-border-dark"
              >
                Try Guest Mode
              </button>
            </motion.div>
          </div>

          {/* Abstract Hero Image / Mockup */}
          <div className="relative group">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 2 }}
              transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-square sm:aspect-video rounded-[3rem] overflow-hidden border-4 border-border dark:border-border-dark shadow-2xl bg-white dark:bg-black"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
              <div className="p-8 space-y-8 h-full">
                {/* Mock UI Elements */}
                <div className="flex items-center justify-between">
                  <div className="w-32 h-6 bg-border dark:bg-border-dark rounded-full" />
                  <div className="w-10 h-10 bg-primary/10 rounded-xl" />
                </div>
                <div className="grid grid-cols-3 gap-6 h-full pb-32">
                  <div className="col-span-2 bg-primary/5 dark:bg-primary/10 rounded-3xl p-6 border border-primary/20">
                     <div className="flex gap-3 items-center mb-6">
                        <div className="w-8 h-8 rounded-lg bg-primary/20" />
                        <div className="w-24 h-4 bg-primary/10 rounded-full" />
                     </div>
                     <div className="space-y-3">
                        <div className="w-full h-3 bg-border/40 dark:bg-border-dark/40 rounded-full" />
                        <div className="w-full h-3 bg-border/40 dark:bg-border-dark/40 rounded-full" />
                        <div className="w-2/3 h-3 bg-border/40 dark:bg-border-dark/40 rounded-full" />
                     </div>
                  </div>
                  <div className="bg-border/5 dark:bg-border-dark/5 rounded-3xl p-6 border border-border">
                     <div className="w-full h-full rounded-2xl bg-border/10 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-text-muted/20" />
                     </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Chat Bubble */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-12 right-12 bg-white dark:bg-[#1A1A1A] p-6 rounded-3xl shadow-2xl shadow-black/20 border border-border dark:border-border-dark max-w-[280px]"
              >
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-sm font-bold text-primary tracking-tight">Gemini AI</span>
                </div>
                <p className="text-xs text-text-main dark:text-text-main-dark  leading-relaxed font-medium">
                  "I've identified 5 key concepts in your notes. I can help you generate flashcards for active recall."
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section id="ai-assistant" className="py-32 px-6 sm:px-12 max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="bg-[#0F0F0F] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="text-[10px] uppercase tracking-widest font-black text-white/30">AI Study Environment</div>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex gap-4 items-start translate-x-[-10px] opacity-40">
                  <div className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 bg-white/5 rounded-full" />
                    <div className="h-3 w-full bg-white/5 rounded-full" />
                  </div>
                </div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="flex gap-4 items-start"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-5 space-y-3">
                    <p className="text-sm text-white leading-relaxed font-medium">
                      "Analyzing 'Photosynthesis'... I can explain this in simple terms and generate core concepts for your review."
                    </p>
                    <div className="flex gap-2">
                       <div className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-[10px] text-primary font-bold">Concept Flashcards</div>
                       <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white/60 font-bold italic">Simplified Explanation</div>
                    </div>
                  </div>
                </motion.div>
                <div className="h-40 w-full rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-white/5 flex items-center justify-center">
                   <div className="flex flex-col items-center gap-4">
                      <BrainCircuit className="w-12 h-12 text-primary/40 animate-pulse" />
                      <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Integrating Concepts...</div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <div className="inline-flex h-12 w-12 bg-primary/10 rounded-2xl items-center justify-center">
              <MessageSquare className="text-primary w-6 h-6" />
            </div>
            <h2 className="text-5xl sm:text-6xl font-black tracking-tighter leading-none">Your AI <br /><span className="text-primary">Thought Partner.</span></h2>
            <p className="text-lg text-text-muted leading-relaxed">
              Meet Gemini — integrated directly into your workspace. It doesn't just answer questions; it analyzes your notes, generates active-recall flashcards, and explains complex topics in ways that actually stick.
            </p>
            <ul className="space-y-4">
               {[
                 { icon: Search, text: 'Instant Concept Expansion' },
                 { icon: Layout, text: 'Automated Flashcard Generation' },
                 { icon: Sparkles, text: 'Context-Aware Study Tips' }
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-surface-muted dark:bg-surface-muted-dark flex items-center justify-center">
                       <item.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-bold opacity-80">{item.text}</span>
                 </li>
               ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section id="calendar" className="py-32 px-6 sm:px-12 bg-surface-muted/30 dark:bg-surface-muted-dark/20 border-y border-border dark:border-border-dark overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-8">
            <div className="inline-flex h-12 w-12 bg-green-500/10 rounded-2xl items-center justify-center">
              <Calendar className="text-green-500 w-6 h-6" />
            </div>
            <h2 className="text-5xl sm:text-6xl font-black tracking-tighter leading-none">Stay Synchronized <br /><span className="text-green-500">Effortlessly.</span></h2>
            <p className="text-lg text-text-muted leading-relaxed">
              Never let a deadline slip through the cracks. Connect your Google Calendar to sync assignments and exams in both directions. Get visual reminders and plan your study blocks with precision.
            </p>
          </div>

          <div className="relative">
             <div className="absolute inset-0 bg-green-500/20 blur-[150px] rounded-full -z-10" />
             <div className="bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] border border-border dark:border-white/10 p-4 shadow-2xl shadow-green-500/10">
                <div className="grid grid-cols-7 gap-4 aspect-square">
                   {Array.from({ length: 35 }).map((_, i) => (
                     <div key={i} className={cn("aspect-square rounded-xl border border-border dark:border-white/5 flex flex-col p-2", i === 14 ? "bg-green-500/10 border-green-500/30" : "")}>
                        <span className="text-[10px] text-text-muted font-bold self-end">{i % 31 + 1}</span>
                        {i === 14 && <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 animate-pulse" />}
                        {(i === 8 || i === 22) && <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1 opacity-20" />}
                     </div>
                   ))}
                </div>
                <div className="mt-6 flex flex-col gap-3">
                   <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-green-500" />
                         <span className="text-sm font-bold">Organic Chemistry Final Exam</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest font-black text-green-500">Synced</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section id="features" className="py-32 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-24 max-w-2xl mx-auto space-y-4">
          <h2 className="text-5xl font-black tracking-tighter leading-none mb-4">Crafted for Excellence.</h2>
          <p className="text-text-muted font-medium">Every tool you need to dominate the semester, presented in a distraction-free, minimalist environment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={CheckCircle2}
            title="Task Orchestration"
            description="Manage assignments and exams with precision. Set due dates, track progress, and never miss a deadline again."
            delay={0.1}
            accent="bg-blue-500/10 text-blue-500"
          />
          <FeatureCard 
            icon={Layers}
            title="Project Breakdown"
            description="Complex projects are just a series of small steps. Use subtasks to dismantle big goals into manageable actions."
            delay={0.2}
            accent="bg-purple-500/10 text-purple-500"
          />
          <FeatureCard 
            icon={BrainCircuit}
            title="Active Recall"
            description="Capture key concepts and create instant flashcards. Lumina helps you move information from the page to your memory."
            delay={0.3}
            accent="bg-pink-500/10 text-pink-500"
          />
          <FeatureCard 
            icon={Zap}
            title="Real-time Sync"
            description="Your workspace stays in sync across all your devices instantly using our live database infrastructure."
            delay={0.1}
            accent="bg-orange-500/10 text-orange-500"
          />
          <FeatureCard 
            icon={Layout}
            title="Focus-First Design"
            description="A minimalist, distraction-free environment designed to keep your attention on what matters: your studies."
            delay={0.2}
            accent="bg-emerald-500/10 text-emerald-500"
          />
          <FeatureCard 
            icon={BookOpen}
            title="Academic Dashboard"
            description="A unified view of your upcoming deadlines, recent notes, and key concepts in a single, polished pane."
            delay={0.3}
            accent="bg-gray-500/10 text-gray-500"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 sm:px-12 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[180px] rounded-full -z-10 opacity-60" />
        <div className="max-w-4xl mx-auto space-y-10">
          <h2 className="text-6xl sm:text-8xl font-black tracking-tighter mb-8 leading-none">Ready to <br /><span className="text-primary italic underline decoration-primary/20">Dominate?</span></h2>
          <p className="text-text-muted text-xl max-w-2xl mx-auto font-medium">
            Join a new generation of high-performing students who focus on what matters. Sign up for Lumina today.
          </p>
          <div className="flex items-center justify-center">
            <button 
              onClick={() => { onSignup(); setIsAuthModalOpen(true); }}
              className="w-full sm:w-auto bg-primary text-white px-14 py-5 rounded-3xl font-black text-xl hover:scale-[1.03] shadow-2xl shadow-primary/40 transition-all active:scale-95"
            >
              Start Your Journey
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 sm:px-12 border-t border-border dark:border-border-dark bg-surface-muted/50 dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                  <GraduationCap className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight italic">Lumina</span>
              </div>
              <p className="text-text-muted text-sm max-w-xs leading-relaxed">
                The modern student command center for high-performance learning. Built with passion for the next generation.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="p-2 rounded-lg bg-surface dark:bg-surface-muted-dark border border-border dark:border-border-dark text-text-muted hover:text-primary transition-colors"><Twitter className="w-4 h-4" /></a>
                <a href="#" className="p-2 rounded-lg bg-surface dark:bg-surface-muted-dark border border-border dark:border-border-dark text-text-muted hover:text-primary transition-colors"><Github className="w-4 h-4" /></a>
                <a href="#" className="p-2 rounded-lg bg-surface dark:bg-surface-muted-dark border border-border dark:border-border-dark text-text-muted hover:text-primary transition-colors"><UserIcon className="w-4 h-4" /></a>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-24">
               <div className="space-y-6">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">Platform</h4>
                  <ul className="space-y-4 text-sm font-bold text-text-muted">
                    <li><a href="#" className="hover:text-text-main transition-colors">Workspace</a></li>
                    <li><a href="#" className="hover:text-text-main transition-colors">AI Assistant</a></li>
                    <li><a href="#" className="hover:text-text-main transition-colors">Calendar Sync</a></li>
                  </ul>
               </div>
               <div className="space-y-6">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">Resources</h4>
                  <ul className="space-y-4 text-sm font-bold text-text-muted">
                    <li><a href="#" className="hover:text-text-main transition-colors">Documentation</a></li>
                    <li><a href="#" className="hover:text-text-main transition-colors">Study Tips</a></li>
                    <li><a href="#" className="hover:text-text-main transition-colors">Privacy</a></li>
                  </ul>
               </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between pt-12 border-t border-border dark:border-white/5 gap-6">
            <div className="text-[10px] uppercase tracking-widest font-black text-text-muted/40">
              © 2026 Lumina Interactive. All rights reserved.
            </div>
            <div className="flex items-center gap-8 text-[10px] uppercase tracking-widest font-black text-text-muted/40">
              <a href="#" className="hover:text-text-main">Status</a>
              <a href="#" className="hover:text-text-main">Legal</a>
              <a href="#" className="hover:text-text-main">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-dark/60 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md"
            >
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute -top-12 right-0 p-3 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
                <span className="sr-only">Close</span>
              </button>
              <div className="bg-white dark:bg-[#0F0F0F] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-border dark:border-white/10 overflow-hidden">
                {authUI}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

