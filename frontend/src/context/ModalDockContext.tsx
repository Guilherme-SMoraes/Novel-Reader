import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { User, Map, BookMarked, BookOpen, Maximize2, X } from 'lucide-react';

export type ModalType = 'character' | 'attachment' | 'progress' | 'work';

export interface MinimizedModalItem {
  id: string;
  title: string;
  type: ModalType;
  onRestore: () => void;
  onClose: () => void;
}

interface ModalDockContextValue {
  minimizedModals: MinimizedModalItem[];
  minimizeModal: (item: MinimizedModalItem) => void;
  restoreModal: (id: string) => void;
  closeModal: (id: string) => void;
  updateModalTitle: (id: string, title: string) => void;
  isModalMinimized: (id: string) => boolean;
}

const ModalDockContext = createContext<ModalDockContextValue | undefined>(undefined);

export const ModalDockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [minimizedModals, setMinimizedModals] = useState<MinimizedModalItem[]>([]);

  const minimizeModal = useCallback((item: MinimizedModalItem) => {
    setMinimizedModals((prev) => {
      const filtered = prev.filter((m) => m.id !== item.id);
      return [...filtered, item];
    });
  }, []);

  const restoreModal = useCallback((id: string) => {
    setMinimizedModals((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item) {
        item.onRestore();
      }
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const closeModal = useCallback((id: string) => {
    setMinimizedModals((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item) {
        item.onClose();
      }
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const updateModalTitle = useCallback((id: string, title: string) => {
    setMinimizedModals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, title } : m))
    );
  }, []);

  const isModalMinimized = useCallback(
    (id: string) => minimizedModals.some((m) => m.id === id),
    [minimizedModals]
  );

  const getTypeIcon = (type: ModalType) => {
    switch (type) {
      case 'character':
        return <User size={14} color="#60a5fa" />;
      case 'attachment':
        return <Map size={14} color="#34d399" />;
      case 'progress':
        return <BookMarked size={14} color="#c084fc" />;
      case 'work':
        return <BookOpen size={14} color="#f59e0b" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: ModalType) => {
    switch (type) {
      case 'character':
        return 'Personagem';
      case 'attachment':
        return 'Anexo';
      case 'progress':
        return 'Progresso';
      case 'work':
        return 'Obra';
    }
  };

  const contextValue = useMemo(
    () => ({
      minimizedModals,
      minimizeModal,
      restoreModal,
      closeModal,
      updateModalTitle,
      isModalMinimized,
    }),
    [minimizedModals, minimizeModal, restoreModal, closeModal, updateModalTitle, isModalMinimized]
  );

  return (
    <ModalDockContext.Provider value={contextValue}>
      {children}

      {minimizedModals.length > 0 && (
        <aside
          aria-label="Itens minimizados"
          style={{
            position: 'fixed',
            bottom: 'max(14px, env(safe-area-inset-bottom, 14px))',
            right: 'max(14px, env(safe-area-inset-right, 14px))',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap-reverse',
            justifyContent: 'flex-end',
            gap: 10,
            maxWidth: 'calc(100vw - 28px)',
            pointerEvents: 'none',
          }}
        >
          {minimizedModals.map((m) => (
            <div
              key={m.id}
              style={{
                pointerEvents: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#131b2e',
                border: '1px solid #3b82f6',
                borderRadius: 8,
                padding: '8px 12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6), 0 0 10px rgba(59, 130, 246, 0.2)',
                color: '#f8fafc',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
                userSelect: 'none',
              }}
              onClick={() => restoreModal(m.id)}
              title="Clique para restaurar este item"
            >
              {getTypeIcon(m.type)}
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                  {getTypeLabel(m.type)}
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    maxWidth: 160,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {m.title || 'Sem título'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
                <button
                  type="button"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: 'none',
                    borderRadius: 4,
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    restoreModal(m.id);
                  }}
                  title="Restaurar"
                >
                  <Maximize2 size={13} />
                </button>
                <button
                  type="button"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: 'none',
                    borderRadius: 4,
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeModal(m.id);
                  }}
                  title="Fechar e descartar rascunho"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
        </aside>
      )}
    </ModalDockContext.Provider>
  );
};

export const useModalDock = () => {
  const context = useContext(ModalDockContext);
  if (!context) {
    throw new Error('useModalDock must be used within a ModalDockProvider');
  }
  return context;
};
