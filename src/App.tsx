/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, Component, ReactNode } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  User,
  getDoc,
  setDoc,
  deleteField,
  GoogleAuthProvider,
  deleteUser,
  reauthenticateWithPopup
} from './firebase';
import { 
  Layout, 
  BookOpen, 
  GraduationCap, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Search, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronRight, 
  ChevronLeft,
  MoreVertical,
  Trash2,
  Edit3,
  BrainCircuit,
  Layers,
  Menu,
  X,
  Clock,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  RotateCw,
  HelpCircle,
  Eye,
  Lightbulb,
  Settings,
  Palette,
  UserX,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { cn } from './lib/utils';
import { Task, SubTask, Note, TaskType, UserProfile, RecurrenceType } from './types';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { LandingPage } from './components/LandingPage';
import { Onboarding } from './components/Onboarding';
import { explainTopic, generateConcepts, generateFlashcards, GeminiError, AIErrorType } from './services/geminiService';
import { Type } from "@google/genai";
import Markdown from 'react-markdown';

const THEME_COLORS = [
  { name: 'Blue', primary: '#3B82F6', hover: '#2563EB', light: '#EFF6FF', dark: '#1D4ED8' },
  { name: 'Red', primary: '#EF4444', hover: '#DC2626', light: '#FEF2F2', dark: '#B91C1C' },
  { name: 'Pink', primary: '#EC4899', hover: '#DB2777', light: '#FDF2F8', dark: '#BE185D' },
  { name: 'Green', primary: '#10B981', hover: '#059669', light: '#ECFDF5', dark: '#047857' },
  { name: 'Yellow', primary: '#F59E0B', hover: '#D97706', light: '#FFFBEB', dark: '#B45309' },
  { name: 'Orange', primary: '#F97316', hover: '#EA580C', light: '#FFF7ED', dark: '#C2410C' },
  { name: 'Purple', primary: '#8B5CF6', hover: '#7C3AED', light: '#F5F3FF', dark: '#6D28D9' },
];

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    } 
  }
};

// --- Error Handling ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // We don't throw here to avoid crashing the UI, but we log it.
  return errInfo;
}

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-dark/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-surface dark:bg-surface-muted-dark w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border dark:border-border-dark"
      >
        <div className="px-6 py-5 border-b border-border dark:border-border-dark flex items-center justify-between bg-surface-muted/50 dark:bg-surface-muted-dark/50">
          <h3 className="font-bold text-xl tracking-tight text-text-main dark:text-text-main-dark">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-surface-muted dark:hover:bg-border-dark">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  ...props 
}: any) => {
  const variants: any = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-primary/30',
    secondary: 'bg-surface text-text-main border border-border hover:bg-surface-muted dark:bg-surface-muted-dark dark:text-text-main-dark dark:border-border-dark dark:hover:bg-border-dark shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-text-muted hover:text-text-main hover:bg-surface-muted dark:text-text-muted-dark dark:hover:text-text-main-dark dark:hover:bg-surface-muted-dark/80',
    danger: 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-900/30',
    glass: 'glass hover:bg-white/90 dark:hover:bg-surface-muted-dark/90 text-text-main dark:text-text-main-dark'
  };
  const sizes: any = {
    sm: 'px-3 py-1.5 text-xs h-8',
    md: 'px-5 py-2.5 text-sm h-11',
    lg: 'px-8 py-4 text-base h-14 font-extrabold',
    icon: 'p-2.5 w-11 h-11',
  };
  return (
    <motion.button 
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl font-bold transition-all disabled:opacity-50 disabled:pointer-events-none select-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
        />
      ) : null}
      {children}
    </motion.button>
  );
};

const Card = ({ children, className }: any) => (
  <div className={cn('bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-3xl shadow-sm overflow-hidden', className)}>
    {children}
  </div>
);

