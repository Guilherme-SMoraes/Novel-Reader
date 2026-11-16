import React, { useState, useEffect } from 'react';
import type { CreateWorkRequest, Genre, Language, UpdateWorkRequest, Work, WorkFormat, WorkType } from '../types';
import { LanguageLabels, WorkTypeLabels } from '../types';
import { worksApi } from '../services/api';
import { GenreMultiSelect } from './GenreMultiSelect';
import { X, Layers } from 'lucide-react';
import { ImageInput } from './ImageInput';

interface Props {
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

const ALL_WORK_TYPES: WorkType[] = [1, 2, 3, 4, 5, 6];

export const WorkModal: React.FC<Props> = ({
  isOpen,
  workToEdit,
  genres,
  onClose,
  onSaved,
  onOpenManageGenres,
}) => {
  const [title, setTitle] = useState('');
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

  useEffect(() => {
    if (workToEdit) {
      setTitle(workToEdit.title);
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
        // Fallback para novo formato
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
  }, [workToEdit, isOpen]);

  if (!isOpen) return null;

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
        if (isNaN(chapterNum) || chapterNum <= 0) {
          throw new Error(`O total de capítulos para o formato "${WorkTypeLabels[f.workType]}" deve ser maior que zero.`);
        }

        const hasTranslation = f.transChapter.trim() !== '';
        const transNum = hasTranslation ? parseInt(f.transChapter, 10) : null;
        if (transNum !== null && transNum > chapterNum) {
          throw new Error(`Capítulos traduzidos de "${WorkTypeLabels[f.workType]}" não podem ultrapassar o total de capítulos.`);
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
        };
        await worksApi.create(req);
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar obra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxHeight: '92vh', overflowY: 'auto', maxWidth: '680px', width: '100%', padding: '24px 28px' }}>
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid #1e293b', paddingBottom: 12 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            {workToEdit ? 'Editar Obra' : 'Cadastrar Nova Obra'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

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
                  Capítulos & Links para {WorkTypeLabels[activeFormat.workType]}:
                </div>

                {/* Capítulos Totais do Formato */}
                <div style={{ display: 'flex', gap: 14, width: '100%' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      Capítulo Total * ({WorkTypeLabels[activeFormat.workType]})
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
                      Volume Total (opcional)
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
                      Traduzido até Capítulo (opcional)
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
                      Idioma da Tradução
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
                    Link de Onde Você Lê {WorkTypeLabels[activeFormat.workType]} (opcional)
                  </label>
                  <input
                    type="url"
                    className="input-text"
                    style={{ width: '100%' }}
                    placeholder={`Ex: https://site-leitura-${WorkTypeLabels[activeFormat.workType].toLowerCase()}.com`}
                    value={activeFormat.linkWhereToRead}
                    onChange={(e) => updateActiveFormatField('linkWhereToRead', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rodapé com Ações */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14, borderTop: '1px solid #1e293b', paddingTop: 14 }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : workToEdit ? 'Salvar Alterações' : 'Cadastrar Obra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
