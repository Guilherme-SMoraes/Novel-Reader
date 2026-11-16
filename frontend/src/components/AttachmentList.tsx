import React, { useState } from 'react';
import type { Attachment, Work } from '../types';
import { attachmentsApi } from '../services/api';
import { AttachmentModal } from './AttachmentModal';
import { ConfirmModal } from './ConfirmModal';
import { MarkdownViewer } from './MarkdownViewer';
import { useToast } from '../context/ToastContext';
import { Map, Plus, Edit2, Trash2, Maximize2, X, FileText, BookOpen } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';

interface Props {
  work: Work;
  attachments: Attachment[];
  onAttachmentsUpdated: () => void;
}

export const AttachmentList: React.FC<Props> = ({ work, attachments, onAttachmentsUpdated }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<Attachment | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(null);
  const [selectedAttachmentForView, setSelectedAttachmentForView] = useState<Attachment | null>(null);
  const { showToast } = useToast();

  const categories = ['TODAS', ...Array.from(new Set(attachments.map((a) => a.category)))];

  const filtered = attachments.filter((a) => {
    const matchesCategory = selectedCategory === 'TODAS' || a.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      a.title.toLowerCase().includes(q) ||
      (a.content && a.content.toLowerCase().includes(q)) ||
      a.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleConfirmDelete = async () => {
    if (!attachmentToDelete) return;
    await attachmentsApi.delete(attachmentToDelete.id);
    showToast(`Anexo "${attachmentToDelete.title}" excluído com sucesso.`, 'info');
    onAttachmentsUpdated();
    setAttachmentToDelete(null);
  };

  const handleOpenCreate = () => {
    setEditingAttachment(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (attachment: Attachment) => {
    setEditingAttachment(attachment);
    setIsModalOpen(true);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'mapa':
        return { bg: '#064e3b', text: '#34d399', border: '#059669' };
      case 'sistema de poder':
        return { bg: '#4c1d95', text: '#c084fc', border: '#7c3aed' };
      case 'locais':
        return { bg: '#1e3a8a', text: '#60a5fa', border: '#2563eb' };
      case 'lore':
        return { bg: '#78350f', text: '#fcd34d', border: '#d97706' };
      case 'bestiário':
        return { bg: '#831843', text: '#f472b6', border: '#db2777' };
      case 'facções':
        return { bg: '#134e4a', text: '#2dd4bf', border: '#0d9488' };
      default:
        return { bg: '#334155', text: '#94a3b8', border: '#475569' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Map size={22} color="#38bdf8" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Anexos & Lore</h2>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', background: '#1e293b', padding: '2px 8px', borderRadius: '12px' }}>
            {attachments.length} {attachments.length === 1 ? 'item' : 'itens'}
          </span>
        </div>
        <button className="btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Novo Anexo
        </button>
      </div>

      {/* Category Pills and Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                border: '1px solid',
                cursor: 'pointer',
                background: selectedCategory === cat ? '#3b82f6' : '#1e293b',
                color: selectedCategory === cat ? '#fff' : '#cbd5e1',
                borderColor: selectedCategory === cat ? '#60a5fa' : '#334155',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Buscar anexos..."
          className="input-text"
          style={{ maxWidth: '240px', padding: '6px 12px', fontSize: '0.85rem' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Attachments Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#1e293b', borderRadius: '10px', color: '#94a3b8' }}>
          <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <p>Nenhum anexo encontrado para esta obra.</p>
          <button className="btn-secondary" style={{ marginTop: '12px' }} onClick={handleOpenCreate}>
            Adicionar o primeiro anexo
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.map((att) => {
            const catStyle = getCategoryColor(att.category);
            return (
              <div
                key={att.id}
                style={{
                  background: '#1e293b',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border-color 0.15s ease',
                }}
              >
                {/* Image Section (if present) */}
                {att.imageUrl && (
                  <div
                    style={{
                      height: '180px',
                      background: '#0f172a',
                      position: 'relative',
                      cursor: 'pointer',
                      overflow: 'hidden',
                    }}
                    onClick={() => setLightboxImage({ url: att.imageUrl!, title: att.title })}
                  >
                    <img
                      src={att.imageUrl}
                      alt={att.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.2s ease',
                      }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        right: '8px',
                        bottom: '8px',
                        background: 'rgba(0,0,0,0.6)',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        color: '#fff',
                      }}
                    >
                      <Maximize2 size={12} /> Ampliar
                    </div>
                  </div>
                )}

                {/* Card Body */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: catStyle.bg,
                        color: catStyle.text,
                        border: `1px solid ${catStyle.border}`,
                      }}
                    >
                      {att.category}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn-icon"
                        title="Editar Anexo"
                        style={{ padding: '4px' }}
                        onClick={() => handleOpenEdit(att)}
                      >
                        <Edit2 size={14} color="#94a3b8" />
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        title="Excluir Anexo"
                        style={{ padding: '4px' }}
                        onClick={() => setAttachmentToDelete(att)}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </div>

                  <h3
                    style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px', cursor: 'pointer' }}
                    onClick={() => setSelectedAttachmentForView(att)}
                    title="Clique para ver detalhes"
                  >
                    {att.title}
                  </h3>

                  {att.content && (
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: '#cbd5e1',
                        lineHeight: 1.5,
                        flex: 1,
                        marginBottom: '8px',
                        maxHeight: '130px',
                        overflowY: 'auto',
                        paddingRight: '4px',
                      }}
                    >
                      <MarkdownViewer content={att.content} compact />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #334155' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {att.updatedAt ? `Atualizado em ${new Date(att.updatedAt).toLocaleDateString()}` : `Adicionado em ${new Date(att.createdAt).toLocaleDateString()}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedAttachmentForView(att)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'transparent',
                        border: 'none',
                        color: '#38bdf8',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        fontWeight: 500,
                        padding: '2px 4px',
                      }}
                    >
                      <BookOpen size={13} /> Ver Detalhes
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <ImageLightbox
          imageUrl={lightboxImage.url}
          title={lightboxImage.title}
          onClose={() => setLightboxImage(null)}
        />
      )}

      {/* Create / Edit Modal */}
      <AttachmentModal
        isOpen={isModalOpen}
        workId={work.id}
        attachmentToEdit={editingAttachment}
        existingCategories={categories.filter((c) => c !== 'TODAS')}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAttachment(null);
        }}
        onSaved={onAttachmentsUpdated}
      />

      {attachmentToDelete && (
        <ConfirmModal
          isOpen={!!attachmentToDelete}
          title="Excluir Anexo"
          message={`Deseja realmente excluir o anexo "${attachmentToDelete.title}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir Anexo"
          onConfirm={handleConfirmDelete}
          onCancel={() => setAttachmentToDelete(null)}
        />
      )}

      {/* Full View / Reading Modal */}
      {selectedAttachmentForView && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedAttachmentForView(null)}
          style={{ zIndex: 9990, padding: '20px' }}
        >
          <div
            className="modal-content"
            style={{ maxWidth: '850px', width: '95%', maxHeight: '88vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '10px' }}>
              <div>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: getCategoryColor(selectedAttachmentForView.category).bg,
                    color: getCategoryColor(selectedAttachmentForView.category).text,
                    border: `1px solid ${getCategoryColor(selectedAttachmentForView.category).border}`,
                    display: 'inline-block',
                    marginBottom: '8px',
                  }}
                >
                  {selectedAttachmentForView.category}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedAttachmentForView.title}
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="btn-icon"
                  title="Editar Anexo"
                  onClick={() => {
                    const toEdit = selectedAttachmentForView;
                    setSelectedAttachmentForView(null);
                    handleOpenEdit(toEdit);
                  }}
                >
                  <Edit2 size={16} color="#94a3b8" />
                </button>
                <button
                  className="btn-icon"
                  onClick={() => setSelectedAttachmentForView(null)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {selectedAttachmentForView.imageUrl && (
              <div style={{ marginBottom: '18px', textAlign: 'center' }}>
                <img
                  src={selectedAttachmentForView.imageUrl}
                  alt={selectedAttachmentForView.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '380px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    setLightboxImage({
                      url: selectedAttachmentForView.imageUrl!,
                      title: selectedAttachmentForView.title,
                    })
                  }
                />
              </div>
            )}

            {selectedAttachmentForView.content && (
              <div style={{ background: '#0b1120', padding: '18px', borderRadius: '8px', border: '1px solid #334155' }}>
                <MarkdownViewer content={selectedAttachmentForView.content} />
              </div>
            )}

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b' }}>
              <span>
                {selectedAttachmentForView.updatedAt
                  ? `Atualizado em ${new Date(selectedAttachmentForView.updatedAt).toLocaleDateString()}`
                  : `Adicionado em ${new Date(selectedAttachmentForView.createdAt).toLocaleDateString()}`}
              </span>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedAttachmentForView(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
