import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
import { useModalDock } from '../context/ModalDockContext';
import { usePopoutModal } from '../hooks/usePopoutModal';
import { useEscapeKey } from '../hooks/useEscapeKey';
import {
  X,
  Minus,
  Plus,
  Bold,
  Italic,
  Heading3,
  List,
  Table as TableIcon,
  Quote,
  Code,
  Eye,
  Edit3,
  Shield,
  ExternalLink,
  ArrowDownLeft,
} from 'lucide-react';
import { ImageInput } from './ImageInput';
import { MarkdownViewer } from './MarkdownViewer';
import { getUnitLabel, isWatchable } from '../utils/formatLabels';

interface Props {
  sessionId?: string;
  isOpen: boolean;
  workId: string;
  formats: WorkFormat[];
  characterToEdit?: Character | null;
  existingAffiliations?: string[];
  onClose: (tagsModified?: boolean) => void;
  onSaved: (character: Character) => void;
}

export const CharacterModal: React.FC<Props> = ({
  sessionId,
  isOpen,
  workId,
  formats,
  characterToEdit,
  existingAffiliations = [],
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [characterType, setCharacterType] = useState<CharacterType>(1); // Protagonist default
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [alternativeNames, setAlternativeNames] = useState<string[]>([]);
  const [altNameInput, setAltNameInput] = useState('');
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [affiliationInput, setAffiliationInput] = useState('');
  const [showAffiliationSuggestions, setShowAffiliationSuggestions] = useState(false);
  const [appearances, setAppearances] = useState<Record<number, { chapter: string; volume: string }>>({});
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasModifiedTags, setHasModifiedTags] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { minimizeModal, closeModal, updateModalTitle } = useModalDock();
  const effectiveSessionId = sessionId || (characterToEdit ? `char-edit-${characterToEdit.id}` : 'char-create');
  const modalTitle = characterToEdit ? `Personagem: ${characterToEdit.name}` : 'Novo Personagem';

  const {
    isSupported: isPopoutSupported,
    isPoppedOut,
    popoutContainer,
    openPopout,
    closePopout,
  } = usePopoutModal(modalTitle);

  // Available formats: either from the work or fallback to WebNovel
  const availableFormats = formats && formats.length > 0 ? formats : [{ workType: 2, totalChapter: { volume: null, chapter: 100 } } as WorkFormat];

  useEffect(() => {
    if (characterToEdit) {
      setName(characterToEdit.name);
      setCharacterType(characterToEdit.characterType);
      setImageUrl(characterToEdit.imageUrl || '');
      setDescription(characterToEdit.description || '');
      setAlternativeNames(characterToEdit.alternativeNames || []);
      setAffiliations(characterToEdit.affiliations || []);

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
      setAffiliations([]);
      setAppearances({});
    }
    setAltNameInput('');
    setAffiliationInput('');
    setActiveTab('write');
    setError(null);
  }, [characterToEdit, isOpen]);

  useEffect(() => {
    if (isMinimized) {
      updateModalTitle(
        effectiveSessionId,
        name.trim() || (characterToEdit ? characterToEdit.name : 'Novo Personagem')
      );
    }
  }, [name, isMinimized, effectiveSessionId, characterToEdit]);

  const handleMinimize = () => {
    if (isPoppedOut) {
      closePopout();
    }
    setIsMinimized(true);
    minimizeModal({
      id: effectiveSessionId,
      title: name.trim() || (characterToEdit ? characterToEdit.name : 'Novo Personagem'),
      type: 'character',
      onRestore: () => setIsMinimized(false),
      onClose: handleClose,
    });
  };

  const handleClose = () => {
    if (isPoppedOut) {
      closePopout();
    }
    closeModal(effectiveSessionId);
    onClose(hasModifiedTags);
  };

  const handleTogglePopout = async () => {
    if (isPoppedOut) {
      closePopout();
    } else {
      await openPopout({
        title: name.trim() || (characterToEdit ? characterToEdit.name : 'Novo Personagem'),
        width: 650,
        height: 750,
      });
    }
  };

  useEscapeKey(handleClose, isOpen && !isMinimized && !isPoppedOut);

  if (!isOpen || isMinimized) return null;

  const filteredAffiliationSuggestions = (existingAffiliations || []).filter(
    (aff) =>
      aff.toLowerCase().includes(affiliationInput.toLowerCase().trim()) &&
      !affiliations.some((a) => a.toLowerCase() === aff.toLowerCase())
  );

  const saveTagsSilently = async (updatedAltNames: string[], updatedAffiliations: string[]) => {
    if (!characterToEdit) return;
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

      const req: UpdateCharacterRequest = {
        name: name.trim() || characterToEdit.name,
        characterType,
        imageUrl: imageUrl.trim() || null,
        description: description.trim() || null,
        firstAppearances: validAppearances.length > 0 ? validAppearances : (characterToEdit.firstAppearances || []),
        alternativeNames: updatedAltNames,
        affiliations: updatedAffiliations,
      };

      await charactersApi.update(workId, characterToEdit.id, req);
      setHasModifiedTags(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar dados do personagem.');
    }
  };

  const handleAddAltName = () => {
    const trimmed = altNameInput.trim();
    if (trimmed && !alternativeNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...alternativeNames, trimmed];
      setAlternativeNames(updated);
      setAltNameInput('');
      if (characterToEdit) {
        saveTagsSilently(updated, affiliations);
      }
    }
  };

  const handleRemoveAltName = (indexToRemove: number) => {
    const updated = alternativeNames.filter((_, idx) => idx !== indexToRemove);
    setAlternativeNames(updated);
    if (characterToEdit) {
      saveTagsSilently(updated, affiliations);
    }
  };

  const handleAltKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      e.stopPropagation();
      handleAddAltName();
    }
  };

  const handleAddAffiliation = (val?: string) => {
    const target = val !== undefined ? val : affiliationInput;
    const trimmed = target.trim();
    if (trimmed && !affiliations.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...affiliations, trimmed];
      setAffiliations(updated);
      setAffiliationInput('');
      setShowAffiliationSuggestions(false);
      if (characterToEdit) {
        saveTagsSilently(alternativeNames, updated);
      }
    }
  };

  const handleRemoveAffiliation = (indexToRemove: number) => {
    const updated = affiliations.filter((_, idx) => idx !== indexToRemove);
    setAffiliations(updated);
    if (characterToEdit) {
      saveTagsSilently(alternativeNames, updated);
    }
  };

  const handleAffiliationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      e.stopPropagation();
      handleAddAffiliation();
    } else if (e.key === 'Escape') {
      setShowAffiliationSuggestions(false);
    }
  };

  const insertAtCursor = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setDescription((prev) => prev + prefix + defaultText + suffix);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end) || defaultText;
    const replacement = prefix + selectedText + suffix;
    const newContent = description.substring(0, start) + replacement + description.substring(end);
    setDescription(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const handleInsertTable = () => {
    const sampleTable = `\n| Característica | Detalhe |\n| :--- | :--- |\n| Raça / Espécie | Humano |\n| Ocupação / Cargo | Alquimista |\n`;
    insertAtCursor('', sampleTable);
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

      let savedCharacter: Character;

      if (characterToEdit) {
        const req: UpdateCharacterRequest = {
          name: name.trim(),
          characterType,
          imageUrl: imageUrl.trim() || null,
          description: description.trim() || null,
          firstAppearances: validAppearances,
          alternativeNames,
          affiliations,
        };
        await charactersApi.update(workId, characterToEdit.id, req);
        savedCharacter = {
          id: characterToEdit.id,
          workId,
          name: name.trim(),
          characterType,
          imageUrl: imageUrl.trim() || null,
          description: description.trim() || null,
          firstAppearances: validAppearances,
          alternativeNames,
          affiliations,
        };
      } else {
        const req: CreateCharacterRequest = {
          workId,
          name: name.trim(),
          characterType,
          imageUrl: imageUrl.trim() || null,
          description: description.trim() || null,
          firstAppearances: validAppearances,
          alternativeNames,
          affiliations,
        };
        const created = await charactersApi.create(req);
        savedCharacter = created || {
          id: 'created',
          workId,
          name: name.trim(),
          characterType,
          imageUrl: imageUrl.trim() || null,
          description: description.trim() || null,
          firstAppearances: validAppearances,
          alternativeNames,
          affiliations,
        };
      }

      if (isPoppedOut) {
        closePopout();
      }
      closeModal(effectiveSessionId);
      onSaved(savedCharacter);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar personagem.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      className={isPoppedOut ? '' : 'modal-content'}
      style={
        isPoppedOut
          ? {
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              width: '100vw',
              background: '#0f172a',
              color: '#f8fafc',
              overflowY: 'auto',
              padding: 20,
              boxSizing: 'border-box',
            }
          : { maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }
      }
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
          {characterToEdit ? 'Editar Personagem' : 'Cadastrar Personagem'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isPopoutSupported && (
            <button
              type="button"
              className="btn-icon"
              onClick={handleTogglePopout}
              title={isPoppedOut ? 'Reanexar à janela principal' : 'Destacar em Pop-up (Picture-in-Picture)'}
              style={{
                color: isPoppedOut ? '#38bdf8' : 'var(--text-muted)',
                background: isPoppedOut ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              }}
            >
              {isPoppedOut ? <ArrowDownLeft size={18} /> : <ExternalLink size={18} />}
            </button>
          )}
          {!isPoppedOut && (
            <button
              type="button"
              className="btn-icon"
              onClick={handleMinimize}
              title="Minimizar formulário"
              style={{ color: 'var(--text-muted)' }}
            >
              <Minus size={18} />
            </button>
          )}
          <button
            type="button"
            className="btn-icon"
            onClick={handleClose}
            title="Fechar"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px 12px', borderRadius: 6, marginBottom: 14, fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
              e.preventDefault();
            }
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
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
              Grupos / Facções / Afiliações (opcional)
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  className="input-text"
                  value={affiliationInput}
                  onChange={(e) => {
                    setAffiliationInput(e.target.value);
                    setShowAffiliationSuggestions(true);
                  }}
                  onFocus={() => setShowAffiliationSuggestions(true)}
                  onBlur={() => {
                    // Small delay so onMouseDown on suggestions can trigger first
                    setTimeout(() => setShowAffiliationSuggestions(false), 200);
                  }}
                  onKeyDown={handleAffiliationKeyDown}
                  placeholder="Ex: Tarot Club, Nighthawks, Ahjin Guild (pressione Enter ou +)"
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleAddAffiliation()}
                  style={{ whiteSpace: 'nowrap', padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={14} /> Adicionar
                </button>
              </div>

              {/* Menu de Autocomplete de Afiliações da Obra */}
              {showAffiliationSuggestions && filteredAffiliationSuggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 86,
                    background: '#131b2e',
                    border: '1px solid #334155',
                    borderRadius: 6,
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                    zIndex: 40,
                    maxHeight: 160,
                    overflowY: 'auto',
                    marginTop: 4,
                  }}
                >
                  {filteredAffiliationSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleAddAffiliation(suggestion);
                      }}
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.8rem',
                        color: '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        borderBottom: idx < filteredAffiliationSuggestions.length - 1 ? '1px solid #1e293b' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = '#1e293b';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <Shield size={12} color="#c084fc" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {affiliations.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {affiliations.map((aff, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(168, 85, 247, 0.15)',
                      border: '1px solid rgba(168, 85, 247, 0.35)',
                      color: '#c084fc',
                      fontSize: '0.78rem',
                      padding: '2px 8px',
                      borderRadius: 14,
                    }}
                  >
                    <Shield size={11} />
                    {aff}
                    <button
                      type="button"
                      onClick={() => handleRemoveAffiliation(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#c084fc',
                        cursor: 'pointer',
                        padding: '0 2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Remover afiliação"
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
                        placeholder={getUnitLabel(f.workType)}
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
                        placeholder={isWatchable(f.workType) ? "Temporada (opcional)" : "Volume (opcional)"}
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

          {/* Descrição / Biografia com Tabs e Toolbar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Descrição / Biografia e Notas (Markdown)
              </label>

              {/* Write / Preview Tab Toggles */}
              <div style={{ display: 'flex', background: '#0f172a', borderRadius: 6, padding: 2, border: '1px solid #334155' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 10px',
                    fontSize: '0.75rem',
                    borderRadius: 4,
                    background: activeTab === 'write' ? '#1e293b' : 'transparent',
                    color: activeTab === 'write' ? '#38bdf8' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'write' ? 600 : 400,
                  }}
                >
                  <Edit3 size={13} /> Escrever
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 10px',
                    fontSize: '0.75rem',
                    borderRadius: 4,
                    background: activeTab === 'preview' ? '#1e293b' : 'transparent',
                    color: activeTab === 'preview' ? '#38bdf8' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'preview' ? 600 : 400,
                  }}
                >
                  <Eye size={13} /> Pré-visualizar
                </button>
              </div>
            </div>

            {/* Formatting Toolbar */}
            {activeTab === 'write' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 4,
                  padding: '5px 8px',
                  background: '#1e293b',
                  borderRadius: '6px 6px 0 0',
                  border: '1px solid #334155',
                  borderBottom: 'none',
                }}
              >
                <button
                  type="button"
                  className="btn-icon"
                  title="Negrito (**texto**)"
                  onClick={() => insertAtCursor('**', '**', 'texto')}
                  style={{ padding: '3px 5px', color: '#cbd5e1' }}
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  title="Itálico (*texto*)"
                  onClick={() => insertAtCursor('*', '*', 'texto')}
                  style={{ padding: '3px 5px', color: '#cbd5e1' }}
                >
                  <Italic size={14} />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  title="Título / Seção (### Título)"
                  onClick={() => insertAtCursor('\n### ', '\n', 'Título da Seção')}
                  style={{ padding: '3px 5px', color: '#cbd5e1' }}
                >
                  <Heading3 size={14} />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  title="Lista (- Item)"
                  onClick={() => insertAtCursor('\n- ', '\n', 'Item da lista')}
                  style={{ padding: '3px 5px', color: '#cbd5e1' }}
                >
                  <List size={14} />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  title="Inserir Tabela"
                  onClick={handleInsertTable}
                  style={{ padding: '3px 5px', color: '#cbd5e1' }}
                >
                  <TableIcon size={14} />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  title="Citação (> texto)"
                  onClick={() => insertAtCursor('\n> ', '\n', 'Citação')}
                  style={{ padding: '3px 5px', color: '#cbd5e1' }}
                >
                  <Quote size={14} />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  title="Código (`código`)"
                  onClick={() => insertAtCursor('`', '`', 'código')}
                  style={{ padding: '3px 5px', color: '#cbd5e1' }}
                >
                  <Code size={14} />
                </button>
              </div>
            )}

            {/* Textarea or Preview */}
            {activeTab === 'write' ? (
              <textarea
                ref={textareaRef}
                rows={5}
                className="input-text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Aparência, histórico, personalidade, poderes, papel na trama... (suporta Markdown e tabelas)"
                style={{
                  resize: 'vertical',
                  borderRadius: activeTab === 'write' ? '0 0 6px 6px' : 6,
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                }}
              />
            ) : (
              <div
                style={{
                  background: '#090e17',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  padding: 12,
                  minHeight: 120,
                  maxHeight: 280,
                  overflowY: 'auto',
                }}
              >
                {description.trim() ? (
                  <MarkdownViewer content={description} compact />
                ) : (
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                    Nada para pré-visualizar. Digite algo na aba 'Escrever'.
                  </span>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button
              type="button"
              onClick={handleClose}
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
    );

  if (isPoppedOut && popoutContainer) {
    return createPortal(modalContent, popoutContainer);
  }

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {modalContent}
    </div>,
    document.body
  );
};
