import { useState, useEffect } from 'react';
import { Visitor } from '@/types/visitor';

const STORAGE_KEY = 'visitor_log';

export const useVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setVisitors(JSON.parse(stored));
    }
  }, []);

  const saveToStorage = (updatedVisitors: Visitor[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVisitors));
    setVisitors(updatedVisitors);
  };

  const addVisitor = (visitor: Omit<Visitor, 'id' | 'checkInTime' | 'status'>) => {
    const newVisitor: Visitor = {
      ...visitor,
      id: crypto.randomUUID(),
      checkInTime: new Date().toISOString(),
      status: 'checked-in',
    };
    saveToStorage([newVisitor, ...visitors]);
    return newVisitor;
  };

  const checkOutVisitor = (id: string) => {
    const updated = visitors.map((v) =>
      v.id === id
        ? { ...v, status: 'checked-out' as const, checkOutTime: new Date().toISOString() }
        : v
    );
    saveToStorage(updated);
  };

  const deleteVisitor = (id: string) => {
    const updated = visitors.filter((v) => v.id !== id);
    saveToStorage(updated);
  };

  const searchVisitors = (query: string) => {
    if (!query.trim()) return visitors;
    const lower = query.toLowerCase();
    return visitors.filter(
      (v) =>
        v.name.toLowerCase().includes(lower) ||
        v.phone.includes(query) ||
        v.host.toLowerCase().includes(lower) ||
        v.company?.toLowerCase().includes(lower)
    );
  };

  return {
    visitors,
    addVisitor,
    checkOutVisitor,
    deleteVisitor,
    searchVisitors,
  };
};
