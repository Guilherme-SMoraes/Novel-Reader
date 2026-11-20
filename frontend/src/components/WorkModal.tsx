import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { CreateWorkRequest, Genre, Language, UpdateWorkRequest, Work, WorkFormat, WorkType } from '../types';
import { LanguageLabels, WorkTypeLabels } from '../types';
import { worksApi } from '../services/api';
import { useModalDock } from '../context/ModalDockContext';
import { useToast } from '../context/ToastContext';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { saveFormDraft, getFormDraft, discardDraft } from '../utils/formDrafts';
import { GenreMultiSelect } from './GenreMultiSelect';
import { X, Minus, Layers, Plus } from 'lucide-react';
import { ImageInput } from './ImageInput';
import {
  getUnitLabel,
  getAvailableUpToLabel,
  getWhereToConsumePlaceholder,
  isWatchable,
} from '../utils/formatLabels';

interface Props {
  sessionId?: string;
  isOpen: boolean;
  workToEdit?: Work | null;
  genres: Genre[];
  onClose: () => void;
  onSaved: () => void;
  onOpenManageGenres?: () => void;
}

interface FormatFormState {
  workType: WorkType;
  chapter: string;
  volume: string;
  transChapter: string;
  transVolume: string;
  transLanguage: Language | '';
  linkWhereToRead: string;
}

interface WorkDraftData {
  title: string;
  alternativeTitles: string[];
  description: string;
  originalLanguage: Language;
  aggregatorLink: string;
  coverImageUrl: string;
  selectedGenreIds: string[];
  formats: FormatFormState[];
  activeTabWorkType: WorkType;
}

