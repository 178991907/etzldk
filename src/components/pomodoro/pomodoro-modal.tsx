'use client';

import { create, useStore } from 'zustand';
import { ReactNode, createContext, useContext, useRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import PomodoroPage from './pomodoro-page';

// --- Zustand Store Logic ---
interface PomodoroModalState {
  isOpen: boolean;
  openPomodoro: () => void;
  closePomodoro: () => void;
}

type PomodoroModalStore = ReturnType<typeof createPomodoroModalStore>;

const createPomodoroModalStore = () =>
  create<PomodoroModalState>((set) => ({
    isOpen: false,
    openPomodoro: () => set({ isOpen: true }),
    closePomodoro: () => set({ isOpen: false }),
  }));

const PomodoroModalContext = createContext<PomodoroModalStore | null>(null);

// --- Provider Component ---
export function PomodoroModalProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<PomodoroModalStore>();
  if (!storeRef.current) {
    storeRef.current = createPomodoroModalStore();
  }
  return (
    <PomodoroModalContext.Provider value={storeRef.current}>
      {children}
    </PomodoroModalContext.Provider>
  );
}

// --- Hook to use the store ---
export const usePomodoroModal = () => {
  const store = useContext(PomodoroModalContext);
  if (!store) {
    throw new Error('usePomodoroModal must be used within a PomodoroModalProvider');
  }
  return useStore(store);
};


// --- Modal Component ---
export function PomodoroModal() {
  const { isOpen, closePomodoro } = usePomodoroModal();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={closePomodoro}>
      <DialogContent className="max-w-md p-0 bg-transparent border-0 shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Pomodoro Timer</DialogTitle>
          <DialogDescription>A timer to help you focus on your tasks.</DialogDescription>
        </DialogHeader>
        <PomodoroPage />
      </DialogContent>
    </Dialog>
  );
}
