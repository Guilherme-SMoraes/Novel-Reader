import React, { useState } from 'react';
import type { CreateWorkRequest, Language, WorkType } from '../types';
import { LanguageLabels, WorkTypeLabels } from '../types';
import { worksApi } from '../services/api';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateWorkModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workType, setWorkType] = useState<WorkType>(2); // Web Novel default
  const [originalLanguage, setOriginalLanguage] = useState<Language>(3); // Coreano default
  const [aggregatorLink, setAggregatorLink] = useState('');
  const [linkWhereToRead, setLinkWhereToRead] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [volume, setVolume] = useState<string>('');
  const [chapter, setChapter] = useState<string>('1');
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
        throw new Error('Capítulo total deve ser maior que zero.');
      }

      const req: CreateWorkRequest = {
        title,
        description: description || null,
        workType,
        originalLanguage,
        aggregatorLink,
        linkWhereToRead: linkWhereToRead || null,
        coverImageUrl: coverImageUrl || null,
        totalChapter: {
          volume: volume ? parseInt(volume, 10) : null,
          chapter: chapterNum,
        },
      };

      await worksApi.create(req);
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar obra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Cadastrar Nova Obra</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px 12px', borderRadius: 6, marginBottom: 14, fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Título *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%' }} placeholder="Ex: Overgeared" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tipo de Obra</label>
              <select value={workType} onChange={(e) => setWorkType(Number(e.target.value) as WorkType)} style={{ width: '100%' }}>
                {Object.entries(WorkTypeLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Idioma Original</label>
              <select value={originalLanguage} onChange={(e) => setOriginalLanguage(Number(e.target.value) as Language)} style={{ width: '100%' }}>
                {Object.entries(LanguageLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Volume Total (opcional)</label>
              <input type="number" min="1" value={volume} onChange={(e) => setVolume(e.target.value)} style={{ width: '100%' }} placeholder="Ex: 1" />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Capítulo Total *</label>
              <input type="number" min="1" required value={chapter} onChange={(e) => setChapter(e.target.value)} style={{ width: '100%' }} placeholder="Ex: 2059" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Link do Agregador *</label>
            <input required type="url" value={aggregatorLink} onChange={(e) => setAggregatorLink(e.target.value)} style={{ width: '100%' }} placeholder="https://novelupdates.com/..." />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Link de Leitura (opcional)</label>
            <input type="url" value={linkWhereToRead} onChange={(e) => setLinkWhereToRead(e.target.value)} style={{ width: '100%' }} placeholder="https://wuxiaworld.com/..." />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>URL da Foto de Capa (opcional)</label>
            <input type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} style={{ width: '100%' }} placeholder="https://..." />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Sinopse / Descrição</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', resize: 'vertical' }} placeholder="Breve resumo da obra..." />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Salvando...' : 'Cadastrar Obra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
