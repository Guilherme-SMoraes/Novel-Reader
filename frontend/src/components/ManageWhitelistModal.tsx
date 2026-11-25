import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { WhitelistEntry } from '../types';
import { whitelistApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { ConfirmModal } from './ConfirmModal';
import { X, ShieldCheck, UserPlus, Trash2, Mail, ShieldAlert, Loader2, Edit2, Check, Tag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageWhitelistModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [entries, setEntries] = useState<WhitelistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [entryToRevoke, setEntryToRevoke] = useState<WhitelistEntry | null>(null);

  useEscapeKey(onClose, isOpen && !entryToRevoke);

  useEffect(() => {
    if (!isOpen) return;

    const fetchEntries = async () => {
      setLoading(true);
      try {
        const data = await whitelistApi.getAll();
        setEntries(data);
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Falha ao carregar lista de permissões.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [isOpen, showToast]);

  if (!isOpen) return null;

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToSubmit = newEmail.trim().toLowerCase();
    const descriptionToSubmit = newDescription.trim() || undefined;

    if (!emailToSubmit) {
      showToast('Informe um e-mail válido.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const created = await whitelistApi.add(emailToSubmit, descriptionToSubmit);
      setEntries(prev => [...prev, created]);
      setNewEmail('');
      setNewDescription('');
      showToast(`E-mail ${emailToSubmit} autorizado com sucesso!`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Falha ao adicionar e-mail à whitelist.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (entry: WhitelistEntry) => {
    setEditingId(entry.id);
    setEditingDescription(entry.description || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingDescription('');
  };

  const handleSaveDescription = async (entryId: string) => {
    setUpdatingId(entryId);
    const trimmed = editingDescription.trim() || null;
    try {
      const updated = await whitelistApi.update(entryId, trimmed);
      setEntries(prev => prev.map(e => (e.id === entryId ? updated : e)));
      setEditingId(null);
      setEditingDescription('');
      showToast('Identificação atualizada com sucesso!', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Falha ao atualizar identificação.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = (entry: WhitelistEntry) => {
    if (entry.email.toLowerCase() === 'guisanmo1@gmail.com') {
      showToast('O administrador principal não pode ser removido da whitelist.', 'error');
      return;
    }

    setEntryToRevoke(entry);
  };

  const handleConfirmRevoke = async () => {
    if (!entryToRevoke) return;
    const entry = entryToRevoke;
    setEntryToRevoke(null);
    setDeletingId(entry.id);
    try {
      await whitelistApi.remove(entry.id);
      setEntries(prev => prev.filter(e => e.id !== entry.id));
      showToast(`Acesso de ${entry.email} revogado com sucesso.`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Falha ao revogar acesso.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {createPortal(
    <div
      className="modal-overlay"
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: '90vh',
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f8fafc',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              }}
            >
              <ShieldCheck size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
                Gerenciar Acessos (Whitelist)
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Somente e-mails listados aqui podem se autenticar no sistema.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <form onSubmit={handleAddEmail} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Mail
                  size={16}
                  color="#64748b"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  placeholder="novo.usuario@gmail.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ position: 'relative', flex: '1 1 180px' }}>
                <Tag
                  size={16}
                  color="#64748b"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  placeholder="Descrição / Nome (ex: Amigo João)"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !newEmail.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 18px',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: submitting || !newEmail.trim() ? 'not-allowed' : 'pointer',
                  opacity: submitting || !newEmail.trim() ? 0.6 : 1,
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                <span>Autorizar</span>
              </button>
            </div>
          </form>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>
                Usuários Autorizados ({entries.length})
              </span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0', color: '#94a3b8' }}>
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : entries.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '32px 16px',
                  background: 'rgba(15, 23, 42, 0.4)',
                  borderRadius: '12px',
                  border: '1px dashed #334155',
                  color: '#94a3b8',
                  fontSize: '0.88rem',
                }}
              >
                Nenhum e-mail autorizado no momento.
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {entries.map(entry => {
                  const isAdmin = entry.email.toLowerCase() === 'guisanmo1@gmail.com';
                  const isDeleting = deletingId === entry.id;
                  const isEditing = editingId === entry.id;
                  const isUpdating = updatingId === entry.id;

                  return (
                    <div
                      key={entry.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '10px',
                        gap: 12,
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              color: '#f8fafc',
                              wordBreak: 'break-all',
                            }}
                          >
                            {entry.email}
                          </span>
                          {isAdmin && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: 'rgba(59, 130, 246, 0.2)',
                                border: '1px solid rgba(59, 130, 246, 0.4)',
                                color: '#60a5fa',
                                fontWeight: 700,
                              }}
                            >
                              Admin Principal
                            </span>
                          )}
                        </div>

                        {isEditing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <input
                              type="text"
                              value={editingDescription}
                              onChange={e => setEditingDescription(e.target.value)}
                              placeholder="Identificação / Nome"
                              disabled={isUpdating}
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveDescription(entry.id);
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  handleCancelEdit();
                                }
                              }}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#1e293b',
                                border: '1px solid #3b82f6',
                                borderRadius: '6px',
                                color: '#f8fafc',
                                fontSize: '0.82rem',
                                outline: 'none',
                                flex: 1,
                                maxWidth: '240px',
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveDescription(entry.id)}
                              disabled={isUpdating}
                              title="Salvar"
                              style={{
                                background: '#10b981',
                                border: 'none',
                                color: '#ffffff',
                                padding: 6,
                                borderRadius: '6px',
                                cursor: isUpdating ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={isUpdating}
                              title="Cancelar"
                              style={{
                                background: '#334155',
                                border: 'none',
                                color: '#94a3b8',
                                padding: 6,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            {entry.description ? (
                              <span
                                style={{
                                  fontSize: '0.82rem',
                                  color: '#38bdf8',
                                  fontWeight: 500,
                                  background: 'rgba(56, 189, 248, 0.1)',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(56, 189, 248, 0.2)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <Tag size={11} />
                                {entry.description}
                              </span>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => handleStartEdit(entry)}
                              title={entry.description ? 'Alterar descrição' : 'Adicionar identificação'}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: entry.description ? '#64748b' : '#38bdf8',
                                cursor: 'pointer',
                                padding: '2px 4px',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '0.75rem',
                                transition: 'color 0.15s ease',
                              }}
                            >
                              <Edit2 size={12} />
                              {!entry.description && <span>+ Adicionar identificação</span>}
                            </button>
                          </div>
                        )}

                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                          Cadastrado em {new Date(entry.createdAt).toLocaleDateString('pt-BR')} por {entry.createdBy}
                        </div>
                      </div>

                      {!isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleRemove(entry)}
                          disabled={isDeleting}
                          title="Revogar acesso"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            transition: 'all 0.15s ease',
                            alignSelf: 'center',
                          }}
                        >
                          {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          <span>Revogar</span>
                        </button>
                      ) : (
                        <div
                          title="Administrador protegido contra remoção"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '6px',
                            color: '#475569',
                            alignSelf: 'center',
                          }}
                        >
                          <ShieldAlert size={16} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(15, 23, 42, 0.3)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              backgroundColor: '#334155',
              border: 'none',
              borderRadius: '8px',
              color: '#f8fafc',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
    )}
    <ConfirmModal
      isOpen={!!entryToRevoke}
      title="Revogar Acesso"
      message={`Deseja revogar o acesso do e-mail "${entryToRevoke?.email}"?`}
      confirmText="Revogar"
      cancelText="Cancelar"
      danger={true}
      onConfirm={handleConfirmRevoke}
      onCancel={() => setEntryToRevoke(null)}
    />
    </>
  );
};
