import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { CreateProgressRequest, ReadingStatus, WorkFormat } from '../types';
import { ReadingStatusLabels, WorkTypeLabels } from '../types';
import { progressApi } from '../services/api';
import { useModalDock } from '../context/ModalDockContext';
import { useToast } from '../context/ToastContext';
import { usePopoutModal } from '../hooks/usePopoutModal';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useCtrlEnterSubmit } from '../hooks/useCtrlEnterSubmit';
import { saveFormDraft, getFormDraft, discardDraft } from '../utils/formDrafts';
import { ConfirmModal } from './ConfirmModal';
import { MarkdownToolbar } from './MarkdownToolbar';
import { MarkdownViewer } from './MarkdownViewer';
import { X, Minus, ExternalLink, ArrowDownLeft } from 'lucide-react';
import { getUnitLabel, getStatusLabel, isWatchable } from '../utils/formatLabels';

interface Props {
  sessionId?: string;
  isOpen: boolean;
  workId: string;
  currentFormat: WorkFormat;
  lastChapter?: number;
  onClose: () => void;
  onCreated: () => void;
}

interface CreateProgressDraftData {
  chapter: string;
  volume: string;
  readingStatus: ReadingStatus;
  description: string;
  chapterLink: string;
}

export const CreateProgressModal: React.FC<Props> = ({
  sessionId,
  isOpen,
  workId,
  currentFormat,
  lastChapter,
  onClose,
  onCreated,
}) => {
  const [chapter, setChapter] = useState<string>((lastChapter ? lastChapter + 1 : 1).toString());
  const [volume, setVolume] = useState<string>('');
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>(1); // Reading default
  const [description, setDescription] = useState('');
  const [chapterLink, setChapterLink] = useState('');
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasRecoveredDraft, setHasRecoveredDraft] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const isClosingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { showToast } = useToast();

  const { minimizeModal, closeModal, updateModalTitle } = useModalDock();
  const effectiveSessionId = sessionId || `progress-${workId}-${currentFormat.workType}`;
  const modalTitle = `Progresso: ${WorkTypeLabels[currentFormat.workType]} ${getUnitLabel(currentFormat.workType, { short: true })} ${chapter}`;

  useCtrlEnterSubmit(() => formRef.current?.requestSubmit(), isOpen && !isMinimized && !loading);

  const {
    isSupported: isPopoutSupported,
    isPoppedOut,
    popoutContainer,
    openPopout,
    closePopout,
  } = usePopoutModal(modalTitle);

  useEffect(() => {
    if (!isOpen) return;

    const draft = getFormDraft<CreateProgressDraftData>(effectiveSessionId);
    if (draft) {
      setChapter(draft.chapter || (lastChapter ? lastChapter + 1 : 1).toString());
      setVolume(draft.volume || '');
      setReadingStatus(draft.readingStatus ?? 1);
      setDescription(draft.description || '');
      setChapterLink(draft.chapterLink || '');
      setError(null);
      setHasRecoveredDraft(true);
      return;
    }

    setHasRecoveredDraft(false);
    setChapter((lastChapter ? lastChapter + 1 : 1).toString());
    setVolume('');
    setReadingStatus(1);
    setDescription('');
    setChapterLink('');
    setError(null);
  }, [isOpen, effectiveSessionId, lastChapter]);

  useEffect(() => {
    if (!isOpen || loading) return;
    const defaultChapter = (lastChapter ? lastChapter + 1 : 1).toString();
    const hasContent =
      description.trim() !== '' ||
      chapterLink.trim() !== '' ||
      volume.trim() !== '' ||
      chapter !== defaultChapter;

    if (hasContent) {
      saveFormDraft(
        effectiveSessionId,
        {
          type: 'progress',
          mode: 'create',
          workId,
        },
        {
          chapter,
          volume,
          readingStatus,
          description,
          chapterLink,
        }
      );
    }
  }, [
    isOpen,
    loading,
    effectiveSessionId,
    workId,
    lastChapter,
    chapter,
    volume,
    readingStatus,
    description,
    chapterLink,
  ]);

  useEffect(() => {
    if (isMinimized) {
      updateModalTitle(effectiveSessionId, modalTitle);
    }
  }, [modalTitle, isMinimized, effectiveSessionId, updateModalTitle]);

  const defaultChapter = (lastChapter ? lastChapter + 1 : 1).toString();
  const isDirty = () => {
    return (
      chapter !== defaultChapter ||
      volume.trim() !== '' ||
      readingStatus !== 1 ||
      description.trim() !== '' ||
      chapterLink.trim() !== ''
    );
  };

  const handleDiscardDraft = () => {
    discardDraft(effectiveSessionId, 'progress', workId);
    setHasRecoveredDraft(false);
    setChapter(defaultChapter);
    setVolume('');
    setReadingStatus(1);
    setDescription('');
    setChapterLink('');
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
    if (isClosingRef.current) return;
    if (isDirty()) {
      setShowDiscardConfirm(true);
      return;
    }
    isClosingRef.current = true;
    if (isPoppedOut) {
      closePopout();
    }
    closeModal(effectiveSessionId);
    onClose();
  };

  const handleConfirmDiscard = () => {
    isClosingRef.current = true;
    discardDraft(effectiveSessionId, 'progress', workId);
    setShowDiscardConfirm(false);
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
        height: 700,
      });
    }
  };

  useEscapeKey(handleClose, isOpen && !isMinimized && !isPoppedOut && !showDiscardConfirm);

  if (!isOpen || isMinimized) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const unit = getUnitLabel(currentFormat.workType);
      const chapterNum = parseInt(chapter, 10);
      if (isNaN(chapterNum) || chapterNum <= 0) {
        throw new Error(`${unit} deve ser maior que zero.`);
      }
      if (chapterNum > currentFormat.totalChapter.chapter) {
        throw new Error(`${unit} não pode ser maior que o total do formato (${currentFormat.totalChapter.chapter}).`);
      }

      const req: CreateProgressRequest = {
        workId,
        workType: currentFormat.workType,
        stoppedAtChapter: {
          volume: volume ? parseInt(volume, 10) : null,
          chapter: chapterNum,
        },
        readingStatus,
        readingDescription: description.trim() || null,
        chapterLink: chapterLink.trim() || null,
      };

      await progressApi.create(req);
      if (isPoppedOut) {
        closePopout();
      }
      discardDraft(effectiveSessionId, 'progress', workId);
      closeModal(effectiveSessionId);
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar progresso.');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
            Registrar Progresso
          </h2>
          <span className="badge badge-novel" style={{ fontSize: '0.72rem' }}>
            {WorkTypeLabels[currentFormat.workType]}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
              title="Minimizar formulário"
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
            gap: 14,
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
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: '0.85rem',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                {getUnitLabel(currentFormat.workType)} *
              </label>
              <input
                type="number"
                min="1"
                max={currentFormat.totalChapter.chapter}
                required
                autoFocus
                className="input-text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder={`Máx: ${currentFormat.totalChapter.chapter}`}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                {isWatchable(currentFormat.workType) ? 'Temporada (opcional)' : 'Volume (opcional)'}
              </label>
              <input
                type="number"
                min="1"
                className="input-text"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                style={{ width: '100%' }}
                placeholder="Ex: 2"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Status de {isWatchable(currentFormat.workType) ? 'Acompanhamento' : 'Leitura'}
            </label>
            <select
              className="input-text"
              value={readingStatus}
              onChange={(e) => setReadingStatus(Number(e.target.value) as ReadingStatus)}
              style={{ width: '100%' }}
            >
              {Object.keys(ReadingStatusLabels).map((val) => (
                <option key={val} value={val}>
                  {getStatusLabel(Number(val) as ReadingStatus, currentFormat.workType)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Link do Último {getUnitLabel(currentFormat.workType)} {isWatchable(currentFormat.workType) ? 'Assistido' : 'Lido'} (opcional)
            </label>
            <input
              type="url"
              className="input-text"
              value={chapterLink}
              onChange={(e) => setChapterLink(e.target.value)}
              placeholder="https://exemplo.com/episodio-123"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <MarkdownToolbar
              textareaRef={textareaRef}
              value={description}
              onChange={setDescription}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              label={`Diário de Acompanhamento / Reflexão (opcional)`}
              showTable={true}
            />

            {activeTab === 'write' ? (
              <textarea
                ref={textareaRef}
                className="input-text"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`Ex: Neste ${getUnitLabel(currentFormat.workType).toLowerCase()} o protagonista usou a habilidade X...`}
                style={{
                  width: '100%',
                  resize: 'vertical',
                  borderRadius: '0 0 6px 6px',
                  borderTop: 'none',
                  minHeight: 90,
                }}
              />
            ) : (
              <div
                style={{
                  minHeight: 90,
                  padding: 10,
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
          <button type="button" onClick={handleClose} className="btn-secondary" disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Progresso'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <>
      {isPoppedOut && popoutContainer
        ? createPortal(modalContent, popoutContainer)
        : createPortal(
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
          )}
      <ConfirmModal
        isOpen={showDiscardConfirm}
        title="Descartar Rascunho"
        message="Existem alterações não salvas neste formulário. Deseja descartar o rascunho salvo ou continuar editando?"
        confirmText="Descartar Rascunho"
        danger={true}
        onConfirm={handleConfirmDiscard}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </>
  );
};
