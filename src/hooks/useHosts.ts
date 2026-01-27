import { useState, useEffect } from 'react';
import { Host } from '@/types/visitor';

const STORAGE_KEY = 'hosts_list';

const defaultHosts: Host[] = [
  { id: '1', name: 'Mr. Sharma', phone: '9876543210', flatNumber: 'A-101' },
  { id: '2', name: 'Mrs. Patel', phone: '9876543211', flatNumber: 'A-102' },
  { id: '3', name: 'Mr. Singh', phone: '9876543212', flatNumber: 'B-201' },
  { id: '4', name: 'Mrs. Gupta', phone: '9876543213', flatNumber: 'B-202' },
  { id: '5', name: 'Mr. Kumar', phone: '9876543214', flatNumber: 'C-301' },
];

export const useHosts = () => {
  const [hosts, setHosts] = useState<Host[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setHosts(JSON.parse(stored));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultHosts));
      setHosts(defaultHosts);
    }
  }, []);

  const saveToStorage = (updatedHosts: Host[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHosts));
    setHosts(updatedHosts);
  };

  const addHost = (host: Omit<Host, 'id'>) => {
    const newHost: Host = {
      ...host,
      id: crypto.randomUUID(),
    };
    saveToStorage([...hosts, newHost]);
    return newHost;
  };

  const updateHost = (id: string, updates: Partial<Host>) => {
    const updated = hosts.map((h) => (h.id === id ? { ...h, ...updates } : h));
    saveToStorage(updated);
  };

  const deleteHost = (id: string) => {
    const updated = hosts.filter((h) => h.id !== id);
    saveToStorage(updated);
  };

  return { hosts, addHost, updateHost, deleteHost };
};
