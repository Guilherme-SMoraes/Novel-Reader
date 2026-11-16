import React, { useState } from 'react';
import type { CreateProgressRequest, ReadingStatus, WorkFormat } from '../types';
import { ReadingStatusLabels, WorkTypeLabels } from '../types';
import { progressApi } from '../services/api';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  workId: string;
  currentFormat: WorkFormat;
  lastChapter?: number;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateProgressModal: React.FC<Props> = ({
  isOpen,
  workId,
  currentFormat,
  lastChapter,
  onClose,
  onCreated,
}) => {
  const [chapter, setChapter] = useState<string>((lastChapter ? lastChapter + 1 : 1).toString());
  const [volume, setVolume] = useState<string>('');
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>(1); // Reading default
  const [description, setDescription] = useState('');
  const [chapterLink, setChapterLink] = useState('');
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
      if (chapterNum > currentFormat.totalChapter.chapter) {
        throw new Error(`Capítulo não pode ser maior que o total do formato (${currentFormat.totalChapter.chapter}).`);
      }

      const req: CreateProgressRequest = {
        workId,
        workType: currentFormat.workType,
        stoppedAtChapter: {
          volume: volume ? parseInt(volume, 10) : null,
          chapter: chapterNum,
        },
        readingStatus,
        readingDescription: description || null,
        chapterLink: chapterLink.trim() || null,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Registrar Progresso</h2>
            <span className="badge badge-novel" style={{ fontSize: '0.72rem' }}>
              {WorkTypeLabels[currentFormat.workType]}
            </span>
          </div>
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
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Capítulo Onde Parou * (Máx: {currentFormat.totalChapter.chapter})
              </label>
              <input
                type="number"
                min="1"
                max={currentFormat.totalChapter.chapter}
                required
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Volume (opcional)
              </label>
              <input
                type="number"
                min="1"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                style={{ width: '100%' }}
                placeholder="Ex: 2"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Status da Leitura
            </label>
            <select
              value={readingStatus}
              onChange={(e) => setReadingStatus(Number(e.target.value) as ReadingStatus)}
              style={{ width: '100%' }}
            >
              {Object.entries(ReadingStatusLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Link do Último Capítulo Lido (opcional)
            </label>
            <input
              type="url"
              className="input-text"
              value={chapterLink}
              onChange={(e) => setChapterLink(e.target.value)}
              placeholder="https://exemplo.com/capitulo-123"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Diário de Leitura / Reflexão (opcional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Neste capítulo o protagonista usou a habilidade X para derrotar o boss..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Progresso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