const Flashcard = ({ card }: { card: Note }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { deleteNote } = (window as any).appHandlers || {};

  return (
    <div className="group relative perspective-1000 h-64">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={(e: any) => { e.stopPropagation(); deleteNote?.(card.id); }}
        className="absolute -top-2 -right-2 z-20 opacity-0 group-hover:opacity-100 bg-surface dark:bg-surface-muted-dark shadow-lg text-text-muted hover:text-red-500 rounded-full"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      
      <motion.div 
        className="w-full h-full relative preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-primary to-primary-hover rounded-[2rem] p-8 flex flex-col shadow-2xl shadow-primary/20 border border-white/10 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          
          <div className="flex items-center gap-2 text-white/80 text-[10px] font-extrabold uppercase tracking-[0.25em] mb-4 relative z-10">
            <Layers className="w-4 h-4" />
            <span>Question</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-center relative z-10">
            <p className="text-white font-extrabold text-xl leading-tight tracking-tight">
              {card.question}
            </p>
          </div>

          <div className="mt-4 flex flex-col items-center gap-4 relative z-10">
            {card.hint && (
              <div className="w-full">
                {showHint ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-5 py-4 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg"
                  >
                    <p className="text-[11px] text-white italic text-center font-bold">
                      {card.hint}
                    </p>
                  </motion.div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHint(true);
                    }}
                    className="mx-auto flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-[10px] text-white font-extrabold uppercase tracking-widest transition-all border border-white/20 active:scale-95"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Show Hint
                  </button>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 text-[9px] text-white/70 font-extrabold uppercase tracking-[0.3em]">
              <RotateCw className="w-3.5 h-3.5" />
              Flip for answer
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden bg-surface dark:bg-surface-muted-dark rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl border-2 border-border dark:border-border-dark rotate-y-180 overflow-hidden">
          <div className="absolute top-8 left-8 text-text-muted/20 dark:text-text-muted-dark/20">
            <Lightbulb className="w-8 h-8" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-text-main dark:text-text-main-dark font-extrabold text-2xl leading-tight tracking-tight">
              {card.answer}
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[9px] text-text-muted dark:text-text-muted-dark font-extrabold uppercase tracking-[0.3em]">
            <RotateCw className="w-3.5 h-3.5" />
            Flip back
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Input = ({ label, icon: Icon, ...props }: any) => (
  <div className="space-y-2">
    {label && <label className="text-[10px] font-black text-text-main/50 dark:text-text-main-dark/50 uppercase tracking-[0.2em] ml-1">{label}</label>}
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-all duration-300" />}
      <input 
        className={cn(
          "w-full bg-surface-muted border border-border rounded-2xl py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all dark:bg-surface-muted-dark dark:border-border-dark dark:text-text-main-dark",
          Icon ? "pl-11 pr-4" : "px-4"
        )}
        {...props}
      />
    </div>
  </div>
);

// --- Error Boundary ---

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark p-4">
          <div className="max-w-md w-full bg-surface dark:bg-surface-muted-dark rounded-3xl shadow-xl p-8 text-center space-y-6 border border-border dark:border-border-dark">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark">Something went wrong</h2>
              <p className="text-text-muted dark:text-text-muted-dark text-sm">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
            </div>
            {this.state.error && (
              <div className="p-4 bg-surface-muted dark:bg-surface-muted-dark rounded-2xl text-left overflow-auto max-h-40 border border-border dark:border-border-dark">
                <code className="text-[10px] text-text-muted dark:text-text-muted-dark font-mono">
                  {this.state.error.toString()}
                </code>
              </div>
            )}
            <button 
              className="w-full bg-primary text-white rounded-2xl py-3 font-semibold hover:bg-primary-hover transition-colors"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Main App ---

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const [activeTab, setActiveTab] = useState<TaskType>('assignment');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [mobileActiveView, setMobileActiveView] = useState<'tasks' | 'dashboard' | 'ideas'>('dashboard');

  const tagline = useMemo(() => {
    const phrases = [
      "What are we studying today?",
      "What do we have next?",
      "Ready to excel?",
      "Stay focused, stay sharp.",
      "Academic mastery starts here."
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }, []);

  const [isTaskMenuOpen, setIsTaskMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isExplainmentModalOpen, setIsExplainmentModalOpen] = useState(false);
  const [explainmentContent, setExplainmentContent] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [isGeneratingConcepts, setIsGeneratingConcepts] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<'add' | 'edit'>('add');
  const [taskModalTitle, setTaskModalTitle] = useState('');
  const [taskModalDesc, setTaskModalDesc] = useState('');
  const [taskModalDueDate, setTaskModalDueDate] = useState('');
  const [taskModalRecurrence, setTaskModalRecurrence] = useState<RecurrenceType>('none');
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Delete Confirmation State
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const [isAddingConcept, setIsAddingConcept] = useState(false);
  const [newConceptContent, setNewConceptContent] = useState('');
  const [isAddingFlashcard, setIsAddingFlashcard] = useState(false);
  const [newFlashcardQuestion, setNewFlashcardQuestion] = useState('');
  const [newFlashcardAnswer, setNewFlashcardAnswer] = useState('');
  const [newFlashcardHint, setNewFlashcardHint] = useState('');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState('');
  const [taskIdToDelete, setTaskIdToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const color = THEME_COLORS.find(c => c.name === userProfile?.themeColor) || THEME_COLORS[0];
    const root = document.documentElement;
    root.style.setProperty('--primary-color', color.primary);
    root.style.setProperty('--primary-hover-color', color.hover);
    root.style.setProperty('--primary-light-color', color.light);
    root.style.setProperty('--primary-dark-color', color.dark);
  }, [userProfile?.themeColor]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // User Profile Listener
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        setUserProfile(profile);
        if (profile.hasCompletedOnboarding === false) {
          setShowOnboarding(true);
        }
      } else {
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          calendarSyncEnabled: false,
          aiEnabled: true,
          hasCompletedOnboarding: false
        };
        setDoc(doc(db, 'users', user.uid), newProfile);
        setShowOnboarding(true);
      }
    });
    return unsub;
  }, [user]);

  // Tasks Listener
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : undefined,
          createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
        };
      }) as Task[];
      setTasks(taskList);
      if (taskList.length > 0 && !selectedTaskId) {
        setSelectedTaskId(taskList[0].id);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });
    
    return unsubscribe;
  }, [user]);

  // Subtasks & Notes Listener
  useEffect(() => {
    if (!selectedTaskId || !user) return;
    
    const subQ = query(
      collection(db, 'tasks', selectedTaskId, 'subtasks'),
      orderBy('order', 'asc')
    );
    const unsubSub = onSnapshot(subQ, (snapshot) => {
      setSubtasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SubTask[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `tasks/${selectedTaskId}/subtasks`);
    });

    const noteQ = query(collection(db, 'tasks', selectedTaskId, 'notes'));
    const unsubNote = onSnapshot(noteQ, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Note[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `tasks/${selectedTaskId}/notes`);
    });

    return () => {
      unsubSub();
      unsubNote();
    };
  }, [selectedTaskId, user]);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // We could update profile here if needed
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGuestMode = async () => {
    setAuthError(null);
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setSelectedTaskId(null);
    setTasks([]);
    setSubtasks([]);
    setNotes([]);
    setShowOnboarding(false);
  };

  useEffect(() => {
    (window as any).appHandlers = {
      deleteNote: (id: string) => deleteNote(id)
    };
  }, [notes]);

  const completeOnboarding = async () => {
    setShowOnboarding(false);
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        hasCompletedOnboarding: true
      });
    } catch (error) {
      // If updating fails, the user might see onboarding again next time, but we've already closed it for this session.
      console.error("Failed to update onboarding status in Firestore:", error);
    }
  };

  const updateThemeColor = async (colorName: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        themeColor: colorName
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const toggleCalendarSync = async () => {
    if (!user || !userProfile) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        calendarSyncEnabled: !userProfile.calendarSyncEnabled
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const toggleAI = async () => {
    if (!user || !userProfile) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        aiEnabled: !userProfile.aiEnabled
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleExplainTopic = async () => {
    if (!selectedTask || !user) return;
    setIsExplaining(true);
    setIsExplainmentModalOpen(true);
    setExplainmentContent('');
    try {
      const explanation = await explainTopic(selectedTask.title, selectedTask.description);
      setExplainmentContent(explanation || "No explanation generated.");
    } catch (error: any) {
      console.error("AI Error:", error);
      if (error instanceof GeminiError) {
        if (error.type === AIErrorType.RATE_LIMIT) {
          setExplainmentContent(`### ⏳ Slow Down a Bit!\n\nYou've reached the AI request limit. Let's take a short break—Gemini will be ready to help you again in about a minute.\n\n*Study tip: While waiting, try reviewing your current tasks or organizing your notes!*`);
        } else {
          setExplainmentContent(`**AI Service Error (${error.type})**\n\n${error.message}`);
        }
      } else {
        setExplainmentContent(`Sorry, I couldn't generate an explanation right now. ${error.message || ""}`);
      }
    } finally {
      setIsExplaining(false);
    }
  };

  const handleGenerateAIConcepts = async () => {
    if (!selectedTask || !user) return;
    setIsGeneratingConcepts(true);
    try {
      const generated = await generateConcepts(selectedTask.title, selectedTask.description);
      const addPromises = generated.map(concept => 
        addDoc(collection(db, 'tasks', selectedTask.id, 'notes'), {
          taskId: selectedTask.id,
          content: `${concept.title}: ${concept.content}`,
          type: 'concept'
        })
      );
      await Promise.all(addPromises);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMessage = error instanceof GeminiError ? error.message : (error.message || "Failed to generate concepts");
      if (error instanceof GeminiError && error.type === AIErrorType.RATE_LIMIT) {
        errorMessage = "You've hit the speed limit! Please wait about a minute before generating more concepts so Gemini can catch up.";
      }
      alert(errorMessage);
    } finally {
      setIsGeneratingConcepts(false);
    }
  };

  const handleGenerateAIFlashcards = async () => {
    if (!selectedTask || !user) return;
    setIsGeneratingFlashcards(true);
    try {
      const generated = await generateFlashcards(selectedTask.title, selectedTask.description);
      const addPromises = generated.map(card => 
        addDoc(collection(db, 'tasks', selectedTask.id, 'notes'), {
          taskId: selectedTask.id,
          question: card.question,
          answer: card.answer,
          hint: card.hint,
          type: 'flashcard'
        })
      );
      await Promise.all(addPromises);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMessage = error instanceof GeminiError ? error.message : (error.message || "Failed to generate flashcards");
      if (error instanceof GeminiError && error.type === AIErrorType.RATE_LIMIT) {
        errorMessage = "Steady on! You've reached the rate limit. Gemini needs a quick 60-second recharge before creating more flashcards.";
      }
      alert(errorMessage);
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const getGoogleCalendarLink = (task: Task) => {
    const base = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const text = encodeURIComponent(task.title);
    const details = encodeURIComponent(task.description || '');
    
    let dates = '';
    if (task.dueDate) {
      // Format: YYYYMMDDTHHmmSSZ
      const start = task.dueDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
      const end = new Date(task.dueDate.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');
      dates = `&dates=${start}/${end}`;
    }
    
    return `${base}&text=${text}&details=${details}${dates}`;
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteAccountConfirm !== 'DELETE') return;
    
    setAuthError(null);
    
    const performDeletion = async () => {
      // 1. Delete Firestore user document while authenticated
      try {
        await deleteDoc(doc(db, 'users', user.uid));
      } catch (e) {
        console.warn("Firestore user doc deletion failed (might not exist):", e);
      }
      
      // 2. Delete the Auth user
      await deleteUser(user);
    };

    try {
      await performDeletion();
      handleLogout();
      setIsDeleteAccountModalOpen(false);
    } catch (error: any) {
      console.error("Account deletion error:", error);
      
      const isRecentLoginError = 
        error.code === 'auth/requires-recent-login' || 
        error.message?.includes('requires-recent-login') ||
        String(error).includes('requires-recent-login');

      if (isRecentLoginError) {
        const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');
        
        if (isGoogleUser) {
          try {
            // Attempt re-authentication for Google users
            await reauthenticateWithPopup(user, googleProvider);
            
            // If re-auth succeeds, try the deletion sequence again
            await performDeletion();
            
            handleLogout();
            setIsDeleteAccountModalOpen(false);
          } catch (reauthError: any) {
            console.error("Re-authentication failed:", reauthError);
            setAuthError("For security, please log out and log back in before deleting your account.");
          }
        } else {
          // For other providers or anonymous users, they must log in again
          setAuthError("This sensitive operation requires a recent login. Please log out and log back in to delete your account.");
        }
      } else {
        setAuthError(error.message || "An unexpected error occurred during account deletion.");
      }
    }
  };

  const openAddTask = () => {
    setTaskModalMode('add');
    setTaskModalTitle('');
    setTaskModalDesc('');
    setTaskModalDueDate('');
    setTaskModalRecurrence('none');
    setIsTaskModalOpen(true);
  };

  const openEditTask = (task: Task) => {
    setTaskModalMode('edit');
    setTaskToEdit(task);
    setTaskModalTitle(task.title);
    setTaskModalDesc(task.description || '');
    setTaskModalDueDate(task.dueDate ? format(task.dueDate, "yyyy-MM-dd'T'HH:mm") : '');
    setTaskModalRecurrence(task.recurrence || 'none');
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const taskData: any = {
      userId: user.uid,
      title: taskModalTitle,
      description: taskModalDesc,
      type: activeTab,
      status: taskToEdit?.status || 'pending',
      progress: taskToEdit?.progress || 0,
      createdAt: taskToEdit?.createdAt ? Timestamp.fromDate(taskToEdit.createdAt) : Timestamp.now(),
      recurrence: taskModalRecurrence
    };

    if (taskModalDueDate) {
      taskData.dueDate = Timestamp.fromDate(new Date(taskModalDueDate));
    }

    try {
      let taskId = '';
      if (taskModalMode === 'edit' && taskToEdit) {
        taskId = taskToEdit.id;
        // If editing, we might need to explicitly remove dueDate if it was cleared
        if (!taskModalDueDate) {
          await updateDoc(doc(db, 'tasks', taskToEdit.id), {
            ...taskData,
            dueDate: deleteField()
          });
        } else {
          await updateDoc(doc(db, 'tasks', taskToEdit.id), taskData);
        }
      } else {
        const docRef = await addDoc(collection(db, 'tasks'), taskData);
        taskId = docRef.id;
      }
      
      setIsTaskModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, taskModalMode === 'edit' ? OperationType.UPDATE : OperationType.CREATE, 'tasks');
    }
  };

  const deleteTask = async () => {
    if (!taskIdToDelete) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskIdToDelete));
      if (selectedTaskId === taskIdToDelete) setSelectedTaskId(null);
      setIsDeleteModalOpen(false);
      setTaskIdToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${taskIdToDelete}`);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    if (!user) return;
    const isNowCompleted = task.status !== 'completed';
    const newStatus = isNowCompleted ? 'completed' : 'pending';
    const newProgress = isNowCompleted ? 100 : 0;
    
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status: newStatus,
        progress: newProgress
      });

      // Handle recurrence if completed
      if (isNowCompleted && task.recurrence && task.recurrence !== 'none') {
        let nextDueDate: Date | null = null;
        const currentDueDate = task.dueDate || new Date();

        if (task.recurrence === 'daily') nextDueDate = addDays(currentDueDate, 1);
        else if (task.recurrence === 'weekly') nextDueDate = addWeeks(currentDueDate, 1);
        else if (task.recurrence === 'monthly') nextDueDate = addMonths(currentDueDate, 1);

        if (nextDueDate) {
          await addDoc(collection(db, 'tasks'), {
            userId: user.uid,
            title: task.title,
            description: task.description,
            type: task.type,
            status: 'pending',
            progress: 0,
            createdAt: Timestamp.now(),
            dueDate: Timestamp.fromDate(nextDueDate),
            recurrence: task.recurrence,
            parentId: task.parentId || task.id
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${task.id}`);
    }
  };

  const confirmDelete = (taskId: string) => {
    setTaskIdToDelete(taskId);
    setIsDeleteModalOpen(true);
  };

  const addTask = async () => {
    // Deprecated in favor of openAddTask
  };

  const addSubtask = async () => {
    if (!selectedTaskId || !user || !newSubtaskTitle.trim()) return;

    const title = newSubtaskTitle.trim();
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);

    try {
      await addDoc(collection(db, 'tasks', selectedTaskId, 'subtasks'), {
        taskId: selectedTaskId,
        title,
        completed: false,
        order: subtasks.length,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `tasks/${selectedTaskId}/subtasks`);
    }
  };

  const toggleSubtask = async (sub: SubTask) => {
    if (!selectedTaskId || !user) return;
    
    try {
      // Parallelize the subtask update and the parent task progress update
      const updatedSubtasks = subtasks.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s);
      const completedCount = updatedSubtasks.filter(s => s.completed).length;
      const progress = Math.round((completedCount / updatedSubtasks.length) * 100);
      
      await Promise.all([
        updateDoc(doc(db, 'tasks', selectedTaskId, 'subtasks', sub.id), {
          completed: !sub.completed,
        }),
        updateDoc(doc(db, 'tasks', selectedTaskId), {
          progress,
          status: progress === 100 ? 'completed' : 'pending'
        })
      ]);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${selectedTaskId}/subtasks/${sub.id}`);
    }
  };

  const addFlashcard = () => addNote('flashcard');

  const deleteSubtask = async (subtaskId: string) => {
    if (!selectedTaskId || !user) return;
    try {
      await deleteDoc(doc(db, 'tasks', selectedTaskId, 'subtasks', subtaskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${selectedTaskId}/subtasks/${subtaskId}`);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!selectedTaskId || !user) return;
    try {
      await deleteDoc(doc(db, 'tasks', selectedTaskId, 'notes', noteId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${selectedTaskId}/notes/${noteId}`);
    }
  };

  const addNote = async (type: 'concept' | 'flashcard') => {
    if (!selectedTaskId || !user) return;

    try {
      if (type === 'concept') {
        if (!newConceptContent.trim()) return;
        const content = newConceptContent.trim();
        setNewConceptContent('');
        setIsAddingConcept(false);
        
        await addDoc(collection(db, 'tasks', selectedTaskId, 'notes'), {
          taskId: selectedTaskId,
          content,
          type,
        });
      } else {
        if (!newFlashcardQuestion.trim() || !newFlashcardAnswer.trim()) return;
        const question = newFlashcardQuestion.trim();
        const answer = newFlashcardAnswer.trim();
        const hint = newFlashcardHint.trim();
        
        setNewFlashcardQuestion('');
        setNewFlashcardAnswer('');
        setNewFlashcardHint('');
        setIsAddingFlashcard(false);

        await addDoc(collection(db, 'tasks', selectedTaskId, 'notes'), {
          taskId: selectedTaskId,
          question,
          answer,
          hint,
          type,
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `tasks/${selectedTaskId}/notes`);
    }
  };

  const selectedTask = useMemo(() => tasks.find(t => t.id === selectedTaskId), [tasks, selectedTaskId]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface dark:bg-surface-dark overflow-hidden">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    const authUI = (
      <Card className="max-w-md w-full p-8 space-y-6 border-none shadow-2xl dark:bg-surface-muted-dark">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20 mb-4">
            <GraduationCap className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark">Lumina</h1>
          <p className="text-text-muted dark:text-text-muted-dark text-sm">Your minimalist cognitive command center.</p>
        </div>

        {authError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {authMode === 'signup' && (
            <Input 
              label="Full Name" 
              icon={UserIcon} 
              placeholder="John Doe" 
              value={displayName}
              onChange={(e: any) => setDisplayName(e.target.value)}
              required
            />
          )}
          <Input 
            label="Email Address" 
            icon={Mail} 
            type="email" 
            placeholder="name@university.edu" 
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Password" 
            icon={Lock} 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full py-3" isLoading={isAuthLoading}>
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border dark:border-border-dark"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-surface dark:bg-surface-muted-dark px-2 text-text-main/40 dark:text-text-main-dark/40 font-bold tracking-widest">Or continue with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleGoogleLogin} variant="secondary" className="gap-2">
            Google
          </Button>
          <Button onClick={handleGuestMode} variant="secondary">
            Guest Mode
          </Button>
        </div>

        <p className="text-center text-sm text-text-muted dark:text-text-muted-dark">
          {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="text-primary font-bold hover:underline"
          >
            {authMode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </Card>
    );

    return (
      <LandingPage 
        onLogin={() => setAuthMode('login')}
        onSignup={() => setAuthMode('signup')}
        onGuestMode={handleGuestMode}
        onGoogleLogin={handleGoogleLogin}
        authUI={authUI}
        isAuthModalOpen={isAuthModalOpen}
        setIsAuthModalOpen={setIsAuthModalOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-surface dark:bg-surface-dark text-text-main dark:text-text-main-dark font-sans transition-colors duration-300 overflow-hidden">
      
      {/* Header */}
      <header className="h-20 border-b border-border dark:border-border-dark flex items-center justify-between px-4 sm:px-6 glass z-[60] shrink-0">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 sm:gap-3 cursor-default"
          >
            <div className="w-9 h-9 sm:w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <GraduationCap className="text-white w-5 h-5 sm:w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-text-main dark:text-text-main-dark leading-none">Lumina</span>
              <span className="hidden sm:block text-[10px] font-bold text-primary uppercase tracking-widest mt-1 opacity-80">
                {user ? tagline : "Cognitive Command"}
              </span>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative">
            <Button 
              id="hamburger-menu"
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
              className={cn("rounded-full w-9 h-9 sm:w-10 sm:h-10 transition-all", isSettingsOpen && "bg-surface-muted dark:bg-surface-muted-dark")}
            >
              <Menu className="w-5 h-5 text-text-muted" />
            </Button>

            <AnimatePresence>
              {isSettingsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSettingsOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="fixed top-24 left-4 right-4 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-3 sm:w-64 bg-surface dark:bg-surface-muted-dark rounded-[2rem] shadow-2xl border border-border dark:border-border-dark z-[70] overflow-hidden mx-auto max-w-[320px] sm:max-w-none"
                  >
                    <div className="p-5 space-y-5">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-[10px] font-extrabold text-text-main/50 dark:text-text-main-dark/50 uppercase tracking-[0.2em]">
                          <Settings className="w-3 h-3" />
                          Settings
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setDarkMode(!darkMode)} 
                          className="rounded-full w-8 h-8 hover:bg-surface-muted dark:hover:bg-border-dark"
                        >
                          {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-text-muted" />}
                        </Button>
                      </div>

                      <div className="space-y-3 px-1">
                        <div className="flex items-center gap-2 text-[10px] font-extrabold text-text-main/50 dark:text-text-main-dark/50 uppercase tracking-[0.2em]">
                          <Palette className="w-3 h-3" />
                          Theme Color
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {THEME_COLORS.map((c) => (
                            <button
                              key={c.name}
                              onClick={() => updateThemeColor(c.name)}
                              className={cn(
                                "w-full aspect-square rounded-xl transition-all border-2 relative group",
                                (userProfile?.themeColor === c.name || (!userProfile?.themeColor && c.name === 'Blue'))
                                  ? "border-primary scale-110 shadow-lg shadow-primary/20" 
                                  : "border-transparent hover:scale-105"
                              )}
                              style={{ backgroundColor: c.primary }}
                              title={c.name}
                            >
                              {(userProfile?.themeColor === c.name || (!userProfile?.themeColor && c.name === 'Blue')) && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 px-1">
                        <div className="flex items-center gap-2 text-[10px] font-extrabold text-text-main/50 dark:text-text-main-dark/50 uppercase tracking-[0.2em]">
                          <Calendar className="w-3 h-3" />
                          Integrations
                        </div>
                         <div className="flex items-center justify-between p-3 bg-surface-muted dark:bg-surface-muted-dark/50 rounded-2xl border border-border dark:border-border-dark">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-text-main dark:text-text-main-dark">Google Calendar</span>
                            <span className="text-[10px] text-text-main/60 dark:text-text-main-dark/60 font-medium">Sync your tasks</span>
                          </div>
                          <button 
                            onClick={toggleCalendarSync}
                            className={cn(
                              "w-10 h-6 rounded-full transition-all relative flex items-center px-1",
                              userProfile?.calendarSyncEnabled ? "bg-primary" : "bg-border dark:bg-border-dark"
                            )}
                          >
                            <motion.div 
                              animate={{ x: userProfile?.calendarSyncEnabled ? 16 : 0 }}
                              className="w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-surface-muted dark:bg-surface-muted-dark/50 rounded-2xl border border-border dark:border-border-dark">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-text-main dark:text-text-main-dark">Gemini AI</span>
                              <span className="text-[8px] bg-primary/10 text-primary px-1 rounded-sm uppercase font-black">Free</span>
                            </div>
                            <span className="text-[10px] text-text-main/60 dark:text-text-main-dark/60 font-medium">Study help & flashcards</span>
                          </div>
                          <button 
                            onClick={toggleAI}
                            className={cn(
                              "w-10 h-6 rounded-full transition-all relative flex items-center px-1",
                              userProfile?.aiEnabled ? "bg-primary" : "bg-border dark:bg-border-dark"
                            )}
                          >
                            <motion.div 
                              animate={{ x: userProfile?.aiEnabled ? 16 : 0 }}
                              className="w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                          </button>
                        </div>

                      </div>

                      <div className="pt-2 border-t border-border dark:border-border-dark">
                        <button
                          onClick={() => {
                            setIsSettingsOpen(false);
                            setIsDeleteAccountModalOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors uppercase tracking-wider"
                        >
                          <UserX className="w-4 h-4" />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          
          <div className="h-8 w-px bg-border dark:bg-border-dark mx-0.5 sm:mx-1" />
          
          <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-text-main dark:text-text-main-dark leading-none">{user.isAnonymous ? 'Guest User' : (user.displayName || user.email?.split('@')[0])}</p>
              <p className="text-[10px] text-text-muted dark:text-text-muted-dark mt-1">{user.isAnonymous ? 'Local Session' : user.email}</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border-2 border-surface dark:border-border-dark shadow-md">
              {user.photoURL ? <img src={user.photoURL} alt="profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : (user.displayName?.[0] || user.email?.[0]?.toUpperCase() || 'G')}
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-text-main/60 hover:text-red-500 dark:text-text-main-dark/60 dark:hover:text-red-400 rounded-full w-9 h-9 sm:w-10 sm:h-10">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar Toggle */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cn(
            "hidden lg:flex absolute top-1/2 -translate-y-1/2 z-50 w-6 h-12 bg-surface dark:bg-surface-muted-dark border border-border dark:border-border-dark rounded-full shadow-lg items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-surface-muted dark:hover:bg-border-dark group",
            isSidebarOpen ? "left-80 -translate-x-1/2" : "left-4",
            showOnboarding && "opacity-0 pointer-events-none"
          )}
          title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4 text-text-muted group-hover:text-primary" /> : <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary" />}
        </button>

        {/* Left Sidebar - Task List */}
        <aside className={cn(
          "border-r border-border dark:border-border-dark flex flex-col bg-surface-muted dark:bg-surface-dark/50 backdrop-blur-sm transition-all duration-300",
          !isSidebarOpen && "lg:-ml-80",
          "fixed top-20 bottom-20 inset-x-0 z-40 lg:relative lg:top-0 lg:bottom-0 lg:inset-auto lg:w-80",
          mobileActiveView === 'tasks' ? "flex" : "hidden lg:flex"
        )}>
          <div className="p-6 space-y-6">
            <div className="relative p-1.5 bg-border/30 dark:bg-surface-muted-dark rounded-2xl flex">
              <motion.div 
                layoutId="active-tab-bg"
                className="absolute inset-y-1.5 bg-surface dark:bg-surface-muted-dark rounded-xl shadow-sm z-0"
                style={{ 
                  width: 'calc(50% - 6px)',
                  left: activeTab === 'assignment' ? '6px' : 'calc(50% + 0px)'
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
              <button 
                onClick={() => setActiveTab('assignment')}
                className={cn(
                  "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all relative z-10", 
                  activeTab === 'assignment' ? "text-primary dark:text-primary-light" : "text-text-main/60 dark:text-text-main-dark/60 hover:text-text-main dark:hover:text-text-main-dark"
                )}
              >
                Assignments
              </button>
              <button 
                onClick={() => setActiveTab('exam')}
                className={cn(
                  "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all relative z-10", 
                  activeTab === 'exam' ? "text-primary dark:text-primary-light" : "text-text-main/60 dark:text-text-main-dark/60 hover:text-text-main dark:hover:text-text-main-dark"
                )}
              >
                Exams
              </button>
            </div>

            <Button onClick={openAddTask} className="w-full gap-2 py-6 rounded-2xl text-sm">
              <Plus className="w-5 h-5" />
              New {activeTab === 'assignment' ? 'Assignment' : 'Exam'}
            </Button>

            <div className="relative flex items-center bg-surface dark:bg-surface-muted-dark rounded-2xl px-4 py-3.5 border border-border dark:border-border-dark shadow-sm transition-all focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/40 group">
              <Search className="w-4 h-4 text-text-muted mr-3 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}s...`} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-sm focus:outline-none w-full dark:text-text-main-dark placeholder:text-text-muted font-bold"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-surface-muted dark:hover:bg-border-dark rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-text-muted" />
                </button>
              )}
            </div>
          </div>

              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 custom-scrollbar"
              >
                {tasks.filter(t => {
                  const matchesTab = t.type === activeTab;
                  const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                       (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
                  return matchesTab && matchesSearch;
                }).length === 0 ? (
                  <motion.div variants={staggerItem} className="py-16 text-center px-4">
                    <div className="w-20 h-20 bg-primary/5 dark:bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="text-primary/40 w-10 h-10" />
                    </div>
                    <p className="text-base font-extrabold text-text-main dark:text-text-main-dark tracking-tight">
                      {searchQuery ? "No matching tasks" : `No ${activeTab}s yet`}
                    </p>
                    <p className="text-xs font-medium text-text-main/60 dark:text-text-main-dark/60 mt-2 leading-relaxed max-w-[200px] mx-auto">
                      {searchQuery ? "Try a different search term or clear the filter." : "Get started by adding your first academic challenge."}
                    </p>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="popLayout" initial={false}>
                    {tasks.filter(t => {
                      const matchesTab = t.type === activeTab;
                      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                           (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
                      return matchesTab && matchesSearch;
                    }).map(task => (
                      <motion.div 
                        key={task.id} 
                        layout
                        variants={staggerItem}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className="relative group"
                      >
                    <button
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setMobileActiveView('dashboard');
                        setIsTaskMenuOpen(false);
                      }}
                      className={cn(
                        "w-full text-left p-5 rounded-[1.5rem] transition-all relative pr-24 border-2",
                        selectedTaskId === task.id 
                          ? "bg-surface dark:bg-surface-muted-dark border-primary/20 shadow-xl shadow-primary/10 text-primary dark:text-text-main-dark scale-[1.02]" 
                          : "bg-transparent border-transparent hover:bg-surface/50 dark:hover:bg-surface-muted-dark/50 text-text-main/60 dark:text-text-main-dark/60 hover:text-text-main dark:hover:text-text-main-dark hover:scale-[1.01]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            task.status === 'completed' ? "bg-green-500" : "bg-primary"
                          )} />
                          <span className={cn(
                            "text-[10px] font-extrabold uppercase tracking-[0.2em]",
                            selectedTaskId === task.id ? "text-primary/90" : "text-text-main/40 dark:text-text-main-dark/40"
                          )}>
                            {task.type}
                          </span>
                          {task.recurrence && task.recurrence !== 'none' && (
                            <RotateCw className="w-3 h-3 text-primary/60" />
                          )}
                        </div>
                        {task.dueDate && (
                          <span className="text-[9px] font-bold text-text-muted/60">
                            {format(task.dueDate, 'MMM d')}
                          </span>
                        )}
                      </div>
                      <h3 className={cn("text-sm font-bold line-clamp-2 tracking-tight leading-snug", task.status === 'completed' && "line-through opacity-50")}>{task.title}</h3>
                      <div className="flex items-center gap-2 mt-2.5 text-[10px] font-medium opacity-70">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{task.dueDate ? format(task.dueDate, 'MMM d, yyyy') : 'No due date'}</span>
                      </div>
                      {selectedTaskId === task.id && (
                        <motion.div layoutId="active-indicator" className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-full" />
                      )}
                    </button>
                    <div className="absolute right-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {userProfile?.calendarSyncEnabled && (
                        <a 
                          href={getGoogleCalendarLink(task)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2.5 rounded-xl text-text-muted hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center"
                          title="Add to Google Calendar"
                        >
                          <Calendar className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskStatus(task);
                      }}
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all",
                        task.status === 'completed' 
                          ? "text-green-600 bg-green-50 dark:bg-green-900/20" 
                          : "text-text-muted/30 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
                      )}
                    >
                      {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </motion.div>
        </aside>

        {/* Center Panel - Task Details */}
        <section className={cn(
          "flex-1 min-w-0 overflow-y-auto bg-surface dark:bg-surface-dark p-4 sm:p-6 lg:p-4 xl:p-12 custom-scrollbar pb-24 lg:pb-12",
          mobileActiveView !== 'dashboard' && "hidden lg:block"
        )}>
          {selectedTask ? (
            <motion.div 
              key={selectedTask.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto w-full space-y-8"
            >
              {/* Task Header Card */}
              <div className="bento-card p-8 sm:p-10 relative">
                <div className="absolute top-0 right-0 p-6">
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsTaskMenuOpen(!isTaskMenuOpen)}
                      className="rounded-full hover:bg-surface-muted dark:hover:bg-border-dark"
                    >
                      <MoreVertical className="w-5 h-5 text-text-main/40 dark:text-text-main-dark/40" />
                    </Button>
                    <AnimatePresence>
                      {isTaskMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIsTaskMenuOpen(false)} />
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 mt-2 w-48 bg-surface dark:bg-surface-muted-dark rounded-2xl shadow-2xl border border-border dark:border-border-dark z-20 overflow-hidden"
                          >
                            <button 
                              onClick={() => {
                                openEditTask(selectedTask);
                                setIsTaskMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-main dark:text-text-main-dark hover:bg-surface-muted dark:hover:bg-border-dark transition-colors"
                            >
                              <Edit3 className="w-4 h-4 text-primary" />
                              Edit Details
                            </button>
                            <button 
                              onClick={() => {
                                confirmDelete(selectedTask.id);
                                setIsTaskMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Task
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest",
                        selectedTask.type === 'assignment' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                      )}>
                        {selectedTask.type}
                      </div>
                      {selectedTask.status === 'completed' && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-extrabold uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </div>
                      )}
                    </div>
                    <h1 className={cn(
                      "text-3xl sm:text-4xl font-extrabold tracking-tight text-text-main dark:text-text-main-dark leading-tight",
                      selectedTask.status === 'completed' && "line-through opacity-50"
                    )}>
                      {selectedTask.title}
                    </h1>
                  </div>

                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-extrabold text-text-main/50 dark:text-text-main-dark/50 uppercase tracking-widest">Deadline</span>
                        <span className="text-sm font-bold text-text-main dark:text-text-main-dark">
                          {selectedTask.dueDate ? format(selectedTask.dueDate, 'MMMM d, yyyy') : 'No due date'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-extrabold text-text-main/50 dark:text-text-main-dark/50 uppercase tracking-widest">Progress</span>
                        <span className="text-sm font-bold text-text-main dark:text-text-main-dark">{selectedTask.progress}% Complete</span>
                      </div>
                    </div>
                  </div>

                  {userProfile?.calendarSyncEnabled && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-2"
                    >
                      <a 
                        href={getGoogleCalendarLink(selectedTask)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-5 py-3 bg-primary text-white rounded-2xl text-xs font-extrabold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95 group/cal"
                      >
                        <Calendar className="w-4 h-4 group-hover/cal:rotate-12 transition-transform" />
                        Sync to Google Calendar
                      </a>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Description & Progress Bento Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bento-card p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs-bold text-text-muted">
                    <Edit3 className="w-3.5 h-3.5" />
                    Description
                  </div>
                  <p className="text-sm text-text-main dark:text-text-main-dark leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedTask.description || "No description provided for this task."}
                  </p>
                </div>
                <div className="bento-card p-8 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs-bold text-text-muted">
                      <RotateCw className="w-3.5 h-3.5" />
                      Completion
                    </div>
                    <div className="relative w-24 h-24 mx-auto">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          className="text-border dark:text-border-dark stroke-current"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <motion.path
                          className="text-primary stroke-current"
                          strokeWidth="3"
                          strokeDasharray={`${selectedTask.progress}, 100`}
                          strokeLinecap="round"
                          fill="none"
                          initial={{ strokeDasharray: "0, 100" }}
                          animate={{ strokeDasharray: `${selectedTask.progress}, 100` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-extrabold text-text-main dark:text-text-main-dark">{selectedTask.progress}%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-text-main/40 dark:text-text-main-dark/40 font-bold uppercase tracking-widest mt-4">Task Mastery</p>
                </div>
              </div>

              {/* Checklist Bento Card */}
              <div className="bento-card p-8 sm:p-10 space-y-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                      <Layout className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tight text-text-main dark:text-text-main-dark truncate">Checklist</h2>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setIsAddingSubtask(!isAddingSubtask)} 
                    className="font-bold text-xs shrink-0 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Add Step
                  </Button>
                </div>
                
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {isAddingSubtask && (
                        <motion.div 
                          key="add-subtask"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-5 bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 rounded-2xl flex flex-col sm:flex-row gap-3"
                        >
                        <input 
                          autoFocus
                          className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-text-main dark:text-text-main-dark placeholder:text-text-muted min-w-0 font-bold"
                          placeholder="What's the next step?"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addSubtask();
                            if (e.key === 'Escape') setIsAddingSubtask(false);
                          }}
                        />
                        <Button size="sm" onClick={addSubtask} disabled={!newSubtaskTitle.trim()} className="shrink-0">
                          Add Step
                        </Button>
                      </motion.div>
                    )}

                    {subtasks.length === 0 && !isAddingSubtask ? (
                      <motion.div variants={staggerItem} className="p-16 border-2 border-dashed border-border dark:border-border-dark rounded-[2.5rem] text-center group hover:border-primary/30 transition-colors">
                        <div className="w-12 h-12 bg-surface-muted dark:bg-surface-muted-dark rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-40 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-text-main/60 dark:text-text-main-dark/60">Break this task into smaller, manageable steps.</p>
                      </motion.div>
                    ) : (
                      subtasks.map(sub => (
                        <motion.div 
                          key={sub.id}
                          layout
                          variants={staggerItem}
                          onClick={() => toggleSubtask(sub)}
                          className={cn(
                            "group flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all",
                            sub.completed 
                              ? "bg-surface-muted/50 dark:bg-surface-muted-dark/30 border-transparent opacity-60" 
                              : "bg-surface dark:bg-surface-muted-dark border-border dark:border-border-dark hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
                          )}
                        >
                          <div className={cn(
                            "w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-sm",
                            sub.completed ? "bg-green-500 text-white" : "border-2 border-border dark:border-border-dark text-transparent group-hover:border-primary"
                          )}>
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <span className={cn(
                            "flex-1 text-sm font-bold text-text-main dark:text-text-main-dark min-w-0 break-words tracking-tight", 
                            sub.completed && "line-through opacity-50"
                          )}>
                            {sub.title}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e: any) => { e.stopPropagation(); deleteSubtask(sub.id); }}
                            className="opacity-0 group-hover:opacity-100 text-text-main/40 hover:text-red-500 dark:text-text-main-dark/40 dark:hover:text-red-400 rounded-full w-8 h-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 bg-surface-muted dark:bg-surface-muted-dark rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
                <GraduationCap className="w-12 h-12 text-text-main/20 dark:text-text-main-dark/20" />
              </div>
              <h2 className="text-2xl font-extrabold text-text-main dark:text-text-main-dark tracking-tight">Select a task to begin</h2>
              <p className="text-text-main/50 dark:text-text-main-dark/50 mt-2 max-w-xs leading-relaxed">Choose an assignment or exam from the sidebar to view details and manage your progress.</p>
            </div>
          )}
        </section>

        {/* Right Sidebar Toggle */}
        <button 
          onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          className={cn(
            "hidden lg:flex absolute top-1/2 -translate-y-1/2 z-50 w-6 h-12 bg-surface dark:bg-surface-muted-dark border border-border dark:border-border-dark rounded-full shadow-lg items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-surface-muted dark:hover:bg-border-dark group",
            isRightPanelOpen ? "lg:right-80 xl:right-96 translate-x-1/2" : "right-4",
            showOnboarding && "opacity-0 pointer-events-none"
          )}
          title={isRightPanelOpen ? "Hide Key Ideas" : "Show Key Ideas"}
        >
          {isRightPanelOpen ? <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary" /> : <ChevronLeft className="w-4 h-4 text-text-muted group-hover:text-primary" />}
        </button>

        {/* Right Sidebar - Flashcards & Notes */}
        <aside className={cn(
          "w-full lg:w-80 xl:w-96 border-l border-border dark:border-border-dark flex flex-col bg-surface-muted dark:bg-surface-dark/50 backdrop-blur-sm transition-all duration-300",
          !isRightPanelOpen && "lg:-mr-80 xl:-mr-96",
          "fixed top-20 bottom-20 inset-x-0 z-40 lg:relative lg:top-0 lg:bottom-0 lg:inset-auto",
          mobileActiveView === 'ideas' ? "flex translate-x-0" : "hidden lg:flex",
          "max-w-3xl mx-auto lg:max-w-none"
        )}>
          <div className="p-8 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-text-main dark:text-text-main-dark">Key Ideas</h2>
              </div>
              <div className="flex items-center gap-2">
                {userProfile?.aiEnabled && selectedTask && (
                  <button 
                    onClick={handleExplainTopic}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-bold hover:bg-primary/20 transition-all border border-primary/20"
                  >
                    <BrainCircuit className="w-3 h-3" />
                    Explain Topic
                  </button>
                )}
                <Button variant="ghost" size="icon" className="lg:hidden rounded-full" onClick={() => setMobileActiveView('dashboard')}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
              {/* Key Concepts */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted dark:text-text-muted-dark">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Key Concepts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {userProfile?.aiEnabled && selectedTask && (
                      <button 
                        onClick={handleGenerateAIConcepts}
                        disabled={isGeneratingConcepts}
                        className="flex items-center gap-1.5 px-2 py-1 hover:bg-primary/5 text-primary rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
                      >
                        <RotateCw className={cn("w-3 h-3", isGeneratingConcepts && "animate-spin")} />
                        AI Generate
                      </button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsAddingConcept(!isAddingConcept)} 
                      className={cn("h-8 w-8 rounded-full", isAddingConcept ? "text-primary bg-primary/10" : "text-text-muted hover:text-primary hover:bg-primary/5")}
                    >
                      {isAddingConcept ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
                
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {isAddingConcept && (
                      <motion.div 
                        key="add-concept"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 bg-surface dark:bg-surface-muted-dark rounded-2xl border-2 border-primary/20 shadow-xl shadow-primary/5"
                      >
                        <textarea 
                          autoFocus
                          className="w-full bg-transparent border-none focus:ring-0 text-sm text-text-main dark:text-text-main-dark placeholder:text-text-muted min-h-[80px] resize-none p-0"
                          placeholder="What's the core idea?"
                          value={newConceptContent}
                          onChange={(e) => setNewConceptContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              addNote('concept');
                            }
                            if (e.key === 'Escape') setIsAddingConcept(false);
                          }}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <Button size="sm" variant="ghost" onClick={() => setIsAddingConcept(false)}>Cancel</Button>
                          <Button size="sm" onClick={() => addNote('concept')} disabled={!newConceptContent.trim()}>Add</Button>
                        </div>
                      </motion.div>
                    )}
                    
                    {notes.filter(n => n.type === 'concept').map(note => (
                      <motion.div 
                        key={note.id} 
                        layout
                        variants={staggerItem}
                        className="group relative p-5 bg-surface dark:bg-surface-muted-dark/50 rounded-2xl border-2 border-border dark:border-border-dark text-sm text-text-main dark:text-text-main-dark shadow-sm hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <p className="leading-relaxed font-bold tracking-tight">{note.content}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteNote(note.id)}
                          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 rounded-full transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Flashcards Header */}
              <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted dark:text-text-muted-dark">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Flashcards</span>
                </div>
                <div className="flex items-center gap-2">
                  {userProfile?.aiEnabled && selectedTask && (
                    <button 
                      onClick={handleGenerateAIFlashcards}
                      disabled={isGeneratingFlashcards}
                      className="flex items-center gap-1.5 px-2 py-1 hover:bg-primary/5 text-primary rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
                    >
                      <RotateCw className={cn("w-3 h-3", isGeneratingFlashcards && "animate-spin")} />
                      AI Generate
                    </button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsAddingFlashcard(!isAddingFlashcard)} 
                    className={cn("h-8 w-8 rounded-full", isAddingFlashcard ? "text-primary bg-primary/10" : "text-text-muted hover:text-primary hover:bg-primary/5")}
                  >
                    {isAddingFlashcard ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              {isAddingFlashcard && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-surface dark:bg-surface-muted-dark rounded-3xl border-2 border-primary/20 shadow-xl shadow-primary/5 space-y-4"
                >
                  <Input 
                    label="Question" 
                    placeholder="What is...?" 
                    value={newFlashcardQuestion}
                    onChange={(e: any) => setNewFlashcardQuestion(e.target.value)}
                  />
                  <Input 
                    label="Optional Hint" 
                    placeholder="Think about..." 
                    value={newFlashcardHint}
                    onChange={(e: any) => setNewFlashcardHint(e.target.value)}
                  />
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider ml-1">Answer</label>
                    <textarea 
                      className="w-full bg-surface-muted dark:bg-surface-muted-dark border border-border dark:border-border-dark rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all dark:text-text-main-dark min-h-[100px]"
                      placeholder="The answer is..."
                      value={newFlashcardAnswer}
                      onChange={(e) => setNewFlashcardAnswer(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="secondary" className="flex-1" onClick={() => setIsAddingFlashcard(false)}>Cancel</Button>
                    <Button className="flex-1" onClick={addFlashcard}>Add Card</Button>
                  </div>
                </motion.div>
              )}

              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6">
                  {notes.filter(n => n.type === 'flashcard').map(note => (
                    <motion.div key={note.id} variants={staggerItem}>
                      <Flashcard card={note} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
                   {notes.filter(n => n.type === 'flashcard').length === 0 && !isAddingFlashcard && (
                    <div className="py-12 text-center border-2 border-dashed border-border dark:border-border-dark rounded-3xl">
                      <Layers className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
                      <p className="text-sm font-bold text-text-main/80 dark:text-text-main-dark/80">No flashcards yet</p>
                      <p className="text-xs text-text-main/50 dark:text-text-main-dark/50 mt-1">Create cards to test your knowledge.</p>
                    </div>
                  )}
                </div>
              </div>
            </aside>

      </main>

      {/* Mobile Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-lg border-t border-border dark:border-border-dark px-6 flex items-center justify-around z-50">
        <button 
          onClick={() => setMobileActiveView('tasks')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            mobileActiveView === 'tasks' ? "text-primary scale-110" : "text-text-muted"
          )}
        >
          <div className={cn(
            "p-2 rounded-xl transition-all",
            mobileActiveView === 'tasks' ? "bg-primary/10" : "bg-transparent"
          )}>
            <Layout className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Tasks</span>
        </button>

        <button 
          onClick={() => setMobileActiveView('dashboard')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            mobileActiveView === 'dashboard' ? "text-primary scale-110" : "text-text-muted"
          )}
        >
          <div className={cn(
            "p-2 rounded-xl transition-all",
            mobileActiveView === 'dashboard' ? "bg-primary/10" : "bg-transparent"
          )}>
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Dashboard</span>
        </button>

        <button 
          onClick={() => setMobileActiveView('ideas')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            mobileActiveView === 'ideas' ? "text-primary scale-110" : "text-text-muted"
          )}
        >
          <div className={cn(
            "p-2 rounded-xl transition-all",
            mobileActiveView === 'ideas' ? "bg-primary/10" : "bg-transparent"
          )}>
            <BrainCircuit className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Key Ideas</span>
        </button>
      </nav>

      {/* Task Modal */}
      <Modal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        title={taskModalMode === 'add' ? `Add ${activeTab === 'assignment' ? 'Assignment' : 'Exam'}` : 'Edit Task'}
      >
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <Input 
            label="Title" 
            placeholder="e.g. Physics Lab Report" 
            value={taskModalTitle}
            onChange={(e: any) => setTaskModalTitle(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase ml-1">Description</label>
            <textarea 
              className="w-full bg-surface-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:bg-surface-muted-dark dark:border-border-dark dark:text-text-main-dark min-h-[100px]"
              placeholder="What needs to be done?"
              value={taskModalDesc}
              onChange={(e) => setTaskModalDesc(e.target.value)}
            />
          </div>
          <Input 
            label="Due Date (Optional)" 
            type="datetime-local" 
            value={taskModalDueDate}
            onChange={(e: any) => setTaskModalDueDate(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase ml-1">Recurrence</label>
            <div className="grid grid-cols-4 gap-2">
              {(['none', 'daily', 'weekly', 'monthly'] as RecurrenceType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTaskModalRecurrence(type)}
                  className={cn(
                    "py-2 rounded-xl text-xs font-bold transition-all border",
                    taskModalRecurrence === type 
                      ? "bg-primary text-white border-primary shadow-sm" 
                      : "bg-surface-muted dark:bg-surface-muted-dark text-text-muted border-border dark:border-border-dark hover:border-primary/50"
                  )}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {taskModalMode === 'add' ? 'Create Task' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Delete Task"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900 dark:text-red-200">Are you sure?</p>
              <p className="text-xs text-red-700 dark:text-red-400">This action cannot be undone. All subtasks and notes will be lost.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={deleteTask}>
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal 
        isOpen={isDeleteAccountModalOpen} 
        onClose={() => {
          setIsDeleteAccountModalOpen(false);
          setDeleteAccountConfirm('');
        }} 
        title="Delete Account"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900 dark:text-red-200">Critical Action</p>
              <p className="text-xs text-red-700 dark:text-red-400">This will permanently delete your account and all associated data. This cannot be undone.</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-[0.2em] ml-1">
              Type "DELETE" to confirm
            </label>
            <input 
              type="text"
              value={deleteAccountConfirm}
              onChange={(e) => setDeleteAccountConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-surface-muted border border-border rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all dark:bg-surface-muted-dark dark:border-border-dark dark:text-text-main-dark"
            />
          </div>

          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              className="flex-1" 
              onClick={() => {
                setIsDeleteAccountModalOpen(false);
                setDeleteAccountConfirm('');
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              className="flex-1" 
              onClick={handleDeleteAccount}
              disabled={deleteAccountConfirm !== 'DELETE'}
            >
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>

      {/* Explanation Modal */}
      <Modal 
        isOpen={isExplainmentModalOpen} 
        onClose={() => setIsExplainmentModalOpen(false)} 
        title="AI Personal Tutor"
      >
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <BrainCircuit className={cn("w-6 h-6", isExplaining && "animate-pulse")} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-extrabold text-text-main dark:text-text-main-dark">Deep Dive</h3>
              <p className="text-xs text-text-muted">Mastering {selectedTask?.title}</p>
            </div>
          </div>

          <div className="bg-surface-muted dark:bg-surface-muted-dark/50 rounded-3xl p-6 border border-border dark:border-border-dark min-h-[300px] max-h-[500px] overflow-y-auto custom-scrollbar">
            {isExplaining ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-bold text-text-main/60 dark:text-text-main-dark/60">Gemini is thinking...</p>
              </div>
            ) : (
              <div className="markdown-body text-sm max-w-none text-text-main dark:text-text-main-dark leading-relaxed font-medium">
                <Markdown>{explainmentContent}</Markdown>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setIsExplainmentModalOpen(false)} className="px-8">Got it!</Button>
          </div>
        </div>
      </Modal>

      {/* Onboarding Flow */}
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding 
            onComplete={completeOnboarding} 
            onStepChange={(stepIndex) => {
              // On mobile, switch views to match the spotlight
              if (window.innerWidth < 1024) {
                if (stepIndex === 1 || stepIndex === 2) setMobileActiveView('tasks');
                if (stepIndex === 3) setMobileActiveView('dashboard');
                if (stepIndex === 4) setMobileActiveView('ideas');
              }
              
              // Open settings for the personalization step
              if (stepIndex === 5) {
                setIsSettingsOpen(true);
              } else if (isSettingsOpen) {
                setIsSettingsOpen(false);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
