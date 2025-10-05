import { useEffect } from 'react';

type MaybeRef<T extends Node> = { current: T | null } | null | undefined;

export type UseClickOutsideOptions = {
  enabled?: boolean;
  include?: MaybeRef<Node>[];
  escapeCloses?: boolean;
  eventType?: 'mousedown' | 'mouseup' | 'click' | 'pointerdown';
};

/**
 * Reusable handler to close popovers/menus when clicking outside or pressing Escape.
 * - Pass the primary container ref via `include` along with any trigger/button refs.
 */
export function useClickOutside(
  onClose: () => void,
  options: UseClickOutsideOptions
) {
  const {
    enabled = true,
    include = [],
    escapeCloses = true,
    eventType = 'mousedown',
  } = options || {};

  useEffect(() => {
    if (!enabled) return;

    const handlePointer = (event: Event) => {
      const target = event.target as Node | null;
      if (!target) return;
      // If click is inside any included ref, ignore
      for (const maybeRef of include) {
        const el = (maybeRef as any)?.current as Node | null | undefined;
        if (el && el.contains(target)) return;
      }
      onClose();
    };

    const handleKey = (event: KeyboardEvent) => {
      if (!escapeCloses) return;
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener(eventType, handlePointer);
    if (escapeCloses) document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener(eventType, handlePointer);
      if (escapeCloses) document.removeEventListener('keydown', handleKey);
    };
  }, [enabled, include, escapeCloses, eventType, onClose]);
}


