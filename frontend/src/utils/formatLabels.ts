import type { ReadingStatus, WorkType } from '../types';
import { WorkTypeLabels } from '../types';

export const isWatchable = (workType: WorkType): boolean => {
  return workType >= 6;
};

export const getUnitLabel = (
  workType: WorkType,
  options?: { plural?: boolean; short?: boolean }
): string => {
  const watchable = isWatchable(workType);
  if (watchable) {
    if (options?.short) {
      return options?.plural ? 'Eps.' : 'Ep.';
    }
    return options?.plural ? 'Episódios' : 'Episódio';
  }

  if (options?.short) {
    return options?.plural ? 'Caps.' : 'Cap.';
  }
  return options?.plural ? 'Capítulos' : 'Capítulo';
};

export const getActionLabel = (workType: WorkType): string => {
  return isWatchable(workType) ? 'Assistir' : 'Ler';
};

export const getStatusLabel = (status: ReadingStatus, workType?: WorkType): string => {
  const watchable = workType ? isWatchable(workType) : false;
  switch (status) {
    case 1:
      return watchable ? 'Assistindo' : 'Lendo';
    case 2:
      return 'Concluído';
    case 3:
      return 'Pausado';
    case 4:
      return watchable ? 'Planejo Assistir' : 'Planejo Ler';
    case 5:
      return 'Abandonado';
    default:
      return 'Desconhecido';
  }
};

export const getAvailableUpToLabel = (workType: WorkType): string => {
  return isWatchable(workType) ? 'Disponível até Episódio' : 'Traduzido até Capítulo';
};

export const getWhereToConsumeLabel = (workType: WorkType): string => {
  return isWatchable(workType) ? 'Onde assistir' : 'Onde ler';
};

export const getWhereToConsumePlaceholder = (workType: WorkType): string => {
  const label = WorkTypeLabels[workType]?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'obra';
  return isWatchable(workType)
    ? `Ex: https://site-streaming-${label}.com`
    : `Ex: https://site-leitura-${label}.com`;
};
