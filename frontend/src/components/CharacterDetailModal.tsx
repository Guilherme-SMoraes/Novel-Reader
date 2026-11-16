import React from 'react';
import type { Character } from '../types';
import { CharacterTypeLabels, WorkTypeLabels } from '../types';
import { MarkdownViewer } from './MarkdownViewer';
import { X, Edit2, User, BookOpen } from 'lucide-react';

interface Props {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (character: Character) => void;
}

export const CharacterDetailModal: React.FC<Props> = ({ character, isOpen, onClose, onEdit }) => {
  if (!isOpen || !character) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: 12,
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#111c30',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={20} color="#38bdf8" />
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#94a3b8' }}>
              Ficha do Personagem
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => onEdit(character)}
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                fontSize: '0.8rem',
              }}
              title="Editar dados deste personagem"
            >
              <Edit2 size={13} /> Editar
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: 20,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Informações Principais (Avatar + Título + Badges) */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: 10,
                overflow: 'hidden',
                background: '#090e17',
                border: '1px solid #1e293b',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {character.imageUrl ? (
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <User size={42} color="#475569" />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc' }}>
                  {character.name}
                </h2>
                <span
                  className="badge badge-novel"
                  style={{
                    fontSize: '0.72rem',
                    background: '#1e293b',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    padding: '2px 8px',
                  }}
                >
                  {CharacterTypeLabels[character.characterType]}
                </span>
              </div>

              {/* Nomes Alternativos */}
              {character.alternativeNames && character.alternativeNames.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center' }}>
                    Outros nomes:
                  </span>
                  {character.alternativeNames.map((alt, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.72rem',
                        background: 'rgba(56, 189, 248, 0.1)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        borderRadius: 4,
                        padding: '2px 7px',
                      }}
                    >
                      {alt}
                    </span>
                  ))}
                </div>
              )}

              {/* Primeira Aparição */}
              {character.firstAppearances && character.firstAppearances.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center' }}>
                    1ª Aparição:
                  </span>
                  {character.firstAppearances.map((app, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.75rem',
                        color: '#cbd5e1',
                        background: '#1e293b',
                        padding: '2px 8px',
                        borderRadius: 4,
                        border: '1px solid #334155',
                      }}
                    >
                      <strong style={{ color: '#38bdf8' }}>{WorkTypeLabels[app.workType]}:</strong> Cap. {app.chapter.chapter}
                      {app.chapter.volume && ` (Vol. ${app.chapter.volume})`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Descrição Completa */}
          <div style={{ marginTop: 8 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Descrição e Notas
            </h4>
            <div
              style={{
                background: '#090e17',
                border: '1px solid #1e293b',
                borderRadius: 8,
                padding: '14px 16px',
                maxHeight: '400px',
                overflowY: 'auto',
                lineHeight: 1.6,
              }}
            >
              {character.description ? (
                <MarkdownViewer content={character.description} />
              ) : (
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                  Nenhuma descrição cadastrada para este personagem.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'flex-end',
            background: '#111c30',
          }}
        >
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px 16px' }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
