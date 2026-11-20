export type DraftType = 'work' | 'character' | 'attachment' | 'progress';
export type DraftMode = 'create' | 'edit';

export interface ActiveDraftMeta {
  type: DraftType;
  mode: DraftMode;
  workId?: string;
  entityId?: string;
  sessionKey: string;
  updatedAt: number;
}

const ACTIVE_DRAFT_KEY = 'novelreader_active_draft_meta';
const DRAFT_PREFIX = 'novelreader_draft_';

export const saveFormDraft = (sessionKey: string, meta: Omit<ActiveDraftMeta, 'sessionKey' | 'updatedAt'>, data: unknown): void => {
  try {
    const fullMeta: ActiveDraftMeta = {
      ...meta,
      sessionKey,
      updatedAt: Date.now(),
    };
    localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(fullMeta));
    localStorage.setItem(`${DRAFT_PREFIX}${sessionKey}`, JSON.stringify(data));
  } catch (err: unknown) {
    console.error('Failed to save form draft to localStorage', err);
  }
};

export const getFormDraft = <T>(sessionKey: string): T | null => {
  try {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${sessionKey}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    console.error('Failed to retrieve form draft from localStorage', err);
    return null;
  }
};

export const clearFormDraft = (sessionKey: string): void => {
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${sessionKey}`);
    const activeMeta = getActiveDraftMeta();
    if (activeMeta && activeMeta.sessionKey === sessionKey) {
      localStorage.removeItem(ACTIVE_DRAFT_KEY);
    }
  } catch (err: unknown) {
    console.error('Failed to clear form draft from localStorage', err);
  }
};

export const getActiveDraftMeta = (): ActiveDraftMeta | null => {
  try {
    const raw = localStorage.getItem(ACTIVE_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveDraftMeta;
  } catch (err: unknown) {
    console.error('Failed to parse active draft meta', err);
    return null;
  }
};

export const clearActiveDraftMeta = (): void => {
  try {
    localStorage.removeItem(ACTIVE_DRAFT_KEY);
  } catch (err: unknown) {
    console.error('Failed to clear active draft meta', err);
  }
};
