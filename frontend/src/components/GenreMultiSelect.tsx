import React, { useState } from 'react';
import type { Genre } from '../types';
import { Check, Search, Settings } from 'lucide-react';

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
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: '#64748b' }} />
          <input
            type="text"
            placeholder="Filtrar gêneros..."
            className="input-text"
            style={{ paddingLeft: 30, paddingRight: 10, paddingTop: 4, paddingBottom: 4, fontSize: '0.8rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
