import React, { useState } from 'react';
import type { Genre, ReadingStatus, Work, WorkType } from '../types';
import { WorkTypeLabels } from '../types';
import { SlidersHorizontal, Plus, BookOpen } from 'lucide-react';
import { SidebarWorksSkeleton } from './Skeletons';

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
}) => {
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);

  const activeFiltersCount = (selectedType ? 1 : 0) + (selectedGenreId ? 1 : 0);

  return (
    <aside style={{ width: 330, background: '#0c121e', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0 }}>
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
                  <div style={{ width: 50, height: 70, borderRadius: 4, backgroundImage: `url('${w.coverImageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
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
                      w.formats.map((f) => `${WorkTypeLabels[f.workType]}: ${f.totalChapter.chapter} caps`).join(' • ')
                    ) : (
                      'Sem formatos'
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
