import { useState, useEffect } from 'react';
import { PreRegisteredVisitor } from '@/types/visitor';

const STORAGE_KEY = 'pre_registered_visitors';

export const usePreRegistration = () => {
  const [preRegistered, setPreRegistered] = useState<PreRegisteredVisitor[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setPreRegistered(JSON.parse(stored));
    }
  }, []);

  const saveToStorage = (updated: PreRegisteredVisitor[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setPreRegistered(updated);
  };

  const addPreRegistration = (visitor: Omit<PreRegisteredVisitor, 'id' | 'isActive'>) => {
    const newVisitor: PreRegisteredVisitor = {
      ...visitor,
      id: crypto.randomUUID(),
      isActive: true,
    };
    saveToStorage([...preRegistered, newVisitor]);
    return newVisitor;
  };

  const updatePreRegistration = (id: string, updates: Partial<PreRegisteredVisitor>) => {
    const updated = preRegistered.map((v) =>
      v.id === id ? { ...v, ...updates } : v
    );
    saveToStorage(updated);
  };

  const deletePreRegistration = (id: string) => {
    const updated = preRegistered.filter((v) => v.id !== id);
    saveToStorage(updated);
  };

  const toggleActive = (id: string) => {
    const updated = preRegistered.map((v) =>
      v.id === id ? { ...v, isActive: !v.isActive } : v
    );
    saveToStorage(updated);
  };

  const checkPreRegistered = (phone: string, hostId: string, propertyId?: string) => {
    const now = new Date();
    
    return preRegistered.find((v) => {
      if (!v.isActive) return false;
      if (v.phone !== phone) return false;
      if (v.hostId !== hostId) return false;
      if (propertyId && v.propertyId && v.propertyId !== propertyId) return false;

      // Check validity period
      if (v.validFrom && new Date(v.validFrom) > now) return false;
      if (v.validUntil && new Date(v.validUntil) < now) return false;

      // Check frequency
      if (v.frequency === 'always') return true;
      
      // For daily, weekly, monthly - just check if within date range
      return true;
    });
  };

  const getByProperty = (propertyId?: string) => {
    if (!propertyId) return preRegistered;
    return preRegistered.filter((v) => !v.propertyId || v.propertyId === propertyId);
  };

  return {
    preRegistered,
    addPreRegistration,
    updatePreRegistration,
    deletePreRegistration,
    toggleActive,
    checkPreRegistered,
    getByProperty,
  };
};
