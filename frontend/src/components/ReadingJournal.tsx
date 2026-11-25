import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Progress, Work, WorkType } from '../types';
import { WorkTypeLabels } from '../types';
import { progressApi } from '../services/api';
import { CreateProgressModal } from './CreateProgressModal';
import { EditProgressModal } from './EditProgressModal';
import { ConfirmModal } from './ConfirmModal';
import { MarkdownViewer } from './MarkdownViewer';
import { useInfiniteTrigger } from '../hooks/useInfiniteScroll';
import { JournalItemsSkeleton } from './Skeletons';
import { useToast } from '../context/ToastContext';
import { BookMarked, Trash2, ExternalLink, Edit2 } from 'lucide-react';
import { getNavParams, updateNavParams } from '../utils/navigationState';
import { getActiveDraftMeta } from '../utils/formDrafts';
import {
  getUnitLabel,
  getStatusLabel,
  isWatchable,
} from '../utils/formatLabels';

interface Props {
  work: Work;
  progressList?: Progress[];
  onProgressUpdated: () => void;
}

export const ReadingJournal: React.FC<Props> = ({ work, progressList = [], onProgressUpdated }) => {
  const [selectedWorkType, setSelectedWorkType] = useState<WorkType>(() => {
    const nav = getNavParams();
    if (nav.format && work.formats?.some((f) => f.workType === nav.format)) {
      return nav.format as WorkType;
    }
    return work.formats && work.formats.length > 0 ? work.formats[0].workType : 2;
  });
  const [formatRecords, setFormatRecords] = useState<Progress[]>([]);
  const [latestProgressByFormat, setLatestProgressByFormat] = useState<Record<number, Progress>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

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

  const refreshLatestProgress = useCallback(async () => {
    try {
      const items = await progressApi.getLatestByWorkId(work.id);
      setLatestProgressByFormat((prev) => {
        const next = { ...prev };
        items.forEach((p) => {
          next[p.workType] = p;
        });
        return next;
      });
    } catch (err: unknown) {
      console.error('Falha ao obter resumo dos formatos:', err);
    }
  }, [work.id]);

  useEffect(() => {
    refreshLatestProgress();
  }, [work.id, refreshLatestProgress]);

  useEffect(() => {
    if (progressList && progressList.length > 0) {
      setLatestProgressByFormat((prev) => {
        const next = { ...prev };
        progressList.forEach((p) => {
          if (!next[p.workType] || new Date(p.stoppedAt) > new Date(next[p.workType].stoppedAt)) {
            next[p.workType] = p;
          }
        });
        return next;
      });
    }
  }, [progressList]);

  const loadFormatProgress = useCallback(
    async (formatType: WorkType, targetPage = 1, append = false) => {
      if (targetPage === 1) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await progressApi.getByWorkId(work.id, formatType, targetPage, 20);
        setFormatRecords((prev) => (append ? [...prev, ...res.items] : res.items));
        if (res.items.length > 0) {
          setLatestProgressByFormat((prev) => ({ ...prev, [formatType]: res.items[0] }));
        }
        setCurrentPage(res.page);
        setHasMore(res.page < res.totalPages);
      } catch (err: unknown) {
        console.error('Falha ao carregar registros do diário:', err);
        showToast(err instanceof Error ? err.message : 'Falha ao carregar registros de progresso.', 'error');
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [work.id, showToast]
  );

  useEffect(() => {
    loadFormatProgress(selectedWorkType, 1, false);
  }, [selectedWorkType, work.id, loadFormatProgress]);

  const draftRestoredRef = useRef<string | null>(null);

  useEffect(() => {
    if (draftRestoredRef.current === work.id) return;
    const activeDraft = getActiveDraftMeta();
    if (activeDraft && activeDraft.type === 'progress' && activeDraft.workId === work.id) {
      if (activeDraft.mode === 'create') {
        draftRestoredRef.current = work.id;
        setIsModalOpen(true);
      } else if (activeDraft.mode === 'edit' && activeDraft.entityId) {
        const item = formatRecords.find((p) => p.id === activeDraft.entityId);
        if (item) {
          draftRestoredRef.current = work.id;
          setProgressToEdit(item);
        }
      }
    }
  }, [work.id, formatRecords]);

  const handleLoadMore = useCallback(() => {
    if (!loadingInitial && !loadingMore && hasMore) {
      loadFormatProgress(selectedWorkType, currentPage + 1, true);
    }
  }, [loadingInitial, loadingMore, hasMore, loadFormatProgress, selectedWorkType, currentPage]);

  const { sentinelRef } = useInfiniteTrigger({
    onIntersect: handleLoadMore,
    hasMore,
    isLoading: loadingMore || loadingInitial,
  });

  const latestProgress =
    (formatRecords.length > 0 ? formatRecords[0] : null) ||
    latestProgressByFormat[activeFormat.workType] ||
    (progressList && progressList.find((p) => p.workType === activeFormat.workType));
  const currentChapter = latestProgress ? latestProgress.stoppedAtChapter.chapter : 0;
  const totalChapter = activeFormat.totalChapter.chapter;
  const pct = totalChapter > 0 ? ((currentChapter / totalChapter) * 100).toFixed(1) : '0';

  const handleProgressChanged = () => {
    loadFormatProgress(selectedWorkType, 1, false);
    refreshLatestProgress();
    onProgressUpdated();
  };

  const handleQuickAddChapter = async () => {
    const unitPlural = getUnitLabel(activeFormat.workType, { plural: true }).toLowerCase();
    const unitSingular = getUnitLabel(activeFormat.workType).toLowerCase();
    if (currentChapter >= totalChapter) {
      showToast(`Você já atingiu o total de ${unitPlural} (${totalChapter}) deste formato.`, 'warning');
      return;
    }

    setLoadingQuickAdd(true);
    try {
      const nextChapter = currentChapter + 1;
      const isCompleted = totalChapter > 0 && nextChapter >= totalChapter;
      const created = await progressApi.create({
        workId: work.id,
        workType: activeFormat.workType,
        stoppedAtChapter: {
          volume: latestProgress?.stoppedAtChapter.volume || null,
          chapter: nextChapter,
        },
        readingStatus: isCompleted ? 2 : (latestProgress?.readingStatus || 1),
        readingDescription: null,
      });
      setLatestProgressByFormat((prev) => ({ ...prev, [activeFormat.workType]: created }));
      if (isCompleted) {
        showToast(`Parabéns! Obra concluída no formato ${WorkTypeLabels[activeFormat.workType]}.`, 'success');
      }
      handleProgressChanged();
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
      handleProgressChanged();
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
            const fProg =
              (isSelected && formatRecords.length > 0 ? formatRecords[0] : null) ||
              latestProgressByFormat[f.workType] ||
              (progressList && progressList.find((p) => p.workType === f.workType));
            const fCurrent = fProg ? fProg.stoppedAtChapter.chapter : 0;
            const fPct = f.totalChapter.chapter > 0 ? Math.round((fCurrent / f.totalChapter.chapter) * 100) : 0;

            return (
              <button
                key={f.workType}
                type="button"
                onClick={() => {
                  setSelectedWorkType(f.workType);
                  updateNavParams({ format: f.workType });
                }}
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

        {loadingInitial ? (
          <JournalItemsSkeleton count={3} />
        ) : formatRecords.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
            Nenhum registro de {isWatchable(activeFormat.workType) ? 'episódio' : 'capítulo'} para este formato ainda.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {formatRecords.map((p) => (
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc' }}>
                      {getUnitLabel(p.workType)} {p.stoppedAtChapter.chapter}
                    </span>
                    {p.stoppedAtChapter.volume && (
                      <span className="badge badge-tag" style={{ fontSize: '0.7rem' }}>
                        {isWatchable(p.workType) ? 'Temporada' : 'Volume'} {p.stoppedAtChapter.volume}
                      </span>
                    )}
                    <span className={`badge ${p.readingStatus === 1 ? 'badge-novel' : 'badge-status'}`} style={{ fontSize: '0.7rem' }}>
                      {getStatusLabel(p.readingStatus)}
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
                          fontSize: '0.72rem',
                          color: '#38bdf8',
                          textDecoration: 'none',
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: 4,
                          padding: '1px 7px',
                          fontWeight: 500,
                          transition: 'all 0.15s ease',
                        }}
                        title={`Abrir link do ${getUnitLabel(p.workType).toLowerCase()}`}
                      >
                        <ExternalLink size={12} />
                        <span>Link do {getUnitLabel(p.workType)}</span>
                      </a>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {new Date(p.stoppedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        onClick={() => setProgressToEdit(p)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                        title="Editar anotação"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setProgressToDeleteId(p.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                        title="Excluir registro"
                      >
                        <Trash2 size={13} />
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

            {loadingMore && <JournalItemsSkeleton count={3} />}

            {hasMore && (
              <div
                ref={sentinelRef}
                style={{
                  height: 20,
                  width: '100%',
                }}
              />
            )}
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
          onCreated={handleProgressChanged}
        />
      )}

      {progressToEdit && (
        <EditProgressModal
          isOpen={!!progressToEdit}
          workId={work.id}
          progress={progressToEdit}
          onClose={() => setProgressToEdit(null)}
          onSaved={handleProgressChanged}
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
