import { useState, useEffect } from 'react';

interface ScheduledVisit {
  id: string;
  propertyId?: string;
  host_id: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_company?: string;
  purpose: string;
  scheduled_date: string;
  scheduled_time?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

const STORAGE_KEY = 'scheduled_visits';

export const useScheduledVisits = () => {
  const [visits, setVisits] = useState<ScheduledVisit[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setVisits(JSON.parse(stored));
    }
  }, []);

  const saveToStorage = (updated: ScheduledVisit[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setVisits(updated);
  };

  const addVisit = (visit: Omit<ScheduledVisit, 'id' | 'status'>) => {
    const newVisit: ScheduledVisit = {
      ...visit,
      id: crypto.randomUUID(),
      status: 'pending',
    };
    saveToStorage([newVisit, ...visits]);
    return newVisit;
  };

  const updateStatus = (id: string, status: ScheduledVisit['status']) => {
    saveToStorage(
      visits.map((v) =>
        v.id === id ? { ...v, status } : v
      )
    );
  };

  const deleteVisit = (id: string) => {
    saveToStorage(visits.filter((v) => v.id !== id));
  };

  const getUpcomingVisits = (propertyId?: string) => {
    const today = new Date().toISOString().split('T')[0];
    return visits.filter(
      (v) =>
        v.scheduled_date >= today &&
        (v.status === 'pending' || v.status === 'confirmed') &&
        (!propertyId || !v.propertyId || v.propertyId === propertyId)
    );
  };

  const checkScheduledVisitor = (phone: string, hostId: string, propertyId?: string): ScheduledVisit | undefined => {
    const today = new Date().toISOString().split('T')[0];
    return visits.find(
      (v) =>
        v.visitor_phone === phone &&
        v.host_id === hostId &&
        v.scheduled_date === today &&
        (v.status === 'pending' || v.status === 'confirmed') &&
        (!propertyId || !v.propertyId || v.propertyId === propertyId)
    );
  };

  return {
    visits,
    addVisit,
    updateStatus,
    deleteVisit,
    getUpcomingVisits,
    checkScheduledVisitor,
  };
};
