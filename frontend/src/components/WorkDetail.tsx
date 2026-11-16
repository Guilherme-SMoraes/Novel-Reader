import React, { useState } from 'react';
import type { Attachment, Character, Progress, Work } from '../types';
import { LanguageLabels, WorkTypeLabels } from '../types';
import { ReadingJournal } from './ReadingJournal';
import { CharacterList } from './CharacterList';
import { AttachmentList } from './AttachmentList';
import { DeleteWorkModal } from './DeleteWorkModal';
import { ExternalLink, Trash2, Edit2, BookOpen, Users, Map, Maximize2 } from 'lucide-react';
import { JournalSkeleton, AttachmentGridSkeleton } from './Skeletons';
import { getActionLabel, getUnitLabel } from '../utils/formatLabels';
import { ImageLightbox } from './ImageLightbox';

interface Props {
  work: Work;
  loading?: boolean;
  progressList: Progress[];
  characters: Character[];
  attachments: Attachment[];
  onDataUpdated: () => void;
  onWorkDeleted: () => void;
  onOpenEditWork: () => void;
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
}) => {
  const [activeTab, setActiveTab] = useState<'journal' | 'characters' | 'attachments'>('journal');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showCoverLightbox, setShowCoverLightbox] = useState(false);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px', background: '#0f172a' }}>
      {/* Cabeçalho com Capa e Detalhes */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 28, alignItems: 'flex-start' }}>
        {work.coverImageUrl ? (
          <div
            onClick={() => setShowCoverLightbox(true)}
            style={{
              width: 140,
              height: 200,
              borderRadius: 10,
              backgroundImage: `url('${work.coverImageUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexShrink: 0,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
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
            style={{
              width: 140,
              height: 200,
              borderRadius: 10,
              background: '#162032',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '2.5rem',
              color: '#475569',
              border: '1px solid var(--border)',
            }}
          >
            📖
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
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

          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: 4, wordBreak: 'break-word' }}>
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
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #334155',
          marginBottom: '24px',
          paddingBottom: '2px',
        }}
      >
        <button
          onClick={() => setActiveTab('journal')}
          style={{
            display: 'flex',
            alignItems: 'center',
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
          onClick={() => setActiveTab('characters')}
          style={{
            display: 'flex',
            alignItems: 'center',
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
          onClick={() => setActiveTab('attachments')}
          style={{
            display: 'flex',
            alignItems: 'center',
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

      {/* Conteúdo da Aba Ativa */}
      {activeTab === 'journal' && (
        loading ? (
          <JournalSkeleton />
        ) : (
          <ReadingJournal
            work={work}
            progressList={progressList}
            onProgressUpdated={onDataUpdated}
          />
        )
      )}

      {activeTab === 'characters' && (
        <CharacterList
          work={work}
          characters={characters}
          loading={loading}
          onCharactersUpdated={onDataUpdated}
        />
      )}

      {activeTab === 'attachments' && (
        loading ? (
          <AttachmentGridSkeleton count={4} />
        ) : (
          <AttachmentList
            work={work}
            attachments={attachments}
            onAttachmentsUpdated={onDataUpdated}
          />
        )
      )}

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
