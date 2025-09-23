import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type FavoriteItem = {
  id: string;
  title: string;
  image: string;
};

type FavoritesContextType = {
  items: FavoriteItem[];
  add: (item: FavoriteItem) => void;
  remove: (id: string) => void;
  toggle: (item: FavoriteItem) => void;
  clear: () => void;
  count: number;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};

const STORAGE_KEY = 'carriya:favorites';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = (item: FavoriteItem) => {
    setItems(prev => (prev.some(i => i.id === item.id) ? prev : [...prev, item]));
  };

  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const toggle = (item: FavoriteItem) => {
    setItems(prev => (prev.some(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]));
  };

  const clear = () => setItems([]);

  const value: FavoritesContextType = useMemo(() => ({
    items,
    add,
    remove,
    toggle,
    clear,
    count: items.length,
  }), [items]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};


