import React, { useState, useEffect, useMemo } from 'react';
import type { Character, Work } from '../types';
import { CharacterTypeLabels, WorkTypeLabels } from '../types';
import { charactersApi } from '../services/api';
import { CharacterModal } from './CharacterModal';
import { CharacterDetailModal } from './CharacterDetailModal';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../context/ToastContext';
import { Users, Plus, Trash2, Edit2, User, ArrowUpDown, Shield, Maximize2 } from 'lucide-react';
import { CharacterGridSkeleton } from './Skeletons';
import { getUnitLabel, isWatchable } from '../utils/formatLabels';
import { ImageLightbox } from './ImageLightbox';
import { useInfiniteSlice } from '../hooks/useInfiniteScroll';
import { getActiveDraftMeta } from '../utils/formDrafts';

interface Props {
  work: Work;
  characters: Character[];
  loading?: boolean;
  onCharactersUpdated: () => void;
}

type SortOption = 'role' | 'name-asc' | 'name-desc' | 'appearance-asc' | 'appearance-desc';

export const CharacterList: React.FC<Props> = ({ work, characters, loading = false, onCharactersUpdated }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedAffiliation, setSelectedAffiliation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('role');

  const [characterSessions, setCharacterSessions] = useState<Array<{ id: string; character: Character | null }>>([]);
  const [detailCharacter, setDetailCharacter] = useState<Character | null>(null);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const activeDraft = getActiveDraftMeta();
    if (activeDraft && activeDraft.type === 'character' && activeDraft.workId === work.id) {
      if (activeDraft.mode === 'create') {
        setCharacterSessions((prev) => {
          if (prev.some((s) => s.id === activeDraft.sessionKey)) return prev;
          return [...prev, { id: activeDraft.sessionKey, character: null }];
        });
      } else if (activeDraft.mode === 'edit' && activeDraft.entityId) {
        const char = characters.find((c) => c.id === activeDraft.entityId);
        if (char) {
          setCharacterSessions((prev) => {
            if (prev.some((s) => s.id === activeDraft.sessionKey)) return prev;
            return [...prev, { id: activeDraft.sessionKey, character: char }];
          });
        }
      }
    }
  }, [work.id, characters]);

  const allAffiliations = useMemo(() => {
    const set = new Set<string>();
    characters.forEach((c) => {
      c.affiliations?.forEach((a) => set.add(a));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [characters]);

  const handleFilterChange = (val: string) => {
    setFilterQuery(val);
  };

  const handleSortChange = (val: SortOption) => {
    setSortBy(val);
  };

  const filtered = useMemo(() => {
    return characters.filter((c) => {
      if (selectedAffiliation !== 'all' && (!c.affiliations || !c.affiliations.includes(selectedAffiliation))) {
        return false;
      }
      if (!filterQuery) return true;
      const q = filterQuery.toLowerCase();
      const role = CharacterTypeLabels[c.characterType].toLowerCase();
      const matchesName = c.name.toLowerCase().includes(q);
      const matchesRole = role.includes(q);
      const matchesDesc = c.description ? c.description.toLowerCase().includes(q) : false;
      const matchesAlt = c.alternativeNames ? c.alternativeNames.some((alt) => alt.toLowerCase().includes(q)) : false;
      const matchesAff = c.affiliations ? c.affiliations.some((aff) => aff.toLowerCase().includes(q)) : false;
      return matchesName || matchesRole || matchesDesc || matchesAlt || matchesAff;
    });
  }, [characters, selectedAffiliation, filterQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'role') {
        if (a.characterType !== b.characterType) {
          return a.characterType - b.characterType;
        }
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }

      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }

      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' });
      }

      if (sortBy === 'appearance-asc') {
        const getMinChapter = (c: Character) => {
          if (!c.firstAppearances || c.firstAppearances.length === 0) return 999999;
          return Math.min(...c.firstAppearances.map((app) => app.chapter.chapter));
        };
        const diff = getMinChapter(a) - getMinChapter(b);
        return diff !== 0 ? diff : a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }

      if (sortBy === 'appearance-desc') {
        const getMaxChapter = (c: Character) => {
          if (!c.firstAppearances || c.firstAppearances.length === 0) return -1;
          return Math.max(...c.firstAppearances.map((app) => app.chapter.chapter));
        };
        const diff = getMaxChapter(b) - getMaxChapter(a);
        return diff !== 0 ? diff : a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }

      return 0;
    });
  }, [filtered, sortBy]);

  const {
    visibleItems: visibleCharacters,
    totalCount: totalItems,
    hasMore,
    isLoadingMore,
    sentinelRef,
  } = useInfiniteSlice({
    items: sorted,
    batchSize: 28,
    resetDeps: [filterQuery, selectedAffiliation, sortBy],
  });

  const handleConfirmDelete = async () => {
    if (!characterToDelete) return;
    await charactersApi.delete(work.id, characterToDelete.id);
    showToast(`Personagem "${characterToDelete.name}" excluído com sucesso.`, 'info');
    onCharactersUpdated();
    setCharacterToDelete(null);
  };

  const handleOpenCreate = () => {
    const sessionId = `char-create-${Date.now()}`;
    setCharacterSessions((prev) => [...prev, { id: sessionId, character: null }]);
  };

  const handleOpenEdit = (character: Character) => {
    const sessionId = `char-edit-${character.id}`;
    setCharacterSessions((prev) => {
      if (prev.some((s) => s.id === sessionId)) return prev;
      return [...prev, { id: sessionId, character }];
    });
  };

  const handleCloseSession = (sessionId: string) => {
    setCharacterSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  return (
    <section>
      {/* Header Desktop com Busca, Ordenação e Botão de Adicionar */}
      <div className="desktop-only" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={18} color="#38bdf8" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Personagens da Obra ({filterQuery ? `${totalItems} de ${characters.length}` : characters.length})
          </h3>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => handleFilterChange(e.target.value)}
            placeholder="🔍 Filtrar por nome ou papel..."
            style={{ width: 210, padding: '6px 10px', fontSize: '0.8rem' }}
          />

          {allAffiliations.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Shield size={14} color="#c084fc" />
              <select
                value={selectedAffiliation}
                onChange={(e) => setSelectedAffiliation(e.target.value)}
                style={{
                  padding: '6px 8px',
                  fontSize: '0.8rem',
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  maxWidth: 160,
                }}
                title="Filtrar por grupo / afiliação"
              >
                <option value="all">Todas Afiliações</option>
                {allAffiliations.map((aff) => (
                  <option key={aff} value={aff}>
                    {aff}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowUpDown size={14} color="#94a3b8" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              style={{
                padding: '6px 8px',
                fontSize: '0.8rem',
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: 6,
                cursor: 'pointer',
              }}
              title="Critério de ordenação"
            >
              <option value="role">Papel (Peso)</option>
              <option value="name-asc">Nome (A - Z)</option>
              <option value="name-desc">Nome (Z - A)</option>
              <option value="appearance-asc">1ª Aparição (Crescente)</option>
              <option value="appearance-desc">1ª Aparição (Decrescente)</option>
            </select>
          </div>

          <button onClick={handleOpenCreate} className="btn-primary" style={{ padding: '6px 12px' }}>
            <Plus size={14} /> Personagem
          </button>
        </div>
      </div>

      {/* Header Mobile com Busca, Filtros e Botão '+' compacto */}
      <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Personagens ({filterQuery ? `${totalItems} de ${characters.length}` : characters.length})
            </h3>
          </div>
          <button onClick={handleOpenCreate} className="btn-primary" title="Adicionar Personagem" style={{ padding: '6px 12px' }}>
            <Plus size={16} />
          </button>
        </div>

        <input
          type="text"
          value={filterQuery}
          onChange={(e) => handleFilterChange(e.target.value)}
          placeholder="🔍 Filtrar por nome ou papel..."
          style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: allAffiliations.length > 0 ? '1fr 1fr' : '1fr', gap: 8 }}>
          {allAffiliations.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={14} color="#c084fc" style={{ flexShrink: 0 }} />
              <select
                value={selectedAffiliation}
                onChange={(e) => setSelectedAffiliation(e.target.value)}
                style={{
                  padding: '7px 10px',
                  fontSize: '0.82rem',
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  width: '100%',
                }}
                title="Filtrar por grupo / afiliação"
              >
                <option value="all">Todas Afiliações</option>
                {allAffiliations.map((aff) => (
                  <option key={aff} value={aff}>
                    {aff}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowUpDown size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              style={{
                padding: '7px 10px',
                fontSize: '0.82rem',
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: 6,
                cursor: 'pointer',
                width: '100%',
              }}
              title="Critério de ordenação"
            >
              <option value="role">Papel (Peso)</option>
              <option value="name-asc">Nome (A - Z)</option>
              <option value="name-desc">Nome (Z - A)</option>
              <option value="appearance-asc">1ª Aparição (Crescente)</option>
              <option value="appearance-desc">1ª Aparição (Decrescente)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Personagens */}
      {loading ? (
        <CharacterGridSkeleton count={12} />
      ) : visibleCharacters.length === 0 ? (
        <div style={{ background: '#121927', border: '1px dashed var(--border)', borderRadius: 10, padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {characters.length === 0 ? 'Nenhum personagem cadastrado para esta obra.' : 'Nenhum personagem corresponde ao filtro informado.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: 16 }}>
          {visibleCharacters.map((c) => {
            const isHovered = hoveredCardId === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setDetailCharacter(c)}
                onMouseEnter={() => setHoveredCardId(c.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                style={{
                  background: isHovered ? '#1b283d' : '#182234',
                  border: isHovered ? '1px solid #38bdf8' : '1px solid var(--border)',
                  borderRadius: 10,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: 330,
                  cursor: 'pointer',
                  transform: isHovered ? 'translateY(-2px)' : 'none',
                  boxShadow: isHovered ? '0 8px 20px rgba(0, 0, 0, 0.35)' : 'none',
                  transition: 'transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {/* Foto ou Avatar Placeholder */}
                <div style={{ height: 145, position: 'relative', background: '#0c121e', flexShrink: 0 }}>
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center top',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                      <User size={48} />
                    </div>
                  )}
                  {/* Badge de Papel */}
                  <span
                    className="badge badge-novel"
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      fontSize: '0.65rem',
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {CharacterTypeLabels[c.characterType]}
                  </span>

                  {/* Ações: Editar e Excluir */}
                  <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
                    {c.imageUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage({ url: c.imageUrl!, title: c.name });
                        }}
                        style={{
                          background: 'rgba(0,0,0,0.6)',
                          color: '#38bdf8',
                          borderRadius: 4,
                          padding: 4,
                          cursor: 'pointer',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Ampliar foto do personagem"
                      >
                        <Maximize2 size={13} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(c);
                      }}
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        color: '#94a3b8',
                        borderRadius: 4,
                        padding: 4,
                        cursor: 'pointer',
                        border: 'none',
                      }}
                      title="Editar personagem"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCharacterToDelete(c);
                      }}
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        color: '#f87171',
                        borderRadius: 4,
                        padding: 4,
                        cursor: 'pointer',
                        border: 'none',
                      }}
                      title="Excluir personagem"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Informações */}
                <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.name}
                  </div>

                  {/* Apelidos (linha única) */}
                  {c.alternativeNames && c.alternativeNames.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        margin: '2px 0 4px 0',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.alternativeNames.slice(0, 2).map((alt, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.66rem',
                            background: 'rgba(56, 189, 248, 0.1)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            borderRadius: 4,
                            padding: '1px 5px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 80,
                          }}
                          title={alt}
                        >
                          {alt}
                        </span>
                      ))}
                      {c.alternativeNames.length > 2 && (
                        <span
                          style={{
                            fontSize: '0.64rem',
                            color: '#64748b',
                            padding: '1px 3px',
                          }}
                          title={c.alternativeNames.slice(2).join(', ')}
                        >
                          +{c.alternativeNames.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Afiliações / Grupos (linha única) */}
                  {c.affiliations && c.affiliations.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        margin: '1px 0 4px 0',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Shield size={11} color="#c084fc" style={{ flexShrink: 0 }} />
                      {c.affiliations.slice(0, 2).map((aff, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.66rem',
                            background: 'rgba(168, 85, 247, 0.1)',
                            color: '#c084fc',
                            border: '1px solid rgba(168, 85, 247, 0.25)',
                            borderRadius: 4,
                            padding: '1px 5px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 85,
                          }}
                          title={aff}
                        >
                          {aff}
                        </span>
                      ))}
                      {c.affiliations.length > 2 && (
                        <span
                          style={{
                            fontSize: '0.64rem',
                            color: '#64748b',
                            padding: '1px 3px',
                          }}
                          title={c.affiliations.slice(2).join(', ')}
                        >
                          +{c.affiliations.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Primeira Aparição (linha única compacta com separador bullet) */}
                  {c.firstAppearances && c.firstAppearances.length > 0 && (
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: '#94a3b8',
                        background: '#0f172a',
                        padding: '3px 6px',
                        borderRadius: 4,
                        border: '1px solid #1e293b',
                        margin: '2px 0 6px 0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        flexShrink: 0,
                      }}
                      title={c.firstAppearances
                        .map((app) => `${WorkTypeLabels[app.workType]}: ${getUnitLabel(app.workType, { short: true })} ${app.chapter.chapter}${app.chapter.volume ? ` (${isWatchable(app.workType) ? 'Temp.' : 'Vol.'} ${app.chapter.volume})` : ''}`)
                        .join(' • ')}
                    >
                      {c.firstAppearances.map((app, idx) => (
                        <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          {idx > 0 && <span style={{ color: '#475569', margin: '0 2px' }}>•</span>}
                          <strong style={{ color: '#38bdf8' }}>{WorkTypeLabels[app.workType]}:</strong>
                          <span>{getUnitLabel(app.workType, { short: true })} {app.chapter.chapter}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Descrição logo após os metadados */}
                  {c.description ? (
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: '#cbd5e1',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: c.alternativeNames?.length && c.affiliations?.length ? 2 : 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: 2,
                      }}
                    >
                      {c.description}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 }}>
                      Sem descrição cadastrada.
                    </div>
                  )}

                  {/* Link no rodapé do card */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 4,
                      fontSize: '0.72rem',
                      color: '#38bdf8',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    Ver ficha completa &rarr;
                  </div>
                </div>
              </div>
            );
          })}
          {isLoadingMore && <CharacterGridSkeleton count={7} inline />}
        </div>
      )}

      {/* Footer com Status do Infinite Scroll */}
      {!loading && sorted.length > 0 && (
        <div style={{ marginTop: 24, textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
          {hasMore && (
            <div ref={sentinelRef} style={{ height: 20, width: '100%' }} />
          )}
          {!hasMore && (
            <div style={{ padding: '14px 0', borderTop: '1px solid #1e293b' }}>
              <span>Exibindo todos os <strong>{totalItems}</strong> personagens</span>
            </div>
          )}
        </div>
      )}

      {/* Sessões de Criação / Edição de Personagens (Suporte Multi-Sessão & Minimização) */}
      {characterSessions.map((session) => (
        <CharacterModal
          key={session.id}
          sessionId={session.id}
          isOpen={true}
          workId={work.id}
          formats={work.formats || []}
          characterToEdit={session.character}
          existingAffiliations={allAffiliations}
          onClose={(tagsModified) => {
            handleCloseSession(session.id);
            if (tagsModified) {
              onCharactersUpdated();
            }
          }}
          onSaved={(savedChar) => {
            onCharactersUpdated();
            handleCloseSession(session.id);
            setDetailCharacter(savedChar);
          }}
        />
      ))}

      {/* Modal de Detalhes / Leitura do Personagem */}
      <CharacterDetailModal
        isOpen={!!detailCharacter}
        character={detailCharacter}
        onClose={() => setDetailCharacter(null)}
        onEdit={(char) => {
          setDetailCharacter(null);
          handleOpenEdit(char);
        }}
      />

      {characterToDelete && (
        <ConfirmModal
          isOpen={!!characterToDelete}
          title="Excluir Personagem"
          message={`Deseja realmente excluir o personagem "${characterToDelete.name}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir Personagem"
          onConfirm={handleConfirmDelete}
          onCancel={() => setCharacterToDelete(null)}
        />
      )}

      {lightboxImage && (
        <ImageLightbox
          imageUrl={lightboxImage.url}
          title={lightboxImage.title}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </section>
  );
};
