import React, { useState, useEffect } from 'react';
import type { Attachment } from '../types';
import { attachmentsApi } from '../services/api';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  workId: string;
  attachmentToEdit?: Attachment | null;
  onClose: () => void;
  onSaved: () => void;
}

const PRESET_CATEGORIES = [
  'Mapa',
  'Sistema de Poder',
  'Locais',
  'Lore',
  'Bestiário',
  'Facções',
  'Outro',
];

export const AttachmentModal: React.FC<Props> = ({
  isOpen,
  workId,
  attachmentToEdit,
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Mapa');
  const [customCategory, setCustomCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (attachmentToEdit) {
      setTitle(attachmentToEdit.title);
      if (PRESET_CATEGORIES.includes(attachmentToEdit.category)) {
        setCategory(attachmentToEdit.category);
        setCustomCategory('');
      } else {
        setCategory('Outro');
        setCustomCategory(attachmentToEdit.category);
      }
      setImageUrl(attachmentToEdit.imageUrl || '');
      setContent(attachmentToEdit.content || '');
    } else {
      setTitle('');
      setCategory('Mapa');
      setCustomCategory('');
      setImageUrl('');
      setContent('');
    }
    setError(null);
  }, [attachmentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalCategory = category === 'Outro' && customCategory.trim() ? customCategory.trim() : category;

    if (!title.trim()) {
      setError('O título é obrigatório.');
      return;
    }
    if (!finalCategory.trim()) {
      setError('A categoria é obrigatória.');
      return;
    }

    setLoading(true);
    try {
      if (attachmentToEdit) {
        await attachmentsApi.update(attachmentToEdit.id, {
          title: title.trim(),
          category: finalCategory,
          imageUrl: imageUrl.trim() || null,
          content: content.trim() || null,
        });
      } else {
        await attachmentsApi.create(workId, {
          title: title.trim(),
          category: finalCategory,
          imageUrl: imageUrl.trim() || null,
          content: content.trim() || null,
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar anexo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            {attachmentToEdit ? 'Editar Anexo' : 'Novo Anexo da Obra'}
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        {error && (
          <div style={{ padding: '10px', background: '#7f1d1d', borderRadius: '6px', color: '#fca5a5', marginBottom: '14px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
              Categoria *
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    if (cat !== 'Outro') setCustomCategory('');
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    border: '1px solid',
                    cursor: 'pointer',
                    background: category === cat ? '#3b82f6' : '#1e293b',
                    color: category === cat ? '#fff' : '#cbd5e1',
                    borderColor: category === cat ? '#60a5fa' : '#334155',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {category === 'Outro' && (
              <div style={{ marginTop: '6px' }}>
                <input
                  type="text"
                  placeholder="Digite o nome da nova categoria (ex: Itens Sagrados, Magias...)"
                  className="input-text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
              Título do Anexo *
            </label>
            <input
              type="text"
              placeholder="Ex: Mapa do Continente Sul, Hierarquia de Cultivo..."
              className="input-text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
              URL da Imagem / Mapa (opcional)
            </label>
            <input
              type="url"
              placeholder="https://exemplo.com/imagem.png"
              className="input-text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
              Conteúdo / Explicação Detalhada (opcional)
            </label>
            <textarea
              rows={6}
              placeholder="Descreva detalhes, divisões territoriais, regras do sistema de poder, história..."
              className="input-text"
              style={{ resize: 'vertical' }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : attachmentToEdit ? 'Atualizar Anexo' : 'Salvar Anexo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
