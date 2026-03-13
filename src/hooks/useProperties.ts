import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/visitor';

const ACTIVE_PROPERTY_KEY = 'active_property';

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(
    localStorage.getItem(ACTIVE_PROPERTY_KEY)
  );
  const [loading, setLoading] = useState(true);

  const fetchProperties = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching properties:', error);
      return;
    }

    const mapped: Property[] = (data || []).map(p => ({
      id: p.id,
      name: p.name,
      address: p.address,
      type: p.type as Property['type'],
    }));

    setProperties(mapped);

    // Set first property as active if none is set
    if (mapped.length > 0 && (!activePropertyId || !mapped.find(p => p.id === activePropertyId))) {
      setActivePropertyId(mapped[0].id);
      localStorage.setItem(ACTIVE_PROPERTY_KEY, mapped[0].id);
    }
    setLoading(false);
  }, [activePropertyId]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const addProperty = async (property: Omit<Property, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('properties')
      .insert({
        name: property.name,
        address: property.address,
        type: property.type,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding property:', error);
      return;
    }

    const newProp: Property = { id: data.id, name: data.name, address: data.address, type: data.type as Property['type'] };
    const updated = [...properties, newProp];
    setProperties(updated);

    if (updated.length === 1) {
      setActivePropertyId(newProp.id);
      localStorage.setItem(ACTIVE_PROPERTY_KEY, newProp.id);
    }
    return newProp;
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    const { error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating property:', error);
      return;
    }
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting property:', error);
      return;
    }
    const updated = properties.filter(p => p.id !== id);
    setProperties(updated);

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

  const getActiveProperty = () => properties.find(p => p.id === activePropertyId) || null;

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
