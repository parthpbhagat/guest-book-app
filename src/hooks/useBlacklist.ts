import { useState, useEffect } from 'react';

interface BlacklistedVisitor {
  id: string;
  name: string;
  phone: string;
  reason?: string;
  photo?: string;
  blacklisted_at: string;
  blacklisted_by?: string;
  is_active: boolean;
  propertyId?: string;
}

const STORAGE_KEY = 'blacklisted_visitors';

export const useBlacklist = () => {
  const [blacklisted, setBlacklisted] = useState<BlacklistedVisitor[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setBlacklisted(JSON.parse(stored));
    }
  }, []);

  const saveToStorage = (updated: BlacklistedVisitor[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setBlacklisted(updated);
  };

  const addToBlacklist = (visitor: Omit<BlacklistedVisitor, 'id' | 'blacklisted_at' | 'is_active'>) => {
    const newEntry: BlacklistedVisitor = {
      ...visitor,
      id: crypto.randomUUID(),
      blacklisted_at: new Date().toISOString(),
      is_active: true,
    };
    saveToStorage([newEntry, ...blacklisted]);
    return newEntry;
  };

  const removeFromBlacklist = (id: string) => {
    saveToStorage(blacklisted.filter((v) => v.id !== id));
  };

  const toggleActive = (id: string) => {
    saveToStorage(
      blacklisted.map((v) =>
        v.id === id ? { ...v, is_active: !v.is_active } : v
      )
    );
  };

  const isBlacklisted = (phone: string, propertyId?: string): BlacklistedVisitor | undefined => {
    return blacklisted.find(
      (v) =>
        v.phone === phone &&
        v.is_active &&
        (!propertyId || !v.propertyId || v.propertyId === propertyId)
    );
  };

  return {
    blacklisted,
    addToBlacklist,
    removeFromBlacklist,
    toggleActive,
    isBlacklisted,
  };
};
