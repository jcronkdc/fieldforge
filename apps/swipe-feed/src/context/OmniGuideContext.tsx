/**
 * OMNIGUIDE CONTEXT - Global AI Assistant Provider
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface OmniGuideContextType {
  isOpen: boolean;
  isMinimized: boolean;
  toggleOmniGuide: () => void;
  openOmniGuide: () => void;
  closeOmniGuide: () => void;
  minimizeOmniGuide: () => void;
  maximizeOmniGuide: () => void;
  queryHistory: string[];
  addToHistory: (query: string) => void;
}

const OmniGuideContext = createContext<OmniGuideContextType | undefined>(undefined);

export const useOmniGuide = () => {
  const context = useContext(OmniGuideContext);
  if (!context) {
    throw new Error('useOmniGuide must be used within OmniGuideProvider');
  }
  return context;
};

interface Props {
  children: React.ReactNode;
}

export const OmniGuideProvider: React.FC<Props> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false); // Start closed by default
  const [isMinimized, setIsMinimized] = useState(false); // Start expanded when opened
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  const toggleOmniGuide = useCallback(() => {
    if (isOpen && !isMinimized) {
      setIsMinimized(true);
    } else if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  }, [isOpen, isMinimized]);

  const openOmniGuide = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const closeOmniGuide = useCallback(() => {
    setIsOpen(false);
  }, []);

  const minimizeOmniGuide = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximizeOmniGuide = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const addToHistory = useCallback((query: string) => {
    setQueryHistory(prev => [...prev, query].slice(-50)); // Keep last 50 queries
  }, []);

  return (
    <OmniGuideContext.Provider
      value={{
        isOpen,
        isMinimized,
        toggleOmniGuide,
        openOmniGuide,
        closeOmniGuide,
        minimizeOmniGuide,
        maximizeOmniGuide,
        queryHistory,
        addToHistory
      }}
    >
      {children}
    </OmniGuideContext.Provider>
  );
};
