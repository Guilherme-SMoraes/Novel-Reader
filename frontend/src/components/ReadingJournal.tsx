import React, { useState } from 'react';
import type { Progress, Work, WorkType } from '../types';
import { WorkTypeLabels } from '../types';
import { progressApi } from '../services/api';
import { CreateProgressModal } from './CreateProgressModal';
import { EditProgressModal } from './EditProgressModal';
import { ConfirmModal } from './ConfirmModal';
import { MarkdownViewer } from './MarkdownViewer';
import { useToast } from '../context/ToastContext';
import { BookMarked, Trash2, ExternalLink, Edit2 } from 'lucide-react';
import {
  getUnitLabel,
  getStatusLabel,
  isWatchable,
} from '../utils/formatLabels';

interface Props {
  work: Work;
  progressList: Progress[];
  onProgressUpdated: () => void;
}

export const ReadingJournal: React.FC<Props> = ({ work, progressList, onProgressUpdated }) => {
  const [selectedWorkType, setSelectedWorkType] = useState<WorkType>(
    work.formats && work.formats.length > 0 ? work.formats[0].workType : 2
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingQuickAdd, setLoadingQuickAdd] = useState(false);
  const [progressToDeleteId, setProgressToDeleteId] = useState<string | null>(null);
  const [progressToEdit, setProgressToEdit] = useState<Progress | null>(null);
  const { showToast } = useToast();

  const activeFormat =
    (work.formats && work.formats.find((f) => f.workType === selectedWorkType)) ||
    (work.formats && work.formats[0]) || {
      workType: selectedWorkType,
      totalChapter: { volume: null, chapter: 100 },
      translatedUpTo: null,
      isFullyTranslated: null,
      translatedLanguage: null,
      linkWhereToRead: null,
    };

  const formatProgressList = progressList.filter((p) => p.workType === activeFormat.workType);
  const latestProgress = formatProgressList[0];
  const currentChapter = latestProgress ? latestProgress.stoppedAtChapter.chapter : 0;
  const totalChapter = activeFormat.totalChapter.chapter;
  const pct = totalChapter > 0 ? ((currentChapter / totalChapter) * 100).toFixed(1) : '0';

  const handleQuickAddChapter = async () => {
    const unitPlural = getUnitLabel(activeFormat.workType, { plural: true }).toLowerCase();
    const unitSingular = getUnitLabel(activeFormat.workType).toLowerCase();
    if (currentChapter >= totalChapter) {
      showToast(`Você já atingiu o total de ${unitPlural} (${totalChapter}) deste formato.`, 'warning');
      return;
    }

    setLoadingQuickAdd(true);
    try {
      await progressApi.create({
        workId: work.id,
        workType: activeFormat.workType,
        stoppedAtChapter: {
          volume: latestProgress?.stoppedAtChapter.volume || null,
          chapter: currentChapter + 1,
        },
        readingStatus: latestProgress?.readingStatus || 1,
        readingDescription: null,
      });
      onProgressUpdated();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : `Erro ao avançar ${unitSingular}.`, 'error');
    } finally {
      setLoadingQuickAdd(false);
    }
  };

  const handleConfirmDeleteProgress = async () => {
    if (!progressToDeleteId) return;
    try {
      await progressApi.delete(work.id, progressToDeleteId);
      showToast('Registro de progresso excluído.', 'info');
      onProgressUpdated();
      setProgressToDeleteId(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erro ao excluir progresso.', 'error');
    }
  };

  return (
    <section style={{ background: '#162032', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
      <div style={{ marginBottom: 18, borderBottom: '1px solid #1e293b', paddingBottom: 14 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: 8 }}>
          Formatos Disponíveis da Obra (Selecione para ver o progresso)
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {work.formats && work.formats.map((f) => {
            const isSelected = f.workType === activeFormat.workType;
            const fProg = progressList.find((p) => p.workType === f.workType);
            const fCurrent = fProg ? fProg.stoppedAtChapter.chapter : 0;
            const fPct = f.totalChapter.chapter > 0 ? Math.round((fCurrent / f.totalChapter.chapter) * 100) : 0;

            return (
              <button
                key={f.workType}
                type="button"
                onClick={() => setSelectedWorkType(f.workType)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: isSelected ? '#1e293b' : '#0f172a',
                  border: isSelected ? '2px solid #8b5cf6' : '1px solid #334155',
                  color: isSelected ? '#f8fafc' : '#94a3b8',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{WorkTypeLabels[f.workType]}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    background: isSelected ? 'rgba(139, 92, 246, 0.25)' : '#1e293b',
                    color: isSelected ? '#c084fc' : '#64748b',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  {fCurrent}/{f.totalChapter.chapter} ({fPct}%)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-novel" style={{ fontSize: '0.75rem' }}>
              {WorkTypeLabels[activeFormat.workType]}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>
              {currentChapter}
            </span>
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
              / {totalChapter} {getUnitLabel(activeFormat.workType, { plural: true }).toLowerCase()}
            </span>
            <span style={{ fontSize: '0.9rem', color: '#8b5cf6', fontWeight: 600, marginLeft: 6 }}>
              ({pct}%)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {activeFormat.linkWhereToRead && (
            <a
              href={activeFormat.linkWhereToRead}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: '0.85rem' }}
            >
              <ExternalLink size={15} />
              Onde {isWatchable(activeFormat.workType) ? 'Assistir' : 'Ler'}
            </a>
          )}
          <button
            type="button"
            className="btn-secondary"
            onClick={handleQuickAddChapter}
            disabled={loadingQuickAdd || currentChapter >= totalChapter}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
          >
            +1 {getUnitLabel(activeFormat.workType)}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
          >
            <BookMarked size={15} />
            Registrar Detalhado
          </button>
        </div>
      </div>

      <div style={{ background: '#0f172a', borderRadius: 8, height: 8, overflow: 'hidden', marginBottom: 20 }}>
        <div
          style={{
            background: 'linear-gradient(90deg, #8b5cf6, #38bdf8)',
            height: '100%',
            width: `${Math.min(100, Math.max(0, parseFloat(pct)))}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>
          Histórico e Diário de {isWatchable(activeFormat.workType) ? 'Episódios' : 'Leitura'}
        </h4>

        {formatProgressList.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
            Nenhum registro de {isWatchable(activeFormat.workType) ? 'episódio' : 'capítulo'} para este formato ainda.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {formatProgressList.map((p) => (
              <div
                key={p.id}
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 8,
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
                      {getUnitLabel(p.workType)} {p.stoppedAtChapter.chapter}
                    </span>
                    {p.stoppedAtChapter.volume && (
                      <span className="badge badge-tag" style={{ fontSize: '0.7rem' }}>
                        {isWatchable(p.workType) ? 'Temporada' : 'Vol.'} {p.stoppedAtChapter.volume}
                      </span>
                    )}
                  </div>

                  <span
                    className="badge badge-status"
                    style={{
                      fontSize: '0.7rem',
                      background:
                        p.readingStatus === 1
                          ? 'rgba(56, 189, 248, 0.2)'
                          : p.readingStatus === 2
                          ? 'rgba(34, 197, 94, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                      color:
                        p.readingStatus === 1
                          ? '#38bdf8'
                          : p.readingStatus === 2
                          ? '#4ade80'
                          : '#f87171',
                    }}
                  >
                    {getStatusLabel(p.readingStatus, p.workType)}
                  </span>

                  {p.chapterLink && (
                    <a
                      href={p.chapterLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        color: '#818cf8',
                        fontSize: '0.75rem',
                        textDecoration: 'none',
                      }}
                      title="Abrir link do capítulo lido"
                    >
                      <ExternalLink size={12} />
                      Link
                    </a>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                    <span className="desktop-only" style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {new Date(p.stoppedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => setProgressToEdit(p)}
                        style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                        title="Editar anotação"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setProgressToDeleteId(p.id)}
                        style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                        title="Excluir anotação"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 2 }}>
                  {p.readingDescription ? (
                    <div style={{ color: '#cbd5e1', fontSize: '0.84rem', lineHeight: '1.5', width: '100%' }}>
                      <MarkdownViewer content={p.readingDescription} />
                    </div>
                  ) : (
                    <span
                      onClick={() => setProgressToEdit(p)}
                      style={{ color: '#64748b', fontSize: '0.78rem', fontStyle: 'italic', cursor: 'pointer' }}
                    >
                      + Adicionar anotação...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateProgressModal
          isOpen={isModalOpen}
          workId={work.id}
          currentFormat={activeFormat}
          lastChapter={currentChapter}
          onClose={() => setIsModalOpen(false)}
          onCreated={onProgressUpdated}
        />
      )}

      {progressToEdit && (
        <EditProgressModal
          isOpen={!!progressToEdit}
          workId={work.id}
          progress={progressToEdit}
          onClose={() => setProgressToEdit(null)}
          onSaved={onProgressUpdated}
        />
      )}

      {progressToDeleteId && (
        <ConfirmModal
          isOpen={!!progressToDeleteId}
          title="Excluir Registro de Progresso"
          message="Tem certeza que deseja apagar esta anotação e registro de progresso? Esta ação não pode ser desfeita."
          confirmText="Excluir Registro"
          onConfirm={handleConfirmDeleteProgress}
          onCancel={() => setProgressToDeleteId(null)}
        />
      )}
    </section>
  );
};
