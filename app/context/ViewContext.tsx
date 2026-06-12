"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ViewType = "Card" | "Compact";
type ViewContextType = { view: ViewType; setView: (v: ViewType) => void };

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider = ({ children }: { children: React.ReactNode }) => {
  const [view, setViewState] = useState<ViewType>("Card");

  useEffect(() => {
    const stored = localStorage.getItem("view") as ViewType | null;
    if (stored === "Card" || stored === "Compact") {
      setViewState(stored);
    }
  }, []);

  const setView = (newView: ViewType) => {
    localStorage.setItem("view", newView);
    setViewState(newView);
  };

  return (
    <ViewContext.Provider value={{ view, setView }}>
      {children}
    </ViewContext.Provider>
  );
};

export const useView = () => {
  const context = useContext(ViewContext);
  if (!context) throw new Error("useView must be used within ViewProvider");
  return context;
};
