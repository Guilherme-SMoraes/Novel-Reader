import React, { useState } from 'react';
import type { Character, Work } from '../types';
import { CharacterTypeLabels } from '../types';
import { charactersApi } from '../services/api';
import { CharacterModal } from './CharacterModal';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../context/ToastContext';
import { Users, Plus, Trash2, Edit2, User } from 'lucide-react';

interface Props {
  work: Work;
  characters: Character[];
  onCharactersUpdated: () => void;
}

export const CharacterList: React.FC<Props> = ({ work, characters, onCharactersUpdated }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
  const { showToast } = useToast();

  const filtered = characters.filter((c) => {
    const q = filterQuery.toLowerCase();
    const role = CharacterTypeLabels[c.characterType].toLowerCase();
    return c.name.toLowerCase().includes(q) || role.includes(q) || (c.description && c.description.toLowerCase().includes(q));
  });

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
      {/* Header com Busca e Botão de Adicionar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={18} color="#38bdf8" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Personagens da Obra ({characters.length})
          </h3>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="🔍 Filtrar por nome ou papel..."
            style={{ width: 220, padding: '6px 10px', fontSize: '0.8rem' }}
          />
          <button onClick={handleOpenCreate} className="btn-primary" style={{ padding: '6px 12px' }}>
            <Plus size={14} /> Personagem
          </button>
        </div>
      </div>

      {/* Grid de Personagens */}
      {filtered.length === 0 ? (
        <div style={{ background: '#121927', border: '1px dashed var(--border)', borderRadius: 10, padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {characters.length === 0 ? 'Nenhum personagem cadastrado para esta obra.' : 'Nenhum personagem corresponde ao filtro informado.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              style={{
                background: '#182234',
                border: '1px solid var(--border)',
                borderRadius: 10,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
            >
              {/* Foto ou Avatar Placeholder */}
              <div style={{ height: 160, position: 'relative', background: '#0c121e' }}>
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
                    onClick={() => handleOpenEdit(c)}
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
                    onClick={() => setCharacterToDelete(c)}
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
              <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontSize: '0.74rem', color: '#38bdf8', marginBottom: 6 }}>
                  1ª Aparição: Cap. {c.firstAppearance.chapter}
                  {c.firstAppearance.volume && ` (Vol. ${c.firstAppearance.volume})`}
                </div>
                {c.description ? (
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.4', marginTop: 'auto' }}>
                    {c.description}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 'auto' }}>
                    Sem descrição cadastrada.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CharacterModal
        isOpen={isModalOpen}
        workId={work.id}
        characterToEdit={editingCharacter}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCharacter(null);
        }}
        onSaved={onCharactersUpdated}
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
