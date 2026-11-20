import React, { useState, useRef } from 'react';
import type { Genre } from '../types';
import { Check, Search, Settings, X } from 'lucide-react';

interface Props {
  genres: Genre[];
  selectedGenreIds: string[];
  onChange: (ids: string[]) => void;
  onOpenManageGenres?: () => void;
}

export const GenreMultiSelect: React.FC<Props> = ({
  genres,
  selectedGenreIds,
  onChange,
  onOpenManageGenres,
}) => {
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleGenre = (id: string) => {
    if (selectedGenreIds.includes(id)) {
      onChange(selectedGenreIds.filter((gId) => gId !== id));
    } else {
      onChange([...selectedGenreIds, id]);
    }
  };

  const filtered = genres.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Gêneros da Obra ({selectedGenreIds.length} selecionados)
        </span>
        {onOpenManageGenres && (
          <button
            type="button"
            onClick={onOpenManageGenres}
            style={{
              background: 'none',
              border: 'none',
              color: '#60a5fa',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              padding: '2px 6px',
            }}
          >
            <Settings size={12} /> Gerenciar Gêneros
          </button>
        )}
      </div>

      {genres.length > 8 && (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, color: '#64748b' }} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Filtrar gêneros..."
            className="input-text"
            style={{ width: '100%', paddingLeft: 30, paddingRight: 28, paddingTop: 4, paddingBottom: 4, fontSize: '0.8rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && search) {
                e.stopPropagation();
                setSearch('');
                searchInputRef.current?.blur();
              }
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                searchInputRef.current?.focus();
              }}
              style={{
                position: 'absolute',
                right: 6,
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Limpar busca (Esc)"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {genres.length === 0 ? (
        <div style={{ fontSize: '0.8rem', color: '#64748b', padding: '6px 0' }}>
          Nenhum gênero cadastrado.{' '}
          {onOpenManageGenres && (
            <button
              type="button"
              onClick={onOpenManageGenres}
              style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Criar gêneros agora
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            maxHeight: '130px',
            overflowY: 'auto',
            padding: '4px 2px',
          }}
        >
          {filtered.map((g) => {
            const isSelected = selectedGenreIds.includes(g.id);
            return (
              <button
                type="button"
                key={g.id}
                onClick={() => toggleGenre(g.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  border: '1px solid',
                  background: isSelected ? '#2563eb' : '#1e293b',
                  color: isSelected ? '#ffffff' : '#cbd5e1',
                  borderColor: isSelected ? '#60a5fa' : '#334155',
                  transition: 'all 0.15s ease',
                }}
              >
                {isSelected && <Check size={12} />}
                {g.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
