import React, { useState, useEffect, useRef } from 'react';
import type { Attachment, Character, Progress, Work } from '../types';
import { LanguageLabels, WorkTypeLabels } from '../types';
import { ReadingJournal } from './ReadingJournal';
import { CharacterList } from './CharacterList';
import { AttachmentList } from './AttachmentList';
import { DeleteWorkModal } from './DeleteWorkModal';
import { ExternalLink, Trash2, Edit2, BookOpen, Users, Map, Maximize2, ArrowLeft } from 'lucide-react';
import { JournalSkeleton, AttachmentGridSkeleton } from './Skeletons';
import { getActionLabel, getUnitLabel } from '../utils/formatLabels';
import { ImageLightbox } from './ImageLightbox';
import { getNavParams, updateNavParams, saveScrollPosition, getSavedScrollPosition } from '../utils/navigationState';
import type { NavTab } from '../utils/navigationState';

interface Props {
  work: Work;
  loading?: boolean;
  progressList: Progress[];
  characters: Character[];
  attachments: Attachment[];
  onDataUpdated: () => void;
  onWorkDeleted: () => void;
  onOpenEditWork: () => void;
  onBackToLibrary?: () => void;
}

export const WorkDetail: React.FC<Props> = ({
  work,
  loading = false,
  progressList,
  characters,
  attachments,
  onDataUpdated,
  onWorkDeleted,
  onOpenEditWork,
  onBackToLibrary,
}) => {
  const [activeTab, setActiveTab] = useState<NavTab>(() => getNavParams().tab);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showCoverLightbox, setShowCoverLightbox] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    updateNavParams({ tab });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    scrollDebounceRef.current = setTimeout(() => {
      saveScrollPosition(work.id, target.scrollTop);
    }, 150);
  };

  useEffect(() => {
    if (!loading && containerRef.current) {
      const savedTop = getSavedScrollPosition(work.id);
      if (savedTop > 0) {
        containerRef.current.scrollTop = savedTop;
      }
    }
  }, [work.id, loading]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (containerRef.current) {
        saveScrollPosition(work.id, containerRef.current.scrollTop);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    };
  }, [work.id]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ flex: 1, overflowY: 'auto', padding: 'clamp(14px, 3vw, 36px)', background: '#0f172a' }}
    >
      {/* Botão de Retorno Mobile */}
      {onBackToLibrary && (
        <div style={{ marginBottom: 14 }} className="mobile-only">
          <button
            type="button"
            onClick={onBackToLibrary}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> Voltar para Biblioteca
          </button>
        </div>
      )}

      {/* Cabeçalho com Capa e Detalhes */}
      <div className="work-header-container">
        {work.coverImageUrl ? (
          <div
            onClick={() => setShowCoverLightbox(true)}
            className="work-header-cover"
            style={{
              backgroundImage: `url('${work.coverImageUrl}')`,
            }}
            title="Clique para ampliar a capa"
          >
            <div
              style={{
                position: 'absolute',
                bottom: 6,
                right: 6,
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(4px)',
                borderRadius: 4,
                padding: '3px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: '#f8fafc',
                fontSize: '0.68rem',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Maximize2 size={11} /> Ampliar
            </div>
          </div>
        ) : (
          <div
            className="work-header-cover"
            style={{
              background: '#162032',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              color: '#475569',
              border: '1px solid var(--border)',
            }}
          >
            📖
          </div>
        )}

        <div className="work-header-content">
          <div className="work-header-badges" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
            {work.formats && work.formats.length > 0 ? (
              work.formats.map((f) => (
                <span key={f.workType} className="badge badge-novel">
                  {WorkTypeLabels[f.workType]} ({f.totalChapter.chapter} {getUnitLabel(f.workType, { plural: true, short: true }).toLowerCase()})
                </span>
              ))
            ) : (
              <span className="badge badge-novel">Obra</span>
            )}
            <span className="badge-tag">Idioma Original: {LanguageLabels[work.originalLanguage]}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={onOpenEditWork}
                style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}
                title="Editar obra"
              >
                <Edit2 size={14} /> Editar Obra
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}
                title="Excluir obra"
              >
                <Trash2 size={14} /> Excluir Obra
              </button>
            </div>
          </div>

          <h1 className="work-header-title" style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: 4, wordBreak: 'break-word' }}>
            {work.title}
          </h1>

          {work.alternativeTitles && work.alternativeTitles.length > 0 && (
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 10, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ color: '#64748b', fontStyle: 'normal' }}>Também conhecido como:</span>
              <span>{work.alternativeTitles.join(' • ')}</span>
            </div>
          )}

          {work.genres && work.genres.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {work.genres.map((g) => (
                <span
                  key={g.id}
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: '#1e293b',
                    color: '#38bdf8',
                    border: '1px solid #334155',
                  }}
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {work.description && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: 16 }}>
              {work.description}
            </p>
          )}

          {/* Links e Ações */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {work.aggregatorLink && (
              <a
                href={work.aggregatorLink}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ textDecoration: 'none', fontSize: '0.8rem' }}
              >
                Agregador <ExternalLink size={13} />
              </a>
            )}
            {work.formats &&
              work.formats
                .filter((f) => f.linkWhereToRead)
                .map((f) => (
                  <a
                    key={f.workType}
                    href={f.linkWhereToRead!}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                    style={{ textDecoration: 'none', fontSize: '0.8rem' }}
                  >
                    {getActionLabel(f.workType)} {WorkTypeLabels[f.workType]} <ExternalLink size={13} />
                  </a>
                ))}
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div
        className="scroll-touch"
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #334155',
          marginBottom: '24px',
          paddingBottom: '2px',
          whiteSpace: 'nowrap',
        }}
      >
        <button
          onClick={() => handleTabChange('journal')}
          style={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            gap: '8px',
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'journal' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'journal' ? '#60a5fa' : '#94a3b8',
            fontWeight: activeTab === 'journal' ? 600 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.15s ease',
          }}
        >
          <BookOpen size={18} /> Diário de Acompanhamento
          <span style={{ fontSize: '0.75rem', background: '#1e293b', padding: '2px 8px', borderRadius: '10px', color: '#cbd5e1' }}>
            {progressList.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('characters')}
          style={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            gap: '8px',
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'characters' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'characters' ? '#60a5fa' : '#94a3b8',
            fontWeight: activeTab === 'characters' ? 600 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.15s ease',
          }}
        >
          <Users size={18} /> Personagens
          <span style={{ fontSize: '0.75rem', background: '#1e293b', padding: '2px 8px', borderRadius: '10px', color: '#cbd5e1' }}>
            {characters.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('attachments')}
          style={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            gap: '8px',
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'attachments' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'attachments' ? '#60a5fa' : '#94a3b8',
            fontWeight: activeTab === 'attachments' ? 600 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.15s ease',
          }}
        >
          <Map size={18} /> Anexos & Lore
          <span style={{ fontSize: '0.75rem', background: '#1e293b', padding: '2px 8px', borderRadius: '10px', color: '#cbd5e1' }}>
            {attachments.length}
          </span>
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div style={{ display: activeTab === 'journal' ? 'block' : 'none' }}>
        {loading ? (
          <JournalSkeleton />
        ) : (
          <ReadingJournal
            work={work}
            progressList={progressList}
            onProgressUpdated={onDataUpdated}
          />
        )}
      </div>

      <div style={{ display: activeTab === 'characters' ? 'block' : 'none' }}>
        <CharacterList
          work={work}
          characters={characters}
          loading={loading}
          onCharactersUpdated={onDataUpdated}
        />
      </div>

      <div style={{ display: activeTab === 'attachments' ? 'block' : 'none' }}>
        {loading ? (
          <AttachmentGridSkeleton count={4} />
        ) : (
          <AttachmentList
            work={work}
            attachments={attachments}
            onAttachmentsUpdated={onDataUpdated}
          />
        )}
      </div>

      {isDeleteModalOpen && (
        <DeleteWorkModal
          isOpen={isDeleteModalOpen}
          work={work}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={onWorkDeleted}
        />
      )}

      {showCoverLightbox && work.coverImageUrl && (
        <ImageLightbox
          imageUrl={work.coverImageUrl}
          title={work.title}
          onClose={() => setShowCoverLightbox(false)}
        />
      )}
    </div>
  );
};
