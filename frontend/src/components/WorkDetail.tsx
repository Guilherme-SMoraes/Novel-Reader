import React from 'react';
import type { Character, Progress, Work } from '../types';
import { LanguageLabels, WorkTypeLabels } from '../types';
import { ReadingJournal } from './ReadingJournal';
import { CharacterList } from './CharacterList';
import { ExternalLink, Trash2 } from 'lucide-react';
import { worksApi } from '../services/api';

interface Props {
  work: Work;
  progressList: Progress[];
  characters: Character[];
  onDataUpdated: () => void;
  onWorkDeleted: () => void;
}

export const WorkDetail: React.FC<Props> = ({
  work,
  progressList,
  characters,
  onDataUpdated,
  onWorkDeleted,
}) => {
  const handleDeleteWork = async () => {
    if (!confirm(`Deseja realmente excluir a obra "${work.title}" e todos os seus dados?`)) return;
    try {
      await worksApi.delete(work.id);
      onWorkDeleted();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir obra.');
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px', background: '#0f172a' }}>
      {/* Cabeçalho com Capa e Detalhes */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 28, alignItems: 'flex-start' }}>
        {work.coverImageUrl ? (
          <div
            style={{
              width: 140,
              height: 200,
              borderRadius: 10,
              backgroundImage: `url('${work.coverImageUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexShrink: 0,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            }}
          />
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
            <span className="badge badge-novel">{WorkTypeLabels[work.workType]}</span>
            <span className="badge-tag">Idioma Original: {LanguageLabels[work.originalLanguage]}</span>
            {work.translatedUpTo && (
              <span className="badge-tag" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                Traduzido até cap. {work.translatedUpTo.chapter}
              </span>
            )}
            <button
              onClick={handleDeleteWork}
              style={{ marginLeft: 'auto', color: '#f87171', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
              title="Excluir obra"
            >
              <Trash2 size={14} /> Excluir Obra
            </button>
          </div>

          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: 8, wordBreak: 'break-word' }}>
            {work.title}
          </h1>

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
            {work.linkWhereToRead && (
              <a
                href={work.linkWhereToRead}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ textDecoration: 'none', fontSize: '0.8rem' }}
              >
                Ler Online <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Seção 1: Diário de Leitura & Progresso */}
      <ReadingJournal
        work={work}
        progressList={progressList}
        onProgressUpdated={onDataUpdated}
      />

      {/* Seção 2: Personagens da Obra */}
      <CharacterList
        work={work}
        characters={characters}
        onCharactersUpdated={onDataUpdated}
      />
    </div>
  );
};
