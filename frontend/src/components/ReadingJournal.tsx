import React, { useState } from 'react';
import type { Progress, Work, WorkType } from '../types';
import { WorkTypeLabels } from '../types';
import { progressApi } from '../services/api';
import { CreateProgressModal } from './CreateProgressModal';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../context/ToastContext';
import { BookMarked, Plus, Trash2, ExternalLink } from 'lucide-react';
import {
  getUnitLabel,
  getActionLabel,
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
  const { showToast } = useToast();

  // Fallback se o formato selecionado não existir mais na obra
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

  // Filtra o progresso exclusivo deste formato
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
    await progressApi.delete(work.id, progressToDeleteId);
    showToast('Registro de progresso excluído.', 'info');
    onProgressUpdated();
    setProgressToDeleteId(null);
  };

  return (
    <section style={{ background: '#162032', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
      {/* Seletor de Formatos (Pílulas) */}
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
                    fontSize: '0.72rem',
                    padding: '2px 6px',
                    borderRadius: 6,
                    background: isSelected ? 'rgba(139, 92, 246, 0.25)' : '#1e293b',
                    color: isSelected ? '#c084fc' : '#64748b',
                  }}
                >
                  {getUnitLabel(f.workType, { short: true })} {fCurrent}/{f.totalChapter.chapter} ({fPct}%)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Barra de Progresso do Formato Ativo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
              Progresso em {WorkTypeLabels[activeFormat.workType]}
            </span>
            {activeFormat.linkWhereToRead && (
              <a
                href={activeFormat.linkWhereToRead}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '0.72rem',
                  color: '#60a5fa',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  textDecoration: 'none',
                }}
              >
                {getActionLabel(activeFormat.workType)} online <ExternalLink size={11} />
              </a>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              {getUnitLabel(activeFormat.workType)} {currentChapter}{' '}
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                / {totalChapter} ({pct}%)
              </span>
            </div>
            {latestProgress?.chapterLink && (
              <a
                href={latestProgress.chapterLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '0.8rem',
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '4px 10px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
                title={`Acessar o link do último ${getUnitLabel(activeFormat.workType).toLowerCase()} registrado`}
              >
                Acessar {getUnitLabel(activeFormat.workType, { short: true })} {currentChapter} <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleQuickAddChapter}
            disabled={loadingQuickAdd || currentChapter >= totalChapter}
            className="btn-secondary"
            style={{ padding: '8px 14px' }}
            title={`Avança 1 ${getUnitLabel(activeFormat.workType).toLowerCase()} imediatamente neste formato`}
          >
            +1 {getUnitLabel(activeFormat.workType)}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
            style={{ padding: '8px 16px' }}
          >
            <Plus size={16} /> Registrar Progresso
          </button>
        </div>
      </div>

      {/* Barra Visual */}
      <div style={{ width: '100%', height: 10, background: '#1e293b', borderRadius: 99, overflow: 'hidden', margin: '14px 0 16px' }}>
        <div style={{ width: `${Math.min(parseFloat(pct), 100)}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #38bdf8)', borderRadius: 99 }} />
      </div>

      {/* Diário de Acompanhamento & Reflexões Exclusivo deste Formato */}
      <div style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <BookMarked size={16} color="#c084fc" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>
            Diário de Acompanhamento ({WorkTypeLabels[activeFormat.workType]}) ({formatProgressList.length})
          </h3>
        </div>

        {formatProgressList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Nenhum progresso ou anotação registrado para {WorkTypeLabels[activeFormat.workType]} ainda. Clique em "Registrar Progresso" para começar.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {formatProgressList.map((p) => (
              <div
                key={p.id}
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 8,
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
                      {getUnitLabel(p.workType)} {p.stoppedAtChapter.chapter}
                    </span>
                    {p.stoppedAtChapter.volume && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ({isWatchable(p.workType) ? 'Temp.' : 'Vol.'} {p.stoppedAtChapter.volume})
                      </span>
                    )}
                    <span className="badge badge-tag" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
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
                          gap: 3,
                          fontSize: '0.74rem',
                          color: '#38bdf8',
                          textDecoration: 'none',
                        }}
                        title={`Abrir link deste ${getUnitLabel(p.workType).toLowerCase()}`}
                      >
                        <ExternalLink size={12} /> Acessar {getUnitLabel(p.workType)}
                      </a>
                    )}
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: 'auto' }}>
                      {new Date(p.stoppedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {p.readingDescription && (
                    <p style={{ color: '#cbd5e1', fontSize: '0.84rem', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {p.readingDescription}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setProgressToDeleteId(p.id)}
                  style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                  title="Excluir anotação"
                >
                  <Trash2 size={14} />
                </button>
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
