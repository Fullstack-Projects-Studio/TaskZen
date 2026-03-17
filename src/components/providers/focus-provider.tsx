"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { Task } from "@/hooks/use-tasks";

interface FocusContextType {
  activeTask: Task | null;
  isOpen: boolean;
  startFocus: (task: Task) => void;
  closeFocus: () => void;
}

const FocusContext = createContext<FocusContextType>({
  activeTask: null,
  isOpen: false,
  startFocus: () => {},
  closeFocus: () => {},
});

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const startFocus = useCallback((task: Task) => {
    setActiveTask(task);
    setIsOpen(true);
  }, []);

  const closeFocus = useCallback(() => {
    setIsOpen(false);
    setActiveTask(null);
  }, []);

  return (
    <FocusContext.Provider value={{ activeTask, isOpen, startFocus, closeFocus }}>
      {children}
    </FocusContext.Provider>
  );
}

export function useFocusContext() {
  return useContext(FocusContext);
}
