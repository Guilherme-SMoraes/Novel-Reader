import React, { useState, useEffect } from 'react';
import type {
  Character,
  CharacterAppearance,
  CharacterType,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  WorkFormat,
} from '../types';
import { CharacterTypeLabels, WorkTypeLabels } from '../types';
import { charactersApi } from '../services/api';
import { X, Plus } from 'lucide-react';
import { ImageInput } from './ImageInput';

interface Props {
  isOpen: boolean;
  workId: string;
  formats: WorkFormat[];
  characterToEdit?: Character | null;
  onClose: () => void;
  onSaved: () => void;
}

export const CharacterModal: React.FC<Props> = ({
  isOpen,
  workId,
  formats,
  characterToEdit,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [characterType, setCharacterType] = useState<CharacterType>(1); // Protagonist default
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [alternativeNames, setAlternativeNames] = useState<string[]>([]);
  const [altNameInput, setAltNameInput] = useState('');
  const [appearances, setAppearances] = useState<Record<number, { chapter: string; volume: string }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available formats: either from the work or fallback to WebNovel
  const availableFormats = formats && formats.length > 0 ? formats : [{ workType: 2, totalChapter: { volume: null, chapter: 100 } } as WorkFormat];

  useEffect(() => {
    if (characterToEdit) {
      setName(characterToEdit.name);
      setCharacterType(characterToEdit.characterType);
      setImageUrl(characterToEdit.imageUrl || '');
      setDescription(characterToEdit.description || '');
      setAlternativeNames(characterToEdit.alternativeNames || []);

      const map: Record<number, { chapter: string; volume: string }> = {};
      characterToEdit.firstAppearances?.forEach((app) => {
        map[app.workType] = {
          chapter: app.chapter.chapter.toString(),
          volume: app.chapter.volume ? app.chapter.volume.toString() : '',
        };
      });
      setAppearances(map);
    } else {
      setName('');
      setCharacterType(1);
      setImageUrl('');
      setDescription('');
      setAlternativeNames([]);

      const map: Record<number, { chapter: string; volume: string }> = {};
      if (availableFormats.length > 0) {
        map[availableFormats[0].workType] = { chapter: '1', volume: '' };
      }
      setAppearances(map);
    }
    setAltNameInput('');
    setError(null);
  }, [characterToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddAltName = () => {
    const trimmed = altNameInput.trim();
    if (trimmed && !alternativeNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setAlternativeNames([...alternativeNames, trimmed]);
      setAltNameInput('');
    }
  };

  const handleRemoveAltName = (indexToRemove: number) => {
    setAlternativeNames(alternativeNames.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAltKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddAltName();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const validAppearances: CharacterAppearance[] = [];
      Object.entries(appearances).forEach(([workTypeStr, val]) => {
        const chNum = parseInt(val.chapter, 10);
        if (!isNaN(chNum) && chNum > 0) {
          validAppearances.push({
            workType: Number(workTypeStr) as any,
            chapter: {
              volume: val.volume ? parseInt(val.volume, 10) : null,
              chapter: chNum,
            },
          });
        }
      });

      if (validAppearances.length === 0) {
        throw new Error('Preencha a primeira aparição em pelo menos um formato.');
      }

      if (characterToEdit) {
        const req: UpdateCharacterRequest = {
          name: name.trim(),
          characterType,
          imageUrl: imageUrl.trim() || null,
          description: description.trim() || null,
          firstAppearances: validAppearances,
          alternativeNames,
        };
        await charactersApi.update(workId, characterToEdit.id, req);
      } else {
        const req: CreateCharacterRequest = {
          workId,
          name: name.trim(),
          characterType,
          imageUrl: imageUrl.trim() || null,
          description: description.trim() || null,
          firstAppearances: validAppearances,
          alternativeNames,
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
      <div className="modal-content" style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
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
              placeholder="Ex: Sung Jin-Woo, Sunny"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Outros Nomes / Apelidos / Títulos (opcional)
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                className="input-text"
                value={altNameInput}
                onChange={(e) => setAltNameInput(e.target.value)}
                onKeyDown={handleAltKeyDown}
                placeholder="Ex: Sunless, Mongrel, Lord Shadow (pressione Enter ou clique em +)"
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddAltName}
                style={{ whiteSpace: 'nowrap', padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={14} /> Adicionar
              </button>
            </div>
            {alternativeNames.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {alternativeNames.map((altName, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#1e293b',
                      border: '1px solid #334155',
                      color: '#38bdf8',
                      fontSize: '0.78rem',
                      padding: '2px 8px',
                      borderRadius: 14,
                    }}
                  >
                    {altName}
                    <button
                      type="button"
                      onClick={() => handleRemoveAltName(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '0 2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Remover nome"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
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

          <ImageInput
            label="Foto / Avatar do Personagem (opcional)"
            value={imageUrl}
            onChange={setImageUrl}
            placeholder="https://exemplo.com/avatar.jpg ou envie um arquivo"
            disabled={loading}
          />

          {/* Primeira Aparição por Formato */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Primeira Aparição por Formato *
              </label>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Preencha pelo menos um formato
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#0b1120', padding: 12, borderRadius: 8, border: '1px solid #334155' }}>
              {availableFormats.map((f) => {
                const current = appearances[f.workType] || { chapter: '', volume: '' };
                return (
                  <div key={f.workType} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr', gap: 10, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge badge-tag" style={{ fontSize: '0.74rem', width: '100%', textAlign: 'center' }}>
                        {WorkTypeLabels[f.workType]}
                      </span>
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        placeholder="Capítulo"
                        className="input-text"
                        value={current.chapter}
                        onChange={(e) =>
                          setAppearances({
                            ...appearances,
                            [f.workType]: { ...current, chapter: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        placeholder="Volume (opcional)"
                        className="input-text"
                        value={current.volume}
                        onChange={(e) =>
                          setAppearances({
                            ...appearances,
                            [f.workType]: { ...current, volume: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Descrição / Biografia (opcional)
            </label>
            <textarea
              rows={3}
              className="input-text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Aparência, histórico, papel na trama..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Salvando...' : characterToEdit ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
