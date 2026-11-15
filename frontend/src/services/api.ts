import type {
  Character,
  CreateCharacterRequest,
  CreateProgressRequest,
  CreateWorkRequest,
  Genre,
  PagedResult,
  Progress,
  ReadingStatus,
  Work,
  WorkType
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let errorMsg = `Erro na requisição: ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData.message) errorMsg = errData.message;
      else if (errData.errors) {
        errorMsg = Object.values(errData.errors).flat().join(', ');
      }
    } catch {
      // Ignora erro de parse de corpo caso resposta não seja JSON
    }
    throw new Error(errorMsg);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const worksApi = {
  getAll: (params?: {
    title?: string;
    workType?: WorkType;
    genreId?: string;
    readingStatus?: ReadingStatus;
    page?: number;
    pageSize?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.title) q.append('title', params.title);
    if (params?.workType) q.append('workType', params.workType.toString());
    if (params?.genreId) q.append('genreId', params.genreId);
    if (params?.readingStatus) q.append('readingStatus', params.readingStatus.toString());
    q.append('page', (params?.page || 1).toString());
    q.append('pageSize', (params?.pageSize || 20).toString());

    return request<PagedResult<Work>>(`/works?${q.toString()}`);
  },

  getById: (id: string) => request<Work>(`/works/${id}`),

  create: (data: CreateWorkRequest) =>
    request<Work>('/works', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/works/${id}`, {
      method: 'DELETE',
    }),

  addGenre: (workId: string, genreId: string) =>
    request<void>(`/works/${workId}/genres/${genreId}`, {
      method: 'POST',
    }),

  removeGenre: (workId: string, genreId: string) =>
    request<void>(`/works/${workId}/genres/${genreId}`, {
      method: 'DELETE',
    }),
};

export const progressApi = {
  getByWorkId: (workId: string, page = 1, pageSize = 20) =>
    request<PagedResult<Progress>>(`/works/${workId}/progress?page=${page}&pageSize=${pageSize}`),

  create: (data: CreateProgressRequest) =>
    request<Progress>(`/works/${data.workId}/progress`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (workId: string, id: string) =>
    request<void>(`/works/${workId}/progress/${id}`, {
      method: 'DELETE',
    }),
};

export const charactersApi = {
  getByWorkId: (workId: string, page = 1, pageSize = 50) =>
    request<PagedResult<Character>>(`/works/${workId}/characters?page=${page}&pageSize=${pageSize}`),

  create: (data: CreateCharacterRequest) =>
    request<Character>(`/works/${data.workId}/characters`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (workId: string, id: string) =>
    request<void>(`/works/${workId}/characters/${id}`, {
      method: 'DELETE',
    }),
};

export const genresApi = {
  getAll: (page = 1, pageSize = 100) =>
    request<PagedResult<Genre>>(`/genres?page=${page}&pageSize=${pageSize}`),

  create: (name: string, description?: string) =>
    request<Genre>('/genres', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),
};
