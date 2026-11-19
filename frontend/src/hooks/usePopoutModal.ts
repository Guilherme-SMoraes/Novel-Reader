import { useState, useEffect, useCallback, useRef } from 'react';

interface PopoutOptions {
  title?: string;
  width?: number;
  height?: number;
}

interface UsePopoutModalReturn {
  isSupported: boolean;
  isPoppedOut: boolean;
  popoutContainer: HTMLElement | null;
  openPopout: (options?: PopoutOptions) => Promise<boolean>;
  closePopout: () => void;
}

export function usePopoutModal(defaultTitle = 'Novel Reader'): UsePopoutModalReturn {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isPoppedOut, setIsPoppedOut] = useState<boolean>(false);
  const [popoutContainer, setPopoutContainer] = useState<HTMLElement | null>(null);
  const popoutWindowRef = useRef<Window | null>(null);

  useEffect(() => {
    const checkSupport = () => {
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
      const hasPiP = typeof window !== 'undefined' && 'documentPictureInPicture' in window;
      const hasWindowOpen = typeof window !== 'undefined' && typeof window.open === 'function';
      setIsSupported(isDesktop && (hasPiP || hasWindowOpen));
    };

    checkSupport();
    window.addEventListener('resize', checkSupport);
    return () => window.removeEventListener('resize', checkSupport);
  }, []);

  const copyStylesToWindow = useCallback((targetDoc: Document) => {
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        if (sheet.cssRules) {
          const rules = Array.from(sheet.cssRules)
            .map((r) => r.cssText)
            .join('\n');
          const style = targetDoc.createElement('style');
          style.textContent = rules;
          targetDoc.head.appendChild(style);
        } else if (sheet.href) {
          const link = targetDoc.createElement('link');
          link.rel = 'stylesheet';
          link.href = sheet.href;
          targetDoc.head.appendChild(link);
        }
      } catch (err: unknown) {
        if (sheet.href) {
          const link = targetDoc.createElement('link');
          link.rel = 'stylesheet';
          link.href = sheet.href;
          targetDoc.head.appendChild(link);
        }
      }
    });

    const existingStyles = document.querySelectorAll('style');
    existingStyles.forEach((styleTag) => {
      if (styleTag.textContent) {
        const cloned = targetDoc.createElement('style');
        cloned.textContent = styleTag.textContent;
        targetDoc.head.appendChild(cloned);
      }
    });

    targetDoc.documentElement.className = document.documentElement.className;
    targetDoc.body.style.margin = '0';
    targetDoc.body.style.padding = '0';
    targetDoc.body.style.backgroundColor = '#0b1120';
    targetDoc.body.style.color = '#f8fafc';
    targetDoc.body.style.fontFamily = window.getComputedStyle(document.body).fontFamily;
    targetDoc.body.style.height = '100vh';
    targetDoc.body.style.overflow = 'hidden';
  }, []);

  const handleWindowClose = useCallback(() => {
    setIsPoppedOut(false);
    setPopoutContainer(null);
    popoutWindowRef.current = null;
  }, []);

  const closePopout = useCallback(() => {
    if (popoutWindowRef.current && !popoutWindowRef.current.closed) {
      popoutWindowRef.current.close();
    }
    handleWindowClose();
  }, [handleWindowClose]);

  const openPopout = useCallback(
    async (options?: PopoutOptions): Promise<boolean> => {
      const width = options?.width || 560;
      const height = options?.height || 720;
      const title = options?.title || defaultTitle;

      try {
        let win: Window | null = null;
        const nav = window as unknown as {
          documentPictureInPicture?: {
            requestWindow: (options: { width: number; height: number }) => Promise<Window>;
          };
        };

        if (nav.documentPictureInPicture?.requestWindow) {
          win = await nav.documentPictureInPicture.requestWindow({ width, height });
        } else {
          const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
          const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
          win = window.open(
            '',
            '_blank',
            `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes`
          );
        }

        if (!win) {
          return false;
        }

        win.document.title = title;
        copyStylesToWindow(win.document);

        win.addEventListener('pagehide', handleWindowClose);
        win.addEventListener('beforeunload', handleWindowClose);

        popoutWindowRef.current = win;
        setPopoutContainer(win.document.body);
        setIsPoppedOut(true);
        return true;
      } catch (err: unknown) {
        console.error('Failed to open popout window:', err);
        return false;
      }
    },
    [defaultTitle, copyStylesToWindow, handleWindowClose]
  );

  useEffect(() => {
    return () => {
      if (popoutWindowRef.current && !popoutWindowRef.current.closed) {
        popoutWindowRef.current.close();
      }
    };
  }, []);

  return {
    isSupported,
    isPoppedOut,
    popoutContainer,
    openPopout,
    closePopout,
  };
}
