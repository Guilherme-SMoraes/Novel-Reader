import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<Props> = ({ imageUrl, title, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 24,
        cursor: 'zoom-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '92vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: -40,
            right: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid #334155',
            color: '#f8fafc',
            cursor: 'pointer',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s ease',
          }}
          title="Fechar visualização (Esc)"
        >
          <X size={20} />
        </button>
        <img
          src={imageUrl}
          alt={title || 'Visualização ampliada'}
          style={{
            maxWidth: '92vw',
            maxHeight: '85vh',
            borderRadius: 8,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
            objectFit: 'contain',
            cursor: 'default',
          }}
        />
        {title && (
          <div
            style={{
              marginTop: 10,
              color: '#cbd5e1',
              fontSize: '0.88rem',
              fontWeight: 600,
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {title}
          </div>
        )}
      </div>
    </div>
  );
};
