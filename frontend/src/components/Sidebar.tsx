import React, { useState } from 'react';
import type { Genre, ReadingStatus, Work, WorkType } from '../types';
import { WorkTypeLabels } from '../types';
import { SlidersHorizontal, Plus, BookOpen, LogOut, ShieldCheck } from 'lucide-react';
import { SidebarWorksSkeleton } from './Skeletons';
import { getUnitLabel } from '../utils/formatLabels';
import { useAuth } from '../context/AuthContext';
import { useInfiniteTrigger } from '../hooks/useInfiniteScroll';
import { ManageWhitelistModal } from './ManageWhitelistModal';

interface Props {
  works: Work[];
  loading?: boolean;
  selectedWorkId: string | null;
  onSelectWork: (id: string) => void;
  onOpenCreateWork: () => void;
  genres: Genre[];
  searchTitle: string;
  onSearchTitleChange: (v: string) => void;
  selectedStatus: ReadingStatus | null;
  onStatusChange: (s: ReadingStatus | null) => void;
  selectedType: WorkType | null;
  onTypeChange: (t: WorkType | null) => void;
  selectedGenreId: string | null;
  onGenreChange: (g: string | null) => void;
  onResetFilters: () => void;
  onOpenManageGenres?: () => void;
  isMobile?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export const Sidebar: React.FC<Props> = ({
  works,
  loading = false,
  selectedWorkId,
  onSelectWork,
  onOpenCreateWork,
  genres,
  searchTitle,
  onSearchTitleChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  selectedGenreId,
  onGenreChange,
  onResetFilters,
  onOpenManageGenres,
  isMobile = false,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}) => {
  const { user, logout } = useAuth();
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [isWhitelistOpen, setIsWhitelistOpen] = useState(false);

  const { sentinelRef } = useInfiniteTrigger({
    onIntersect: onLoadMore || (() => {}),
    hasMore,
    isLoading: loadingMore,
  });

  const activeFiltersCount = (selectedType ? 1 : 0) + (selectedGenreId ? 1 : 0);

  return (
    <aside style={{ width: isMobile ? '100%' : 330, maxWidth: '100%', background: '#0c121e', borderRight: isMobile ? 'none' : '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100dvh', flexShrink: 0 }}>
      {/* Top Header */}
      <div style={{ padding: '16px 16px 10px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={20} color="#8b5cf6" />
            <h1 style={{ fontSize: '1.05rem', fontWeight: 800, background: 'linear-gradient(135deg, #a855f7, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              NovelReader
            </h1>
          </div>
          <button onClick={onOpenCreateWork} className="btn-primary" style={{ padding: '5px 10px', fontSize: '0.78rem' }}>
            <Plus size={14} /> Obra
          </button>
        </div>

        {/* Linha de busca + Botão de Filtros */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <input
            type="text"
            value={searchTitle}
            onChange={(e) => onSearchTitleChange(e.target.value)}
            placeholder="🔍 Buscar obras..."
            style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem' }}
          />
          <button
            onClick={() => setShowFiltersPopover(!showFiltersPopover)}
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.78rem', position: 'relative' }}
            title="Filtros adicionais"
          >
            <SlidersHorizontal size={14} />
            {activeFiltersCount > 0 && (
              <span className="badge" style={{ position: 'absolute', top: -5, right: -5, background: 'var(--primary)', padding: '1px 5px', fontSize: '0.62rem' }}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Pílulas Rápidas de Status */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
          <button
            onClick={() => onStatusChange(null)}
            className="btn-secondary"
            style={{
              padding: '3px 8px',
              fontSize: '0.72rem',
              background: selectedStatus === null ? '#3b82f6' : '#1e293b',
              color: '#fff',
            }}
          >
            Todas
          </button>
          <button
            onClick={() => onStatusChange(1)}
            className="btn-secondary"
            style={{
              padding: '3px 8px',
              fontSize: '0.72rem',
              background: selectedStatus === 1 ? '#3b82f6' : '#1e293b',
              color: '#fff',
            }}
          >
            Lendo
          </button>
          <button
            onClick={() => onStatusChange(2)}
            className="btn-secondary"
            style={{
              padding: '3px 8px',
              fontSize: '0.72rem',
              background: selectedStatus === 2 ? '#3b82f6' : '#1e293b',
              color: '#fff',
            }}
          >
            Concluído
          </button>
          <button
            onClick={() => onStatusChange(3)}
            className="btn-secondary"
            style={{
              padding: '3px 8px',
              fontSize: '0.72rem',
              background: selectedStatus === 3 ? '#3b82f6' : '#1e293b',
              color: '#fff',
            }}
          >
            Pausado
          </button>
        </div>

        {/* Popover Expansível de Tipo e Gênero */}
        {showFiltersPopover && (
          <div style={{ background: '#121927', border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1' }}>Filtros Avançados</span>
              <button onClick={onResetFilters} style={{ fontSize: '0.7rem', color: '#f87171' }}>Limpar</button>
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Tipo de Obra</label>
              <select
                value={selectedType || ''}
                onChange={(e) => onTypeChange(e.target.value ? (Number(e.target.value) as WorkType) : null)}
                style={{ width: '100%', padding: '4px 8px', fontSize: '0.75rem' }}
              >
                <option value="">Todos os Tipos</option>
                {Object.entries(WorkTypeLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gênero</label>
                {onOpenManageGenres && (
                  <button
                    type="button"
                    onClick={onOpenManageGenres}
                    style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.68rem', cursor: 'pointer', padding: 0 }}
                  >
                    Gerenciar
                  </button>
                )}
              </div>
              <select
                value={selectedGenreId || ''}
                onChange={(e) => onGenreChange(e.target.value || null)}
                style={{ width: '100%', padding: '4px 8px', fontSize: '0.75rem' }}
              >
                <option value="">Todos os Gêneros</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Obras */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && works.length === 0 ? (
          <SidebarWorksSkeleton count={5} />
        ) : works.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Nenhuma obra encontrada.
          </div>
        ) : (
          works.map((w) => {
            const isSelected = w.id === selectedWorkId;
            return (
              <div
                key={w.id}
                onClick={() => onSelectWork(w.id)}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: 10,
                  borderRadius: 8,
                  background: isSelected ? '#1e2238' : '#162032',
                  border: isSelected ? '1px solid #8b5cf6' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {w.coverImageUrl ? (
                  <img
                    src={w.coverImageUrl}
                    alt={w.title}
                    loading="lazy"
                    decoding="async"
                    style={{ width: 50, height: 70, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 50, height: 70, borderRadius: 4, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.2rem', color: '#64748b' }}>
                    📖
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {w.title}
                  </div>
                  <div style={{ display: 'flex', gap: 4, margin: '4px 0', flexWrap: 'wrap' }}>
                    {w.formats && w.formats.length > 0 ? (
                      w.formats.map((f) => (
                        <span key={f.workType} className="badge badge-novel" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                          {WorkTypeLabels[f.workType]}
                        </span>
                      ))
                    ) : (
                      <span className="badge badge-novel" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                        Obra
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {w.formats && w.formats.length > 0 ? (
                      w.formats.map((f) => `${WorkTypeLabels[f.workType]}: ${f.totalChapter.chapter} ${getUnitLabel(f.workType, { plural: true, short: true }).toLowerCase()}`).join(' • ')
                    ) : (
                      'Sem formatos'
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {loadingMore && <SidebarWorksSkeleton count={3} />}
        {hasMore && (
          <div ref={sentinelRef} style={{ height: 20, width: '100%' }} />
        )}
      </div>

      {/* Rodapé com Informações do Usuário e Botão Sair */}
      {user && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#090e17' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {user.role === 'Admin' && (
              <button
                type="button"
                onClick={() => setIsWhitelistOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease',
                }}
                title="Gerenciar Acessos (Whitelist)"
              >
                <ShieldCheck size={18} />
              </button>
            )}
            <button
              onClick={logout}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Sair da Conta"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}

      {isWhitelistOpen && (
        <ManageWhitelistModal
          isOpen={isWhitelistOpen}
          onClose={() => setIsWhitelistOpen(false)}
        />
      )}
    </aside>
  );
};