const ALL_WORK_TYPES: WorkType[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export const WorkModal: React.FC<Props> = ({
  sessionId,
  isOpen,
  workToEdit,
  genres,
  onClose,
  onSaved,
  onOpenManageGenres,
}) => {
  const [title, setTitle] = useState('');
  const [alternativeTitles, setAlternativeTitles] = useState<string[]>([]);
  const [altTitleInput, setAltTitleInput] = useState('');
  const [description, setDescription] = useState('');
  const [originalLanguage, setOriginalLanguage] = useState<Language>(3); // Coreano default
  const [aggregatorLink, setAggregatorLink] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);

  // Formatos
  const [formats, setFormats] = useState<FormatFormState[]>([]);
  const [activeTabWorkType, setActiveTabWorkType] = useState<WorkType>(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasRecoveredDraft, setHasRecoveredDraft] = useState(false);
  const { showToast } = useToast();

  const { minimizeModal, closeModal, updateModalTitle } = useModalDock();
  const effectiveSessionId = sessionId || (workToEdit ? `work-${workToEdit.id}` : 'work-create');

  useEffect(() => {
    if (!isOpen) return;

    const draft = getFormDraft<WorkDraftData>(effectiveSessionId);
    if (draft) {
      setTitle(draft.title || '');
      setAlternativeTitles(draft.alternativeTitles || []);
      setAltTitleInput('');
      setDescription(draft.description || '');
      setOriginalLanguage(draft.originalLanguage ?? 3);
      setAggregatorLink(draft.aggregatorLink || '');
      setCoverImageUrl(draft.coverImageUrl || '');
      setSelectedGenreIds(draft.selectedGenreIds || []);

      if (draft.formats && draft.formats.length > 0) {
        setFormats(draft.formats);
        setActiveTabWorkType(draft.activeTabWorkType || draft.formats[0].workType);
      }
      setError(null);
      setHasRecoveredDraft(true);
      return;
    }

    setHasRecoveredDraft(false);
    if (workToEdit) {
      setTitle(workToEdit.title);
      setAlternativeTitles(workToEdit.alternativeTitles || []);
      setAltTitleInput('');
      setDescription(workToEdit.description || '');
      setOriginalLanguage(workToEdit.originalLanguage);
      setAggregatorLink(workToEdit.aggregatorLink);
      setCoverImageUrl(workToEdit.coverImageUrl || '');
      setSelectedGenreIds(workToEdit.genres ? workToEdit.genres.map((g) => g.id) : []);

      if (workToEdit.formats && workToEdit.formats.length > 0) {
        const loadedFormats: FormatFormState[] = workToEdit.formats.map((f) => ({
          workType: f.workType,
          chapter: f.totalChapter.chapter.toString(),
          volume: f.totalChapter.volume ? f.totalChapter.volume.toString() : '',
          transChapter: f.translatedUpTo ? f.translatedUpTo.chapter.toString() : '',
          transVolume: f.translatedUpTo?.volume ? f.translatedUpTo.volume.toString() : '',
          transLanguage: f.translatedLanguage || '',
          linkWhereToRead: f.linkWhereToRead || '',
        }));
        setFormats(loadedFormats);
        setActiveTabWorkType(loadedFormats[0].workType);
      } else {
        setFormats([
          {
            workType: 2,
            chapter: '100',
            volume: '',
            transChapter: '',
            transVolume: '',
            transLanguage: '',
            linkWhereToRead: '',
          },
        ]);
        setActiveTabWorkType(2);
      }
    } else {
      setTitle('');
      setAlternativeTitles([]);
      setAltTitleInput('');
      setDescription('');
      setOriginalLanguage(3);
      setAggregatorLink('');
      setCoverImageUrl('');
      setSelectedGenreIds([]);
      setFormats([
        {
          workType: 2,
          chapter: '100',
          volume: '',
          transChapter: '',
          transVolume: '',
          transLanguage: '',
          linkWhereToRead: '',
        },
      ]);
      setActiveTabWorkType(2);
    }
    setError(null);
  }, [workToEdit, isOpen, effectiveSessionId]);

  useEffect(() => {
    if (!isOpen || loading) return;
    const hasContent =
      title.trim() !== '' ||
      description.trim() !== '' ||
      aggregatorLink.trim() !== '' ||
      coverImageUrl.trim() !== '' ||
      alternativeTitles.length > 0 ||
      selectedGenreIds.length > 0;

    if (hasContent) {
      saveFormDraft(
        effectiveSessionId,
        {
          type: 'work',
          mode: workToEdit ? 'edit' : 'create',
          entityId: workToEdit?.id,
        },
        {
          title,
          alternativeTitles,
          description,
          originalLanguage,
          aggregatorLink,
          coverImageUrl,
          selectedGenreIds,
          formats,
          activeTabWorkType,
        }
      );
    }
  }, [
    isOpen,
    loading,
    effectiveSessionId,
    workToEdit,
    title,
    alternativeTitles,
    description,
    originalLanguage,
    aggregatorLink,
    coverImageUrl,
    selectedGenreIds,
    formats,
    activeTabWorkType,
  ]);

  useEffect(() => {
    if (isMinimized) {
      updateModalTitle(
        effectiveSessionId,
        title.trim() || (workToEdit ? workToEdit.title : 'Nova Obra')
      );
    }
  }, [title, isMinimized, effectiveSessionId, workToEdit, updateModalTitle]);

  const isDirty = () => {
    if (workToEdit) {
      return (
        title !== workToEdit.title ||
        JSON.stringify(alternativeTitles) !== JSON.stringify(workToEdit.alternativeTitles || []) ||
        description !== (workToEdit.description || '') ||
        aggregatorLink !== workToEdit.aggregatorLink ||
        coverImageUrl !== (workToEdit.coverImageUrl || '') ||
        JSON.stringify(selectedGenreIds) !== JSON.stringify(workToEdit.genres ? workToEdit.genres.map((g) => g.id) : [])
      );
    }
    return (
      title.trim() !== '' ||
      description.trim() !== '' ||
      aggregatorLink.trim() !== '' ||
      coverImageUrl.trim() !== '' ||
      alternativeTitles.length > 0 ||
      selectedGenreIds.length > 0
    );
  };

  const handleDiscardDraft = () => {
    discardDraft(effectiveSessionId, 'work');
    setHasRecoveredDraft(false);
    if (workToEdit) {
      setTitle(workToEdit.title);
      setAlternativeTitles(workToEdit.alternativeTitles || []);
      setAltTitleInput('');
      setDescription(workToEdit.description || '');
      setOriginalLanguage(workToEdit.originalLanguage);
      setAggregatorLink(workToEdit.aggregatorLink);
      setCoverImageUrl(workToEdit.coverImageUrl || '');
      setSelectedGenreIds(workToEdit.genres ? workToEdit.genres.map((g) => g.id) : []);

      if (workToEdit.formats && workToEdit.formats.length > 0) {
        const loadedFormats: FormatFormState[] = workToEdit.formats.map((f) => ({
          workType: f.workType,
          chapter: f.totalChapter.chapter.toString(),
          volume: f.totalChapter.volume ? f.totalChapter.volume.toString() : '',
          transChapter: f.translatedUpTo ? f.translatedUpTo.chapter.toString() : '',
          transVolume: f.translatedUpTo?.volume ? f.translatedUpTo.volume.toString() : '',
          transLanguage: f.translatedLanguage || '',
          linkWhereToRead: f.linkWhereToRead || '',
        }));
        setFormats(loadedFormats);
        setActiveTabWorkType(loadedFormats[0].workType);
      } else {
        setFormats([
          {
            workType: 2,
            chapter: '100',
            volume: '',
            transChapter: '',
            transVolume: '',
            transLanguage: '',
            linkWhereToRead: '',
          },
        ]);
        setActiveTabWorkType(2);
      }
    } else {
      setTitle('');
      setAlternativeTitles([]);
      setAltTitleInput('');
      setDescription('');
      setOriginalLanguage(3);
      setAggregatorLink('');
      setCoverImageUrl('');
      setSelectedGenreIds([]);
      setFormats([
        {
          workType: 2,
          chapter: '100',
          volume: '',
          transChapter: '',
          transVolume: '',
          transLanguage: '',
          linkWhereToRead: '',
        },
      ]);
      setActiveTabWorkType(2);
    }
    showToast('Rascunho descartado.', 'info');
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    minimizeModal({
      id: effectiveSessionId,
      title: title.trim() || (workToEdit ? workToEdit.title : 'Nova Obra'),
      type: 'work',
      onRestore: () => setIsMinimized(false),
      onClose: handleClose,
    });
  };

  const handleClose = () => {
    if (isDirty()) {
      const confirmed = window.confirm(
        'Deseja descartar as alterações deste rascunho? Clique em OK para descartar ou Cancelar para manter o rascunho salvo.'
      );
      if (confirmed) {
        discardDraft(effectiveSessionId, 'work');
      }
    }
    closeModal(effectiveSessionId);
    onClose();
  };

  useEscapeKey(handleClose, isOpen && !isMinimized && !loading);

  if (!isOpen || isMinimized) return null;

  const autoSaveAlternativeTitles = async (updatedTitles: string[]) => {
    if (!workToEdit) return;
    try {
      const formattedList: WorkFormat[] = formats.map((f) => {
        const chNum = parseInt(f.chapter, 10);
        const transNum = f.transChapter ? parseInt(f.transChapter, 10) : null;
        return {
          workType: f.workType,
          totalChapter: {
            volume: f.volume ? parseInt(f.volume, 10) : null,
            chapter: isNaN(chNum) || chNum <= 0 ? 1 : chNum,
          },
          translatedUpTo: transNum && !isNaN(transNum) && transNum > 0
            ? {
                volume: f.transVolume ? parseInt(f.transVolume, 10) : null,
                chapter: transNum,
              }
            : null,
          translatedLanguage: f.transLanguage ? (Number(f.transLanguage) as Language) : null,
          linkWhereToRead: f.linkWhereToRead.trim() || null,
        };
      });

      const req: UpdateWorkRequest = {
        title: title.trim() || workToEdit.title,
        description: description.trim() || null,
        aggregatorLink: aggregatorLink.trim() || workToEdit.aggregatorLink,
        coverImageUrl: coverImageUrl.trim() || null,
        formats: formattedList.length > 0 ? formattedList : workToEdit.formats,
        genreIds: selectedGenreIds,
        alternativeTitles: updatedTitles,
      };

      await worksApi.update(workToEdit.id, req);
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar títulos alternativos da obra.');
    }
  };

  const handleAddAltTitle = async () => {
    const trimmed = altTitleInput.trim();
    if (trimmed && !alternativeTitles.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...alternativeTitles, trimmed];
      setAlternativeTitles(updated);
      setAltTitleInput('');
      if (workToEdit) {
        await autoSaveAlternativeTitles(updated);
      }
    }
  };

  const handleRemoveAltTitle = async (indexToRemove: number) => {
    const updated = alternativeTitles.filter((_, idx) => idx !== indexToRemove);
    setAlternativeTitles(updated);
    if (workToEdit) {
      await autoSaveAlternativeTitles(updated);
    }
  };

  const handleAltTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddAltTitle();
    }
  };

  const toggleFormat = (wt: WorkType) => {
    const exists = formats.some((f) => f.workType === wt);
    if (exists) {
      if (formats.length <= 1) {
        setError('A obra deve conter pelo menos um formato.');
        return;
      }
      const updated = formats.filter((f) => f.workType !== wt);
      setFormats(updated);
      if (activeTabWorkType === wt) {
        setActiveTabWorkType(updated[0].workType);
      }
    } else {
      const newFormat: FormatFormState = {
        workType: wt,
        chapter: '100',
        volume: '',
        transChapter: '',
        transVolume: '',
        transLanguage: '',
        linkWhereToRead: '',
      };
      setFormats([...formats, newFormat]);
      setActiveTabWorkType(wt);
    }
    setError(null);
  };

  const updateActiveFormatField = <K extends keyof FormatFormState>(
    field: K,
    value: FormatFormState[K]
  ) => {
    setFormats((prev) =>
      prev.map((f) => {
        if (f.workType === activeTabWorkType) {
          return { ...f, [field]: value };
        }
        return f;
      })
    );
  };

  const activeFormat = formats.find((f) => f.workType === activeTabWorkType) || formats[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formats.length === 0) {
        throw new Error('Selecione pelo menos um formato para a obra.');
      }

      // Validar cada formato
      const formattedList: WorkFormat[] = formats.map((f) => {
        const chapterNum = parseInt(f.chapter, 10);
        const unitPlural = getUnitLabel(f.workType, { plural: true }).toLowerCase();
        if (isNaN(chapterNum) || chapterNum <= 0) {
          throw new Error(`O total de ${unitPlural} para o formato "${WorkTypeLabels[f.workType]}" deve ser maior que zero.`);
        }

        const hasTranslation = f.transChapter.trim() !== '';
        const transNum = hasTranslation ? parseInt(f.transChapter, 10) : null;
        if (transNum !== null && transNum > chapterNum) {
          throw new Error(`${getUnitLabel(f.workType, { plural: true })} disponíveis de "${WorkTypeLabels[f.workType]}" não podem ultrapassar o total.`);
        }

        return {
          workType: f.workType,
          totalChapter: {
            volume: f.volume ? parseInt(f.volume, 10) : null,
            chapter: chapterNum,
          },
          translatedUpTo: hasTranslation
            ? {
                volume: f.transVolume ? parseInt(f.transVolume, 10) : null,
                chapter: transNum!,
              }
            : null,
          translatedLanguage: f.transLanguage ? (Number(f.transLanguage) as Language) : null,
          linkWhereToRead: f.linkWhereToRead.trim() || null,
        };
      });

      if (workToEdit) {
        const req: UpdateWorkRequest = {
          title: title.trim(),
          description: description.trim() || null,
          aggregatorLink: aggregatorLink.trim(),
          coverImageUrl: coverImageUrl.trim() || null,
          formats: formattedList,
          genreIds: selectedGenreIds,
          alternativeTitles,
        };
        await worksApi.update(workToEdit.id, req);
      } else {
        const req: CreateWorkRequest = {
          title: title.trim(),
          description: description.trim() || null,
          originalLanguage,
          aggregatorLink: aggregatorLink.trim(),
          coverImageUrl: coverImageUrl.trim() || null,
          formats: formattedList,
          genreIds: selectedGenreIds,
          alternativeTitles,
        };
        await worksApi.create(req);
      }

      discardDraft(effectiveSessionId, 'work');
      closeModal(effectiveSessionId);
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar obra.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDirty()) {
          handleClose();
        }
      }}
    >
      <div className="modal-content" style={{ maxHeight: '92vh', overflowY: 'auto', maxWidth: '680px', width: '100%', padding: '24px 28px' }}>
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid #1e293b', paddingBottom: 12 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            {workToEdit ? 'Editar Obra' : 'Cadastrar Nova Obra'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              className="btn-icon"
              onClick={handleMinimize}
              title="Minimizar formulário"
              style={{ color: 'var(--text-muted)' }}
            >
              <Minus size={18} />
            </button>
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

        {hasRecoveredDraft && (
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid #0284c7',
              color: '#38bdf8',
              padding: '8px 12px',
              borderRadius: 6,
              marginBottom: 14,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <span>📝 Rascunho recuperado automaticamente</span>
            <button
              type="button"
              onClick={handleDiscardDraft}
              style={{
                background: 'transparent',
                border: '1px solid #0284c7',
                color: '#38bdf8',
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Descartar rascunho
            </button>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Título */}
          <div style={{ width: '100%' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 5 }}>
              Título da Obra *
            </label>
            <input
              type="text"
              required
              className="input-text"
              style={{ width: '100%' }}
              placeholder="Ex: Solo Leveling"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Outros Títulos / Títulos Alternativos */}
          <div style={{ width: '100%' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 5 }}>
              Outros Títulos / Títulos Alternativos / Traduções / Abreviações (opcional)
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                className="input-text"
                style={{ flex: 1 }}
                value={altTitleInput}
                onChange={(e) => setAltTitleInput(e.target.value)}
                onKeyDown={handleAltTitleKeyDown}
                placeholder="Ex: Shadow Slave, SS, Escravo das Sombras (pressione Enter ou clique em +)"
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddAltTitle}
                style={{ whiteSpace: 'nowrap', padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={14} /> Adicionar
              </button>
            </div>
            {alternativeTitles.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {alternativeTitles.map((altTitle, idx) => (
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
                    {altTitle}
                    <button
                      type="button"
                      onClick={() => handleRemoveAltTitle(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '0 2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Remover título alternativo"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sinopse */}
          <div style={{ width: '100%' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 5 }}>
              Sinopse / Descrição
            </label>
            <textarea
              className="input-text"
              style={{ width: '100%', resize: 'vertical' }}
              rows={3}
              placeholder="Breve resumo da história..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Multi-Select de Gêneros */}
          <div style={{ background: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #334155', width: '100%' }}>
            <GenreMultiSelect
              genres={genres}
              selectedGenreIds={selectedGenreIds}
              onChange={setSelectedGenreIds}
              onOpenManageGenres={onOpenManageGenres}
            />
          </div>

          {/* Idioma Original (se criando) e Link Agregador */}
          <div style={{ display: 'flex', gap: 14, width: '100%' }}>
            {!workToEdit && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 5 }}>
                  Idioma Original *
                </label>
                <select
                  className="input-text"
                  style={{ width: '100%' }}
                  value={originalLanguage}
                  onChange={(e) => setOriginalLanguage(Number(e.target.value) as Language)}
                >
                  {Object.entries(LanguageLabels).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ flex: workToEdit ? 1 : 1, minWidth: 0 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 5 }}>
                Link do Agregador (NovelUpdates, AniList, etc.) *
              </label>
              <input
                type="url"
                required
                className="input-text"
                style={{ width: '100%' }}
                placeholder="https://novelupdates.com/series/..."
                value={aggregatorLink}
                onChange={(e) => setAggregatorLink(e.target.value)}
              />
            </div>
          </div>

          {/* Capa com Prévia */}
          <ImageInput
            label="URL da Imagem da Capa (opcional)"
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            placeholder="https://exemplo.com/capa.jpg ou envie um arquivo"
            disabled={loading}
          />

          {/* SEÇÃO MULTIFORMATO */}
          <div style={{ background: '#0b1120', border: '1px solid #334155', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Layers size={18} color="#a855f7" />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                Formatos da Obra *
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                (Selecione um ou mais tipos: ex. Novel + Manhwa)
              </span>
            </div>

            {/* Pílulas de seleção de formatos */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {ALL_WORK_TYPES.map((wt) => {
                const isSelected = formats.some((f) => f.workType === wt);
                return (
                  <button
                    key={wt}
                    type="button"
                    onClick={() => toggleFormat(wt)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: '0.8rem',
                      fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? '#7c3aed' : '#1e293b',
                      color: isSelected ? '#ffffff' : '#94a3b8',
                      border: isSelected ? '1px solid #a855f7' : '1px solid #334155',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {WorkTypeLabels[wt]}
                  </button>
                );
              })}
            </div>

            {/* Seletor de abas dos formatos ativos para configuração */}
            {formats.length > 1 && (
              <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #334155', marginBottom: 14, paddingBottom: 6 }}>
                {formats.map((f) => {
                  const isActive = f.workType === activeTabWorkType;
                  return (
                    <button
                      key={f.workType}
                      type="button"
                      onClick={() => setActiveTabWorkType(f.workType)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: '0.8rem',
                        fontWeight: isActive ? 700 : 500,
                        background: isActive ? '#1e293b' : 'transparent',
                        color: isActive ? '#38bdf8' : '#64748b',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Configurar {WorkTypeLabels[f.workType]}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Campos de configuração do Formato Ativo */}
            {activeFormat && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#38bdf8' }}>
                  {getUnitLabel(activeFormat.workType, { plural: true })} & Links para {WorkTypeLabels[activeFormat.workType]}:
                </div>

                {/* Capítulos Totais do Formato */}
                <div style={{ display: 'flex', gap: 14, width: '100%' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      {getUnitLabel(activeFormat.workType)} Total * ({WorkTypeLabels[activeFormat.workType]})
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="input-text"
                      style={{ width: '100%' }}
                      placeholder="Ex: 270"
                      value={activeFormat.chapter}
                      onChange={(e) => updateActiveFormatField('chapter', e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      {isWatchable(activeFormat.workType) ? 'Temporada Total (opcional)' : 'Volume Total (opcional)'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="input-text"
                      style={{ width: '100%' }}
                      placeholder="Opcional"
                      value={activeFormat.volume}
                      onChange={(e) => updateActiveFormatField('volume', e.target.value)}
                    />
                  </div>
                </div>

                {/* Tradução do Formato */}
                <div style={{ display: 'flex', gap: 14, width: '100%' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      {getAvailableUpToLabel(activeFormat.workType)} (opcional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="input-text"
                      style={{ width: '100%' }}
                      placeholder="Ex: 200"
                      value={activeFormat.transChapter}
                      onChange={(e) => updateActiveFormatField('transChapter', e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      {isWatchable(activeFormat.workType) ? 'Idioma da Legenda / Dublagem' : 'Idioma da Tradução'}
                    </label>
                    <select
                      className="input-text"
                      style={{ width: '100%' }}
                      value={activeFormat.transLanguage}
                      onChange={(e) =>
                        updateActiveFormatField('transLanguage', e.target.value ? (Number(e.target.value) as Language) : '')
                      }
                    >
                      <option value="">Nenhum / Não informado</option>
                      {Object.entries(LanguageLabels).map(([val, label]) => (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Link de Leitura do Formato */}
                <div style={{ width: '100%' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Link de Onde Você {isWatchable(activeFormat.workType) ? 'Assiste' : 'Lê'} {WorkTypeLabels[activeFormat.workType]} (opcional)
                  </label>
                  <input
                    type="url"
                    className="input-text"
                    style={{ width: '100%' }}
                    placeholder={getWhereToConsumePlaceholder(activeFormat.workType)}
                    value={activeFormat.linkWhereToRead}
                    onChange={(e) => updateActiveFormatField('linkWhereToRead', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rodapé com Ações */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14, borderTop: '1px solid #1e293b', paddingTop: 14 }}>
            <button type="button" onClick={handleClose} className="btn-secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : workToEdit ? 'Salvar Alterações' : 'Cadastrar Obra'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
