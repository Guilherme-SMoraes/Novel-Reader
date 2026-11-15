import React, { useState, useEffect } from 'react';
import type { CreateWorkRequest, Genre, Language, UpdateWorkRequest, Work, WorkType } from '../types';
import { LanguageLabels, WorkTypeLabels } from '../types';
import { worksApi } from '../services/api';
import { GenreMultiSelect } from './GenreMultiSelect';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  workToEdit?: Work | null;
  genres: Genre[];
  onClose: () => void;
  onSaved: () => void;
  onOpenManageGenres?: () => void;
}

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
  const [workType, setWorkType] = useState<WorkType>(2); // Web Novel default
  const [originalLanguage, setOriginalLanguage] = useState<Language>(3); // Coreano default
  const [translatedLanguage, setTranslatedLanguage] = useState<Language | ''>('');
  const [aggregatorLink, setAggregatorLink] = useState('');
  const [linkWhereToRead, setLinkWhereToRead] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [volume, setVolume] = useState<string>('');
  const [chapter, setChapter] = useState<string>('1');
  const [transVolume, setTransVolume] = useState<string>('');
  const [transChapter, setTransChapter] = useState<string>('');
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workToEdit) {
      setTitle(workToEdit.title);
      setDescription(workToEdit.description || '');
      setWorkType(workToEdit.workType);
      setOriginalLanguage(workToEdit.originalLanguage);
      setTranslatedLanguage(workToEdit.translatedLanguage || '');
      setAggregatorLink(workToEdit.aggregatorLink);
      setLinkWhereToRead(workToEdit.linkWhereToRead || '');
      setCoverImageUrl(workToEdit.coverImageUrl || '');
      setVolume(workToEdit.totalChapter.volume ? workToEdit.totalChapter.volume.toString() : '');
      setChapter(workToEdit.totalChapter.chapter.toString());
      setTransVolume(workToEdit.translatedUpTo?.volume ? workToEdit.translatedUpTo.volume.toString() : '');
      setTransChapter(workToEdit.translatedUpTo?.chapter ? workToEdit.translatedUpTo.chapter.toString() : '');
      setSelectedGenreIds(workToEdit.genres ? workToEdit.genres.map((g) => g.id) : []);
    } else {
      setTitle('');
      setDescription('');
      setWorkType(2);
      setOriginalLanguage(3);
      setTranslatedLanguage('');
      setAggregatorLink('');
      setLinkWhereToRead('');
      setCoverImageUrl('');
      setVolume('');
      setChapter('1');
      setTransVolume('');
      setTransChapter('');
      setSelectedGenreIds([]);
    }
    setError(null);
  }, [workToEdit, isOpen]);

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

      if (workToEdit) {
        const hasTranslation = transChapter.trim() !== '';
        const req: UpdateWorkRequest = {
          title: title.trim(),
          description: description.trim() || null,
          aggregatorLink: aggregatorLink.trim(),
          linkWhereToRead: linkWhereToRead.trim() || null,
          coverImageUrl: coverImageUrl.trim() || null,
          totalChapter: {
            volume: volume ? parseInt(volume, 10) : null,
            chapter: chapterNum,
          },
          translatedUpTo: hasTranslation
            ? {
                volume: transVolume ? parseInt(transVolume, 10) : null,
                chapter: parseInt(transChapter, 10),
              }
            : null,
          translatedLanguage: translatedLanguage ? (Number(translatedLanguage) as Language) : null,
          genreIds: selectedGenreIds,
        };
        await worksApi.update(workToEdit.id, req);
      } else {
        const req: CreateWorkRequest = {
          title: title.trim(),
          description: description.trim() || null,
          workType,
          originalLanguage,
          aggregatorLink: aggregatorLink.trim(),
          linkWhereToRead: linkWhereToRead.trim() || null,
          coverImageUrl: coverImageUrl.trim() || null,
          totalChapter: {
            volume: volume ? parseInt(volume, 10) : null,
            chapter: chapterNum,
          },
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
      <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto', maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {workToEdit ? 'Editar Obra' : 'Cadastrar Nova Obra'}
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
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              Título *
            </label>
            <input
              type="text"
              required
              className="input-text"
              placeholder="Ex: Omniscient Reader's Viewpoint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              Sinopse / Descrição
            </label>
            <textarea
              className="input-text"
              rows={3}
              placeholder="Breve resumo da história..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Gêneros com Multi-Select */}
          <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
            <GenreMultiSelect
              genres={genres}
              selectedGenreIds={selectedGenreIds}
              onChange={setSelectedGenreIds}
              onOpenManageGenres={onOpenManageGenres}
            />
          </div>

          {!workToEdit && (
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  Tipo de Obra *
                </label>
                <select
                  className="input-text"
                  value={workType}
                  onChange={(e) => setWorkType(Number(e.target.value) as WorkType)}
                >
                  {Object.entries(WorkTypeLabels).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  Idioma Original *
                </label>
                <select
                  className="input-text"
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
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              URL da Imagem da Capa (opcional)
            </label>
            <input
              type="url"
              className="input-text"
              placeholder="https://exemplo.com/capa.jpg"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                Capítulo Total *
              </label>
              <input
                type="number"
                min="1"
                required
                className="input-text"
                placeholder="Ex: 551"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                Volume Total
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

          {workToEdit && (
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  Traduzido até Capítulo
                </label>
                <input
                  type="number"
                  min="0"
                  className="input-text"
                  placeholder="Ex: 250"
                  value={transChapter}
                  onChange={(e) => setTransChapter(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  Idioma da Tradução
                </label>
                <select
                  className="input-text"
                  value={translatedLanguage}
                  onChange={(e) => setTranslatedLanguage(e.target.value ? (Number(e.target.value) as Language) : '')}
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
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              Link do Agregador (NovelUpdates, AniList, etc.) *
            </label>
            <input
              type="url"
              required
              className="input-text"
              placeholder="https://novelupdates.com/series/..."
              value={aggregatorLink}
              onChange={(e) => setAggregatorLink(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              Link de Onde Você Lê (opcional)
            </label>
            <input
              type="url"
              className="input-text"
              placeholder="https://site-leitura.com/..."
              value={linkWhereToRead}
              onChange={(e) => setLinkWhereToRead(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
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
