import { useEffect, useRef } from 'react';

const escapeStack: Array<() => void> = [];

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && escapeStack.length > 0) {
      e.stopPropagation();
      const topHandler = escapeStack[escapeStack.length - 1];
      topHandler();
    }
  });
}

export function useEscapeKey(onClose: () => void, enabled = true) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!enabled) return;

    const handler = () => onCloseRef.current();
    escapeStack.push(handler);

    return () => {
      const idx = escapeStack.lastIndexOf(handler);
      if (idx !== -1) {
        escapeStack.splice(idx, 1);
      }
    };
  }, [enabled]);
}
