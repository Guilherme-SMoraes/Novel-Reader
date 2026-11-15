export type WorkType = 1 | 2 | 3 | 4 | 5;
export const WorkTypeLabels: Record<WorkType, string> = {
  1: 'Novel',
  2: 'Web Novel',
  3: 'Manga',
  4: 'Manhwa',
  5: 'Manhua',
};

export type Language = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const LanguageLabels: Record<Language, string> = {
  1: 'Português',
  2: 'Inglês',
  3: 'Coreano',
  4: 'Japonês',
  5: 'Chinês',
  6: 'Espanhol',
  7: 'Outro',
};

export type ReadingStatus = 1 | 2 | 3 | 4 | 5;
export const ReadingStatusLabels: Record<ReadingStatus, string> = {
  1: 'Lendo',
  2: 'Concluído',
  3: 'Pausado',
  4: 'Planejo Ler',
  5: 'Abandonado',
};

export type CharacterType = 1 | 2 | 3 | 4;
export const CharacterTypeLabels: Record<CharacterType, string> = {
  1: 'Protagonista',
  2: 'Antagonista',
  3: 'Coadjuvante',
  4: 'Extra',
};

export interface WorkChapter {
  volume: number | null;
  chapter: number;
}

export interface Work {
  id: string;
  title: string;
  description: string | null;
  workType: WorkType;
  aggregatorLink: string;
  linkWhereToRead: string | null;
  coverImageUrl: string | null;
  totalChapter: WorkChapter;
  translatedUpTo: WorkChapter | null;
  isFullyTranslated: boolean | null;
  originalLanguage: Language;
  translatedLanguage: Language | null;
  genres?: Genre[];
}

export interface CreateWorkRequest {
  title: string;
  description?: string | null;
  workType: WorkType;
  aggregatorLink: string;
  linkWhereToRead?: string | null;
  coverImageUrl?: string | null;
  totalChapter: WorkChapter;
  originalLanguage: Language;
  genreIds?: string[];
}

export interface UpdateWorkRequest {
  title: string;
  description?: string | null;
  aggregatorLink: string;
  linkWhereToRead?: string | null;
  coverImageUrl?: string | null;
  totalChapter: WorkChapter;
  translatedUpTo?: WorkChapter | null;
  translatedLanguage?: Language | null;
  genreIds?: string[];
}

export interface Progress {
  id: string;
  workId: string;
  stoppedAtChapter: WorkChapter;
  readingStatus: ReadingStatus;
  readingDescription: string | null;
  stoppedAt: string;
}

export interface CreateProgressRequest {
  workId: string;
  stoppedAtChapter: WorkChapter;
  readingStatus: ReadingStatus;
  readingDescription?: string | null;
}

export interface Character {
  id: string;
  workId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  characterType: CharacterType;
  firstAppearance: WorkChapter;
}

export interface CreateCharacterRequest {
  workId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  characterType: CharacterType;
  firstAppearance: WorkChapter;
}

export interface UpdateCharacterRequest {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  characterType: CharacterType;
}

export interface Genre {
  id: string;
  name: string;
  description: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Attachment {
  id: string;
  workId: string;
  title: string;
  category: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateAttachmentRequest {
  title: string;
  category: string;
  content?: string | null;
  imageUrl?: string | null;
}

export interface UpdateAttachmentRequest {
  title: string;
  category: string;
  content?: string | null;
  imageUrl?: string | null;
}
