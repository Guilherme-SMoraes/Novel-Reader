import React, { useState } from 'react';
import type { CharacterType, CreateCharacterRequest } from '../types';
import { CharacterTypeLabels } from '../types';
import { charactersApi } from '../services/api';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  workId: string;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateCharacterModal: React.FC<Props> = ({ isOpen, workId, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [characterType, setCharacterType] = useState<CharacterType>(1); // Protagonist default
  const [chapter, setChapter] = useState('1');
  const [volume, setVolume] = useState('');
  const [imageUrl, setImageUrl] = useState('');
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
        throw new Error('Capítulo de aparição deve ser maior que zero.');
      }

      const req: CreateCharacterRequest = {
        workId,
        name,
        characterType,
        imageUrl: imageUrl || null,
        description: description || null,
        firstAppearance: {
          volume: volume ? parseInt(volume, 10) : null,
          chapter: chapterNum,
        },
      };

      await charactersApi.create(req);
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar personagem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Cadastrar Personagem</h2>
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
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Nome do Personagem *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} placeholder="Ex: Greed (Shin Youngwoo)" />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Papel na História</label>
            <select value={characterType} onChange={(e) => setCharacterType(Number(e.target.value) as CharacterType)} style={{ width: '100%' }}>
              {Object.entries(CharacterTypeLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>1ª Aparição (Capítulo) *</label>
              <input type="number" min="1" required value={chapter} onChange={(e) => setChapter(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Volume (opcional)</label>
              <input type="number" min="1" value={volume} onChange={(e) => setVolume(e.target.value)} style={{ width: '100%' }} placeholder="Ex: 1" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>URL da Foto do Personagem (opcional)</label>
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={{ width: '100%' }} placeholder="https://..." />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Descrição / Detalhes</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', resize: 'vertical' }} placeholder="Traços marcantes, habilidades, facção..." />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Salvando...' : 'Cadastrar Personagem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
