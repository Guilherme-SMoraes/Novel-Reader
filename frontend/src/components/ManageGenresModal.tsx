import React, { useState } from 'react';
import type { Genre } from '../types';
import { genresApi } from '../services/api';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../context/ToastContext';
import { X, Plus, Trash2, Tag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  genres: Genre[];
  onClose: () => void;
  onGenresUpdated: () => void;
}

export const ManageGenresModal: React.FC<Props> = ({
  isOpen,
  genres,
  onClose,
  onGenresUpdated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genreToDelete, setGenreToDelete] = useState<Genre | null>(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleCreateGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await genresApi.create(name.trim(), description.trim() || undefined);
      showToast(`Gênero "${name.trim()}" criado com sucesso.`, 'success');
      setName('');
      setDescription('');
      onGenresUpdated();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar gênero.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteGenre = async () => {
    if (!genreToDelete) return;
    await genresApi.delete(genreToDelete.id);
    showToast(`Gênero "${genreToDelete.name}" apagado.`, 'info');
    onGenresUpdated();
    setGenreToDelete(null);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={20} color="#38bdf8" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Gerenciar Gêneros</h2>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        {error && (
          <div style={{ padding: '8px 12px', background: '#7f1d1d', borderRadius: '6px', color: '#fca5a5', marginBottom: '14px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Formulário para Adicionar Gênero */}
        <form onSubmit={handleCreateGenre} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '16px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>+ Adicionar Novo Gênero</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Nome do gênero (ex: Isekai, Fantasia)..."
              className="input-text"
              style={{ flex: 1 }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
              <Plus size={16} /> Adicionar
            </button>
          </div>
          <input
            type="text"
            placeholder="Descrição opcional..."
            className="input-text"
            style={{ fontSize: '0.85rem' }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </form>

        {/* Lista de Gêneros com Opção de Apagar */}
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
          Gêneros Cadastrados ({genres.length})
        </span>

        <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {genres.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '12px 0', textAlign: 'center' }}>
              Nenhum gênero cadastrado ainda.
            </div>
          ) : (
            genres.map((g) => (
              <div
                key={g.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#1e293b',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>{g.name}</span>
                  {g.description && (
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>{g.description}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-icon"
                  title="Apagar gênero"
                  style={{ color: '#f87171' }}
                  onClick={() => setGenreToDelete(g)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>

      {genreToDelete && (
        <ConfirmModal
          isOpen={!!genreToDelete}
          title="Apagar Gênero"
          message={`Deseja realmente apagar o gênero "${genreToDelete.name}"? As obras vinculadas perderão a marcação desse gênero.`}
          confirmText="Apagar Gênero"
          onConfirm={handleConfirmDeleteGenre}
          onCancel={() => setGenreToDelete(null)}
        />
      )}
    </div>
  );
};
