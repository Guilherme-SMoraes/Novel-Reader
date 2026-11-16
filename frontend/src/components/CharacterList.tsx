import React, { useState } from 'react';
import type { Character, Work } from '../types';
import { CharacterTypeLabels, WorkTypeLabels } from '../types';
import { charactersApi } from '../services/api';
import { CharacterModal } from './CharacterModal';
import { CharacterDetailModal } from './CharacterDetailModal';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../context/ToastContext';
import { Users, Plus, Trash2, Edit2, User, ArrowUpDown } from 'lucide-react';

interface Props {
  work: Work;
  characters: Character[];
  onCharactersUpdated: () => void;
}

type SortOption = 'role' | 'name-asc' | 'name-desc' | 'appearance-asc' | 'appearance-desc';

export const CharacterList: React.FC<Props> = ({ work, characters, onCharactersUpdated }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('role');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [detailCharacter, setDetailCharacter] = useState<Character | null>(null);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleFilterChange = (val: string) => {
    setFilterQuery(val);
    setCurrentPage(1);
  };

  const handleSortChange = (val: SortOption) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (val: number) => {
    setPageSize(val);
    setCurrentPage(1);
  };

  const filtered = characters.filter((c) => {
    const q = filterQuery.toLowerCase();
    const role = CharacterTypeLabels[c.characterType].toLowerCase();
    const matchesName = c.name.toLowerCase().includes(q);
    const matchesRole = role.includes(q);
    const matchesDesc = c.description ? c.description.toLowerCase().includes(q) : false;
    const matchesAlt = c.alternativeNames ? c.alternativeNames.some((alt) => alt.toLowerCase().includes(q)) : false;
    return matchesName || matchesRole || matchesDesc || matchesAlt;
  });

  const sorted = [...filtered].sort((a, b) => {
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

  const totalItems = sorted.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedCharacters = sorted.slice(startIndex, endIndex);

  const handleConfirmDelete = async () => {
    if (!characterToDelete) return;
    await charactersApi.delete(work.id, characterToDelete.id);
    showToast(`Personagem "${characterToDelete.name}" excluído com sucesso.`, 'info');
    onCharactersUpdated();
    setCharacterToDelete(null);
  };

  const handleOpenCreate = () => {
    setEditingCharacter(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (character: Character) => {
    setEditingCharacter(character);
    setIsModalOpen(true);
  };

  return (
    <section>
      {/* Header com Busca, Ordenação e Botão de Adicionar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
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

      {/* Grid de Personagens */}
      {paginatedCharacters.length === 0 ? (
        <div style={{ background: '#121927', border: '1px dashed var(--border)', borderRadius: 10, padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {characters.length === 0 ? 'Nenhum personagem cadastrado para esta obra.' : 'Nenhum personagem corresponde ao filtro informado.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
          {paginatedCharacters.map((c) => {
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
                  height: 380,
                  cursor: 'pointer',
                  transform: isHovered ? 'translateY(-2px)' : 'none',
                  boxShadow: isHovered ? '0 8px 20px rgba(0, 0, 0, 0.35)' : 'none',
                  transition: 'transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {/* Foto ou Avatar Placeholder */}
                <div style={{ height: 160, position: 'relative', background: '#0c121e', flexShrink: 0 }}>
                  {c.imageUrl ? (
                    <div style={{ width: '100%', height: '100%', backgroundImage: `url('${c.imageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center top' }} />
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
                <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.name}
                  </div>

                  {c.alternativeNames && c.alternativeNames.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '4px 0 6px 0', maxHeight: 42, overflow: 'hidden' }}>
                      {c.alternativeNames.map((alt, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.68rem',
                            background: 'rgba(56, 189, 248, 0.1)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            borderRadius: 4,
                            padding: '1px 5px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {alt}
                        </span>
                      ))}
                    </div>
                  )}

                  {c.firstAppearances && c.firstAppearances.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6, maxHeight: 40, overflow: 'hidden' }}>
                      {c.firstAppearances.map((app, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.72rem',
                            color: '#94a3b8',
                            background: '#0f172a',
                            padding: '2px 6px',
                            borderRadius: 4,
                            border: '1px solid #1e293b',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <strong style={{ color: '#38bdf8' }}>{WorkTypeLabels[app.workType]}:</strong> Cap. {app.chapter.chapter}
                          {app.chapter.volume && ` (Vol. ${app.chapter.volume})`}
                        </span>
                      ))}
                    </div>
                  )}

                  {c.description ? (
                    <div style={{ marginTop: 'auto' }}>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#cbd5e1',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {c.description}
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: '#38bdf8',
                          fontWeight: 600,
                          marginTop: 4,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        Ver ficha completa &rarr;
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 'auto' }}>
                      Sem descrição cadastrada.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Controles de Paginação */}
      {totalItems > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid #1e293b',
            fontSize: '0.85rem',
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>
              Exibindo <strong>{startIndex + 1}–{endIndex}</strong> de <strong>{totalItems}</strong> personagens
            </span>
            <span style={{ color: '#475569' }}>|</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Por página:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                style={{
                  padding: '3px 8px',
                  fontSize: '0.8rem',
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                className="btn-secondary"
                style={{
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                  opacity: validCurrentPage === 1 ? 0.4 : 1,
                  cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer',
                }}
                title="Primeira Página"
              >
                &laquo;
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
                className="btn-secondary"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  opacity: validCurrentPage === 1 ? 0.4 : 1,
                  cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer',
                }}
                title="Página Anterior"
              >
                &lsaquo;
              </button>

              <span style={{ padding: '0 8px', fontWeight: 600, color: '#f8fafc' }}>
                Página {validCurrentPage} de {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage === totalPages}
                className="btn-secondary"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  opacity: validCurrentPage === totalPages ? 0.4 : 1,
                  cursor: validCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                }}
                title="Próxima Página"
              >
                &rsaquo;
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage === totalPages}
                className="btn-secondary"
                style={{
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                  opacity: validCurrentPage === totalPages ? 0.4 : 1,
                  cursor: validCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                }}
                title="Última Página"
              >
                &raquo;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <CharacterModal
        isOpen={isModalOpen}
        workId={work.id}
        formats={work.formats || []}
        characterToEdit={editingCharacter}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCharacter(null);
        }}
        onSaved={onCharactersUpdated}
      />

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
    </section>
  );
};
