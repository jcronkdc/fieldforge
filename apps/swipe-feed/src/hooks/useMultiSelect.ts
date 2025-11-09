/**
 * Hook for managing multiple selections that persist
 */

import { useState, useCallback } from 'react';

export function useMultiSelect<T>(initialValues: T[] = []) {
  const [selected, setSelected] = useState<Set<T>>(new Set(initialValues));

  const toggle = useCallback((value: T) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }, []);

  const add = useCallback((value: T) => {
    setSelected(prev => new Set(prev).add(value));
  }, []);

  const remove = useCallback((value: T) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.delete(value);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSelected(new Set());
  }, []);

  const has = useCallback((value: T) => {
    return selected.has(value);
  }, [selected]);

  return {
    selected: Array.from(selected),
    toggle,
    add,
    remove,
    clear,
    has,
    size: selected.size
  };
}
