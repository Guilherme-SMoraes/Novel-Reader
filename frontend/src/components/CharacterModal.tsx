import React, { useState, useEffect } from 'react';
import type { Character, CharacterType, CreateCharacterRequest, UpdateCharacterRequest } from '../types';
import { CharacterTypeLabels } from '../types';
import { charactersApi } from '../services/api';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  workId: string;
  characterToEdit?: Character | null;
  onClose: () => void;
  onSaved: () => void;
}

export const CharacterModal: React.FC<Props> = ({
  isOpen,
  workId,
  characterToEdit,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [characterType, setCharacterType] = useState<CharacterType>(1); // Protagonist default
  const [chapter, setChapter] = useState('1');
  const [volume, setVolume] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (characterToEdit) {
      setName(characterToEdit.name);
      setCharacterType(characterToEdit.characterType);
      setImageUrl(characterToEdit.imageUrl || '');
      setDescription(characterToEdit.description || '');
      setChapter(characterToEdit.firstAppearance.chapter.toString());
      setVolume(characterToEdit.firstAppearance.volume ? characterToEdit.firstAppearance.volume.toString() : '');
    } else {
      setName('');
      setCharacterType(1);
      setImageUrl('');
      setDescription('');
      setChapter('1');
      setVolume('');
    }
    setError(null);
  }, [characterToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (characterToEdit) {
        const req: UpdateCharacterRequest = {
          name: name.trim(),
          characterType,
          imageUrl: imageUrl.trim() || null,
          description: description.trim() || null,
        };
        await charactersApi.update(workId, characterToEdit.id, req);
      } else {
        const chapterNum = parseInt(chapter, 10);
        if (isNaN(chapterNum) || chapterNum <= 0) {
          throw new Error('Capítulo de aparição deve ser maior que zero.');
        }

        const req: CreateCharacterRequest = {
          workId,
          name: name.trim(),
          characterType,
          imageUrl: imageUrl.trim() || null,
          description: description.trim() || null,
          firstAppearance: {
            volume: volume ? parseInt(volume, 10) : null,
            chapter: chapterNum,
          },
        };
        await charactersApi.create(req);
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar personagem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {characterToEdit ? 'Editar Personagem' : 'Cadastrar Personagem'}
          </h2>
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
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Nome do Personagem *
            </label>
            <input
              required
              className="input-text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sung Jin-Woo"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Papel na História *
            </label>
            <select
              className="input-text"
              value={characterType}
              onChange={(e) => setCharacterType(Number(e.target.value) as CharacterType)}
            >
              {Object.entries(CharacterTypeLabels).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              URL da Foto / Avatar (opcional)
            </label>
            <input
              type="url"
              className="input-text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/avatar.jpg"
            />
          </div>

          {!characterToEdit && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Capítulo da 1ª Aparição *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  className="input-text"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Volume da 1ª Aparição
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-text"
                  placeholder="Opcional"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Descrição / Anotações
            </label>
            <textarea
              className="input-text"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Habilidades, características, personalidade..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : characterToEdit ? 'Salvar Alterações' : 'Cadastrar Personagem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
