import React, { useState, useEffect } from 'react';
import type { Work } from '../types';
import { worksApi } from '../services/api';
import { AlertOctagon, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface Props {
  isOpen: boolean;
  work: Work;
  onClose: () => void;
  onDeleted: () => void;
}

export const DeleteWorkModal: React.FC<Props> = ({ isOpen, work, onClose, onDeleted }) => {
  const [typedTitle, setTypedTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    setTypedTitle('');
    setError(null);
    setLoading(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmed = typedTitle.trim() === work.title.trim();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    setLoading(true);
    setError(null);

    try {
      await worksApi.delete(work.id);
      showToast(`Obra "${work.title}" excluída com sucesso.`, 'info');
      onDeleted();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir obra.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 520, width: '100%', padding: '24px 28px' }}>
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertOctagon size={22} color="#ef4444" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Excluir Obra Definitivamente
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 8, padding: '14px 16px', marginBottom: 18 }}>
          <p style={{ margin: '0 0 8px', color: '#fca5a5', fontWeight: 600, fontSize: '0.88rem' }}>
            Atenção: Esta ação é irreversível!
          </p>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.5 }}>
            Ao apagar esta obra, todos os seus <strong>formatos</strong>, histórico de <strong>diários de leitura</strong>, <strong>personagens</strong> e <strong>mapas/anexos de lore</strong> serão permanentemente apagados do banco de dados.
          </p>
        </div>

        <form onSubmit={handleDelete} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', color: '#94a3b8', marginBottom: 6 }}>
              Para confirmar, digite exatamente <strong style={{ color: '#f8fafc', background: '#1e293b', padding: '2px 6px', borderRadius: 4 }}>{work.title}</strong> abaixo:
            </label>
            <input
              type="text"
              autoFocus
              required
              className="input-text"
              style={{ width: '100%', borderColor: isConfirmed ? '#22c55e' : undefined }}
              placeholder={`Digite "${work.title}" para confirmar`}
              value={typedTitle}
              onChange={(e) => setTypedTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || loading}
              style={{
                padding: '8px 18px',
                borderRadius: 6,
                border: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: !isConfirmed || loading ? 'not-allowed' : 'pointer',
                background: isConfirmed ? '#dc2626' : '#450a0a',
                color: isConfirmed ? '#ffffff' : '#991b1b',
                opacity: isConfirmed ? 1 : 0.6,
                transition: 'all 0.15s ease',
              }}
            >
              {loading ? 'Excluindo...' : 'Excluir Definitivamente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
