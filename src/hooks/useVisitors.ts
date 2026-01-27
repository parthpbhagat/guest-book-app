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
      status: 'pending',
    };
    saveToStorage([newVisitor, ...visitors]);
    return newVisitor;
  };

  const approveVisitor = (id: string, approvedBy: string) => {
    const updated = visitors.map((v) =>
      v.id === id
        ? { 
            ...v, 
            status: 'checked-in' as const, 
            approvedAt: new Date().toISOString(),
            approvedBy 
          }
        : v
    );
    saveToStorage(updated);
  };

  const rejectVisitor = (id: string, rejectedBy: string) => {
    const updated = visitors.map((v) =>
      v.id === id
        ? { 
            ...v, 
            status: 'rejected' as const, 
            approvedAt: new Date().toISOString(),
            approvedBy: rejectedBy 
          }
        : v
    );
    saveToStorage(updated);
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

  const filterByDate = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate && !endDate) return visitors;
    
    return visitors.filter((v) => {
      const checkIn = new Date(v.checkInTime);
      if (startDate && endDate) {
        return checkIn >= startDate && checkIn <= endDate;
      }
      if (startDate) {
        return checkIn >= startDate;
      }
      if (endDate) {
        return checkIn <= endDate;
      }
      return true;
    });
  };

  const getPendingVisitors = () => visitors.filter((v) => v.status === 'pending');

  return {
    visitors,
    addVisitor,
    approveVisitor,
    rejectVisitor,
    checkOutVisitor,
    deleteVisitor,
    searchVisitors,
    filterByDate,
    getPendingVisitors,
  };
};
