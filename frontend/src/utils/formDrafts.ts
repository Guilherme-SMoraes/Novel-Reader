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
const SESSIONS_PREFIX = 'novelreader_sessions_';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const saveSessionList = (type: 'character' | 'attachment', workId: string, sessionIds: string[]): void => {
  try {
    const key = `${SESSIONS_PREFIX}${type}_${workId}`;
    if (sessionIds.length === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(sessionIds));
    }
  } catch (err: unknown) {
    console.error('Failed to save session list', err);
  }
};

export const getSessionList = (type: 'character' | 'attachment', workId: string): string[] => {
  try {
    const key = `${SESSIONS_PREFIX}${type}_${workId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch (err: unknown) {
    console.error('Failed to get session list', err);
    return [];
  }
};

export const removeSessionFromList = (type: 'character' | 'attachment', workId: string, sessionId: string): void => {
  try {
    const current = getSessionList(type, workId);
    const updated = current.filter((id) => id !== sessionId);
    saveSessionList(type, workId, updated);
  } catch (err: unknown) {
    console.error('Failed to remove session from list', err);
  }
};

export const saveFormDraft = (sessionKey: string, meta: Omit<ActiveDraftMeta, 'sessionKey' | 'updatedAt'>, data: unknown): void => {
  try {
    const fullMeta: ActiveDraftMeta = {
      ...meta,
      sessionKey,
      updatedAt: Date.now(),
    };
    localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(fullMeta));
    localStorage.setItem(
      `${DRAFT_PREFIX}${sessionKey}`,
      JSON.stringify({
        data,
        meta: fullMeta,
      })
    );
  } catch (err: unknown) {
    console.error('Failed to save form draft to localStorage', err);
  }
};

export const getFormDraft = <T>(sessionKey: string): T | null => {
  try {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${sessionKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'data' in parsed) {
      return parsed.data as T;
    }
    return parsed as T;
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

export const discardDraft = (sessionKey: string, type?: DraftType, workId?: string): void => {
  try {
    clearFormDraft(sessionKey);
    if (type && workId && (type === 'character' || type === 'attachment')) {
      removeSessionFromList(type, workId, sessionKey);
    }
  } catch (err: unknown) {
    console.error('Failed to discard draft', err);
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

export const cleanupExpiredDrafts = (maxAgeMs = SEVEN_DAYS_MS): void => {
  try {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(DRAFT_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const updatedAt = parsed?.meta?.updatedAt;
            if (updatedAt && typeof updatedAt === 'number' && now - updatedAt > maxAgeMs) {
              keysToRemove.push(key);
            }
          } catch (parseErr: unknown) {
            keysToRemove.push(key);
          }
        }
      }
    }

    keysToRemove.forEach((k) => localStorage.removeItem(k));

    const activeMeta = getActiveDraftMeta();
    if (activeMeta && now - activeMeta.updatedAt > maxAgeMs) {
      clearActiveDraftMeta();
    }
  } catch (err: unknown) {
    console.error('Failed to cleanup expired drafts', err);
  }
};

export const clearWorkDrafts = (workId: string): void => {
  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        if (key.includes(workId)) {
          keysToRemove.push(key);
        } else if (key.startsWith(DRAFT_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed?.meta?.workId === workId) {
                keysToRemove.push(key);
              }
            } catch (parseErr: unknown) {
              console.error('Error parsing draft during work cleanup', parseErr);
            }
          }
        }
      }
    }

    keysToRemove.forEach((k) => localStorage.removeItem(k));

    const activeMeta = getActiveDraftMeta();
    if (activeMeta && activeMeta.workId === workId) {
      clearActiveDraftMeta();
    }
  } catch (err: unknown) {
    console.error('Failed to clear work drafts', err);
  }
};
