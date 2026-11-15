import React, { useState } from 'react';
import type { Progress, Work } from '../types';
import { progressApi } from '../services/api';
import { CreateProgressModal } from './CreateProgressModal';
import { BookMarked, Plus, Trash2 } from 'lucide-react';

interface Props {
  work: Work;
  progressList: Progress[];
  onProgressUpdated: () => void;
}

export const ReadingJournal: React.FC<Props> = ({ work, progressList, onProgressUpdated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingQuickAdd, setLoadingQuickAdd] = useState(false);

  const latestProgress = progressList[0];
  const currentChapter = latestProgress ? latestProgress.stoppedAtChapter.chapter : 0;
  const totalChapter = work.totalChapter.chapter;
  const pct = totalChapter > 0 ? ((currentChapter / totalChapter) * 100).toFixed(1) : '0';

  const handleQuickAddChapter = async () => {
    setLoadingQuickAdd(true);
    try {
      await progressApi.create({
        workId: work.id,
        stoppedAtChapter: {
          volume: latestProgress?.stoppedAtChapter.volume || null,
          chapter: currentChapter + 1,
        },
        readingStatus: latestProgress?.readingStatus || 1,
        readingDescription: null,
      });
      onProgressUpdated();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao avançar capítulo.');
    } finally {
      setLoadingQuickAdd(false);
    }
  };

  const handleDeleteProgress = async (id: string) => {
    if (!confirm('Deseja excluir este registro de progresso?')) return;
    try {
      await progressApi.delete(work.id, id);
      onProgressUpdated();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir progresso.');
    }
  };

  return (
    <section style={{ background: '#162032', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
      {/* Barra de Progresso Atual */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
            Progresso Atual da Leitura
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 4 }}>
            Capítulo {currentChapter}{' '}
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              / {totalChapter} ({pct}%)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleQuickAddChapter}
            disabled={loadingQuickAdd}
            className="btn-secondary"
            style={{ padding: '8px 14px' }}
            title="Avança 1 capítulo imediatamente"
          >
            +1 Capítulo
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

      {/* Diário de Leitura & Reflexões */}
      <div style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <BookMarked size={16} color="#c084fc" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>Diário de Leitura & Reflexões ({progressList.length})</h3>
        </div>

        {progressList.length === 0 ? (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>
            Nenhum progresso ou anotação registrado ainda. Clique em "Registrar Progresso" para começar.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {progressList.map((p) => (
              <div
                key={p.id}
                style={{
                  background: '#0c121e',
                  border: '1px solid #1e293b',
                  borderLeft: '3px solid #8b5cf6',
                  padding: '12px 16px',
                  borderRadius: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: '#c084fc', fontSize: '0.9rem' }}>
                      Capítulo {p.stoppedAtChapter.chapter}
                    </span>
                    {p.stoppedAtChapter.volume && (
                      <span className="badge-tag" style={{ fontSize: '0.65rem' }}>
                        Vol. {p.stoppedAtChapter.volume}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {new Date(p.stoppedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    <button
                      onClick={() => handleDeleteProgress(p.id)}
                      style={{ color: '#64748b', padding: 2 }}
                      title="Excluir anotação"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {p.readingDescription ? (
                  <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginTop: 4 }}>
                    {p.readingDescription}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Parada registrada sem anotações adicionais.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateProgressModal
        isOpen={isModalOpen}
        workId={work.id}
        lastChapter={currentChapter}
        onClose={() => setIsModalOpen(false)}
        onCreated={onProgressUpdated}
      />
    </section>
  );
};
