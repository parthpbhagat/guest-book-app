import { useState, useEffect } from 'react';
import { Property } from '@/types/visitor';

const STORAGE_KEY = 'properties';
const ACTIVE_PROPERTY_KEY = 'active_property';

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const activeId = localStorage.getItem(ACTIVE_PROPERTY_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      setProperties(parsed);
      // Set first property as active if none is set
      if (activeId && parsed.find((p: Property) => p.id === activeId)) {
        setActivePropertyId(activeId);
      } else if (parsed.length > 0) {
        setActivePropertyId(parsed[0].id);
        localStorage.setItem(ACTIVE_PROPERTY_KEY, parsed[0].id);
      }
    }
  }, []);

  const saveToStorage = (updatedProperties: Property[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProperties));
    setProperties(updatedProperties);
  };

  const addProperty = (property: Omit<Property, 'id'>) => {
    const newProperty: Property = {
      ...property,
      id: crypto.randomUUID(),
    };
    const updated = [...properties, newProperty];
    saveToStorage(updated);
    
    // Set as active if it's the first property
    if (updated.length === 1) {
      setActivePropertyId(newProperty.id);
      localStorage.setItem(ACTIVE_PROPERTY_KEY, newProperty.id);
    }
    
    return newProperty;
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    const updated = properties.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    saveToStorage(updated);
  };

  const deleteProperty = (id: string) => {
    const updated = properties.filter((p) => p.id !== id);
    saveToStorage(updated);
    
    // If deleted property was active, set another one
    if (activePropertyId === id && updated.length > 0) {
      setActivePropertyId(updated[0].id);
      localStorage.setItem(ACTIVE_PROPERTY_KEY, updated[0].id);
    } else if (updated.length === 0) {
      setActivePropertyId(null);
      localStorage.removeItem(ACTIVE_PROPERTY_KEY);
    }
  };

  const setActiveProperty = (id: string) => {
    setActivePropertyId(id);
    localStorage.setItem(ACTIVE_PROPERTY_KEY, id);
  };

  const getActiveProperty = () => {
    return properties.find((p) => p.id === activePropertyId) || null;
  };

  return {
    properties,
    activePropertyId,
    activeProperty: getActiveProperty(),
    addProperty,
    updateProperty,
    deleteProperty,
    setActiveProperty,
  };
};
