export type NavTab = 'journal' | 'characters' | 'attachments';

interface NavState {
  workId: string | null;
  tab: NavTab;
  format: number | null;
}

const STORAGE_KEY = 'novelreader_nav_state';
const SCROLL_PREFIX = 'novelreader_scroll_';

export function getNavParams(): NavState {
  if (typeof window === 'undefined') {
    return { workId: null, tab: 'journal', format: null };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const urlWorkId = searchParams.get('work');
  const urlTab = searchParams.get('tab') as NavTab | null;
  const urlFormat = searchParams.get('format');

  if (urlWorkId) {
    const validTab: NavTab = urlTab === 'characters' || urlTab === 'attachments' ? urlTab : 'journal';
    const parsedFormat = urlFormat ? parseInt(urlFormat, 10) : null;
    return {
      workId: urlWorkId,
      tab: validTab,
      format: parsedFormat && !isNaN(parsedFormat) ? parsedFormat : null,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.workId) {
        return {
          workId: parsed.workId,
          tab: parsed.tab === 'characters' || parsed.tab === 'attachments' ? parsed.tab : 'journal',
          format: typeof parsed.format === 'number' ? parsed.format : null,
        };
      }
    }
  } catch (err) {
    console.warn('Falha ao restaurar estado de navegação do storage:', err);
  }

  return { workId: null, tab: 'journal', format: null };
}

export function updateNavParams(updates: {
  workId?: string | null;
  tab?: NavTab | null;
  format?: number | null;
}): void {
  if (typeof window === 'undefined') return;

  const current = getNavParams();
  const nextWorkId = updates.workId !== undefined ? updates.workId : current.workId;
  const nextTab = updates.tab !== undefined && updates.tab !== null ? updates.tab : current.tab;
  const nextFormat = updates.format !== undefined ? updates.format : current.format;

  const params = new URLSearchParams();

  if (nextWorkId) {
    params.set('work', nextWorkId);
    if (nextTab && nextTab !== 'journal') {
      params.set('tab', nextTab);
    }
    if (nextFormat !== null && nextFormat !== undefined) {
      params.set('format', nextFormat.toString());
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          workId: nextWorkId,
          tab: nextTab,
          format: nextFormat,
        })
      );
    } catch (err) {
      console.warn('Falha ao persistir estado de navegação no storage:', err);
    }
  } else {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Falha ao remover estado de navegação do storage:', err);
    }
  }

  const queryStr = params.toString();
  const newUrl = queryStr ? `${window.location.pathname}?${queryStr}` : window.location.pathname;
  window.history.replaceState(null, '', newUrl);
}

export function saveScrollPosition(key: string, scrollTop: number): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`${SCROLL_PREFIX}${key}`, Math.round(scrollTop).toString());
  } catch (err) {
    console.warn('Falha ao salvar posição de rolagem:', err);
  }
}

export function getSavedScrollPosition(key: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const saved = sessionStorage.getItem(`${SCROLL_PREFIX}${key}`);
    return saved ? parseInt(saved, 10) || 0 : 0;
  } catch (err) {
    console.warn('Falha ao obter posição de rolagem:', err);
    return 0;
  }
}
