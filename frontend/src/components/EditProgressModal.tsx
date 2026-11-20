import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Progress } from '../types';
import { WorkTypeLabels } from '../types';
import { progressApi } from '../services/api';
import { useModalDock } from '../context/ModalDockContext';
import { useToast } from '../context/ToastContext';
import { usePopoutModal } from '../hooks/usePopoutModal';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useCtrlEnterSubmit } from '../hooks/useCtrlEnterSubmit';
import { saveFormDraft, getFormDraft, discardDraft } from '../utils/formDrafts';
import { MarkdownToolbar } from './MarkdownToolbar';
import { MarkdownViewer } from './MarkdownViewer';
import { X, Minus, ExternalLink, ArrowDownLeft } from 'lucide-react';
import { getUnitLabel, isWatchable } from '../utils/formatLabels';

interface Props {
  sessionId?: string;
  isOpen: boolean;
  workId: string;
  progress: Progress;
  onClose: () => void;
  onSaved: () => void;
}

interface EditProgressDraftData {
  description: string;
}

export const EditProgressModal: React.FC<Props> = ({
  sessionId,
  isOpen,
  workId,
  progress,
  onClose,
  onSaved,
}) => {
  const [description, setDescription] = useState(progress.readingDescription || '');
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasRecoveredDraft, setHasRecoveredDraft] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { showToast } = useToast();

  const { minimizeModal, closeModal, updateModalTitle } = useModalDock();
  const unitSingular = getUnitLabel(progress.workType);
  const workTypeLabel = WorkTypeLabels[progress.workType];
  const chapterNumber = progress.stoppedAtChapter.chapter;
  const volumeNumber = progress.stoppedAtChapter.volume;

  const modalTitle = `Anotação: ${workTypeLabel} ${unitSingular} ${chapterNumber}${
    volumeNumber ? ` (${isWatchable(progress.workType) ? 'T' : 'Vol'} ${volumeNumber})` : ''
  }`;

  const effectiveSessionId = sessionId || `edit-progress-${progress.id}`;

  const {
    isSupported: isPopoutSupported,
    isPoppedOut,
    popoutContainer,
    openPopout,
    closePopout,
  } = usePopoutModal(modalTitle);

  useCtrlEnterSubmit(() => formRef.current?.requestSubmit(), isOpen && !isMinimized && !loading);

  useEffect(() => {
    if (!isOpen) return;

    const draft = getFormDraft<EditProgressDraftData>(effectiveSessionId);
    if (draft) {
      setDescription(draft.description || '');
      setActiveTab('write');
      setError(null);
      setHasRecoveredDraft(true);
      return;
    }

    setHasRecoveredDraft(false);
    setDescription(progress.readingDescription || '');
    setActiveTab('write');
    setError(null);
  }, [progress, isOpen, effectiveSessionId]);

  useEffect(() => {
    if (!isOpen || loading) return;
    if (description !== (progress.readingDescription || '')) {
      saveFormDraft(
        effectiveSessionId,
        {
          type: 'progress',
          mode: 'edit',
          workId,
          entityId: progress.id,
        },
        {
          description,
        }
      );
    }
  }, [isOpen, loading, effectiveSessionId, workId, progress, description]);

  useEffect(() => {
    if (isMinimized) {
      updateModalTitle(effectiveSessionId, modalTitle);
    }
  }, [modalTitle, isMinimized, effectiveSessionId, updateModalTitle]);

  const isDirty = () => description !== (progress.readingDescription || '');

  const handleDiscardDraft = () => {
    discardDraft(effectiveSessionId, 'progress', workId);
    setHasRecoveredDraft(false);
    setDescription(progress.readingDescription || '');
    showToast('Rascunho descartado.', 'info');
  };

  const handleMinimize = () => {
    if (isPoppedOut) {
      closePopout();
    }
    setIsMinimized(true);
    minimizeModal({
      id: effectiveSessionId,
      title: modalTitle,
      type: 'progress',
      onRestore: () => setIsMinimized(false),
      onClose: handleClose,
    });
  };

  const handleClose = () => {
    if (isDirty()) {
      const confirmed = window.confirm(
        'Deseja descartar as alterações deste rascunho? Clique em OK para descartar ou Cancelar para manter o rascunho salvo.'
      );
      if (confirmed) {
        discardDraft(effectiveSessionId, 'progress', workId);
      }
    }
    if (isPoppedOut) {
      closePopout();
    }
    closeModal(effectiveSessionId);
    onClose();
  };

  const handleTogglePopout = async () => {
    if (isPoppedOut) {
      closePopout();
    } else {
      await openPopout({
        title: modalTitle,
        width: 600,
        height: 640,
      });
    }
  };

  useEscapeKey(handleClose, isOpen && !isMinimized && !isPoppedOut);

  if (!isOpen || isMinimized) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const trimmed = description.trim();
      await progressApi.updateDescription(workId, progress.id, trimmed ? trimmed : null);
      if (isPoppedOut) {
        closePopout();
      }
      discardDraft(effectiveSessionId, 'progress', workId);
      closeModal(effectiveSessionId);
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar anotação do progresso.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      className={isPoppedOut ? '' : 'modal-card'}
      style={
        isPoppedOut
          ? {
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              width: '100vw',
              background: '#0f172a',
              color: '#f8fafc',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }
          : {
              maxWidth: 620,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }
      }
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isPoppedOut ? '12px 16px' : '14px 20px',
          borderBottom: '1px solid #1e293b',
          background: '#162032',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span className="badge badge-tag" style={{ fontSize: '0.74rem', flexShrink: 0 }}>
            {workTypeLabel}
          </span>
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 600,
              color: '#f8fafc',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {unitSingular} {chapterNumber}
            {volumeNumber
              ? ` (${isWatchable(progress.workType) ? 'Temporada' : 'Volume'} ${volumeNumber})`
              : ''}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {isPopoutSupported && (
            <button
              type="button"
              className="btn-icon"
              onClick={handleTogglePopout}
              title={isPoppedOut ? 'Reanexar à janela principal' : 'Destacar em Pop-up (Picture-in-Picture)'}
              style={{
                color: isPoppedOut ? '#38bdf8' : '#94a3b8',
                background: isPoppedOut ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              }}
            >
              {isPoppedOut ? <ArrowDownLeft size={16} /> : <ExternalLink size={16} />}
            </button>
          )}

          {!isPoppedOut && (
            <button
              type="button"
              className="btn-icon"
              onClick={handleMinimize}
              title="Minimizar para a barra"
              style={{ color: '#94a3b8' }}
            >
              <Minus size={16} />
            </button>
          )}

          <button
            type="button"
            className="btn-icon"
            onClick={handleClose}
            title="Fechar"
            style={{ color: '#94a3b8' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: isPoppedOut ? '14px 16px' : '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {hasRecoveredDraft && (
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid #0284c7',
                color: '#38bdf8',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <span>📝 Rascunho recuperado automaticamente</span>
              <button
                type="button"
                onClick={handleDiscardDraft}
                style={{
                  background: 'transparent',
                  border: '1px solid #0284c7',
                  color: '#38bdf8',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                Descartar rascunho
              </button>
            </div>
          )}

          {error && (
            <div
              style={{
                background: '#450a0a',
                border: '1px solid #7f1d1d',
                color: '#fca5a5',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: '0.82rem',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 280 }}>
            <MarkdownToolbar
              textareaRef={textareaRef}
              value={description}
              onChange={setDescription}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              label="Anotação e Comentários sobre o Capítulo"
              showTable={true}
            />

            {activeTab === 'write' ? (
              <textarea
                ref={textareaRef}
                className="input-text"
                rows={10}
                style={{
                  resize: 'vertical',
                  borderRadius: '0 0 6px 6px',
                  borderTop: 'none',
                  flex: 1,
                  minHeight: 180,
                  fontSize: '0.88rem',
                  fontFamily: 'inherit',
                  lineHeight: '1.5',
                }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Escreva suas impressões, teorias, eventos importantes ou citações deste capítulo..."
                autoFocus
              />
            ) : (
              <div
                style={{
                  flex: 1,
                  minHeight: 180,
                  padding: 12,
                  background: '#0b1120',
                  borderRadius: '0 0 6px 6px',
                  border: '1px solid #334155',
                  borderTop: 'none',
                  overflowY: 'auto',
                }}
              >
                {description.trim() ? (
                  <MarkdownViewer content={description} />
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                    Nada para pré-visualizar ainda.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            padding: isPoppedOut ? '12px 16px' : '14px 20px',
            borderTop: '1px solid #1e293b',
            background: '#162032',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Anotação'}
          </button>
        </div>
      </form>
    </div>
  );

  if (isPoppedOut && popoutContainer) {
    return createPortal(modalContent, popoutContainer);
  }

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDirty()) {
          handleClose();
        }
      }}
    >
      {modalContent}
    </div>,
    document.body
  );
};
