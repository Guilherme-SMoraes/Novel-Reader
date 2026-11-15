import React, { useState } from 'react';
import type { CreateProgressRequest, ReadingStatus } from '../types';
import { ReadingStatusLabels } from '../types';
import { progressApi } from '../services/api';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  workId: string;
  lastChapter?: number;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateProgressModal: React.FC<Props> = ({
  isOpen,
  workId,
  lastChapter,
  onClose,
  onCreated,
}) => {
  const [chapter, setChapter] = useState<string>((lastChapter ? lastChapter + 1 : 1).toString());
  const [volume, setVolume] = useState<string>('');
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>(1); // Reading default
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const chapterNum = parseInt(chapter, 10);
      if (isNaN(chapterNum) || chapterNum <= 0) {
        throw new Error('Capítulo deve ser maior que zero.');
      }

      const req: CreateProgressRequest = {
        workId,
        stoppedAtChapter: {
          volume: volume ? parseInt(volume, 10) : null,
          chapter: chapterNum,
        },
        readingStatus,
        readingDescription: description || null,
      };

      await progressApi.create(req);
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar progresso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Registrar Progresso de Leitura</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px 12px', borderRadius: 6, marginBottom: 14, fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Capítulo Onde Parou *</label>
              <input type="number" min="1" required value={chapter} onChange={(e) => setChapter(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Volume (opcional)</label>
              <input type="number" min="1" value={volume} onChange={(e) => setVolume(e.target.value)} style={{ width: '100%' }} placeholder="Ex: 2" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Status da Leitura</label>
            <select value={readingStatus} onChange={(e) => setReadingStatus(Number(e.target.value) as ReadingStatus)} style={{ width: '100%' }}>
              {Object.entries(ReadingStatusLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Diário de Leitura & Reflexões (sem limite de tamanho)
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', resize: 'vertical', lineHeight: '1.5' }}
              placeholder="Escreva seus pensamentos sobre o que está acontecendo na história, impressões do arco, acontecimentos marcantes..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Salvando...' : 'Salvar Progresso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
