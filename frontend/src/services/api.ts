import type {
  Attachment,
  Character,
  CreateAttachmentRequest,
  CreateCharacterRequest,
  CreateProgressRequest,
  CreateWorkRequest,
  Genre,
  PagedResult,
  Progress,
  ReadingStatus,
  UpdateAttachmentRequest,
  UpdateCharacterRequest,
  UpdateWorkRequest,
  Work,
  WorkType,
  User,
  AuthResponse
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';
const TOKEN_KEY = 'novelreader_auth_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
};

let isServerWaking = false;

function setServerWaking(waking: boolean) {
  if (isServerWaking !== waking) {
    isServerWaking = waking;
    window.dispatchEvent(new CustomEvent(waking ? 'server:waking' : 'server:ready'));
  }
}

async function request<T>(endpoint: string, options?: RequestInit, retryCount = 0): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if ([502, 503, 504].includes(res.status) && retryCount < 8) {
      setServerWaking(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return await request<T>(endpoint, options, retryCount + 1);
    }

    if (!res.ok) {
      if (res.status === 401 && endpoint !== '/auth/google') {
        authStorage.removeToken();
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }

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

    setServerWaking(false);

    if (res.status === 204) {
      return {} as T;
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.includes('Failed to fetch') && retryCount < 8) {
      setServerWaking(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return await request<T>(endpoint, options, retryCount + 1);
    }
    throw err;
  }
}

export const healthApi = {
  check: () => request<{ status: string }>('/health'),
};

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

  update: (id: string, data: UpdateWorkRequest) =>
    request<void>(`/works/${id}`, {
      method: 'PUT',
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
  getByWorkId: (workId: string, workType?: WorkType, page = 1, pageSize = 20) => {
    const q = new URLSearchParams();
    if (workType) q.append('workType', workType.toString());
    q.append('page', page.toString());
    q.append('pageSize', pageSize.toString());
    return request<PagedResult<Progress>>(`/works/${workId}/progress?${q.toString()}`);
  },

  create: (data: CreateProgressRequest) =>
    request<Progress>(`/works/${data.workId}/progress`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateDescription: (workId: string, id: string, description: string | null) =>
    request<void>(`/works/${workId}/progress/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ description }),
    }),

  delete: (workId: string, id: string) =>
    request<void>(`/works/${workId}/progress/${id}`, {
      method: 'DELETE',
    }),
};

export const charactersApi = {
  getByWorkId: (workId: string, page = 1, pageSize = 500, affiliation?: string) => {
    const q = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (affiliation && affiliation.trim()) {
      q.append('affiliation', affiliation.trim());
    }
    return request<PagedResult<Character>>(`/works/${workId}/characters?${q.toString()}`);
  },

  create: (data: CreateCharacterRequest) =>
    request<Character>(`/works/${data.workId}/characters`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (workId: string, id: string, data: UpdateCharacterRequest) =>
    request<void>(`/works/${workId}/characters/${id}`, {
      method: 'PUT',
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

  delete: (id: string) =>
    request<void>(`/genres/${id}`, {
      method: 'DELETE',
    }),
};

export const attachmentsApi = {
  getByWorkId: (workId: string) =>
    request<Attachment[]>(`/works/${workId}/attachments`),

  create: (workId: string, data: CreateAttachmentRequest) =>
    request<Attachment>(`/works/${workId}/attachments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateAttachmentRequest) =>
    request<Attachment>(`/attachments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/attachments/${id}`, {
      method: 'DELETE',
    }),
};

export const imagesApi = {
  upload: async (file: File): Promise<{ url: string }> => {
    const imgbbKey = import.meta.env.VITE_IMGBB_API_KEY;

    if (imgbbKey) {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(imgbbKey)}`, {
        method: 'POST',
        body: formData,
      });

      let data: { success?: boolean; data?: { url?: string }; error?: { message?: string } } | null = null;
      try {
        data = await res.json();
      } catch {
        // Ignore json parse error
      }

      if (!res.ok || !data?.success) {
        const errorMsg = data?.error?.message || `Erro no ImgBB (${res.statusText})`;
        throw new Error(`ImgBB error: ${errorMsg}`);
      }

      if (!data?.data?.url) {
        throw new Error('ImgBB não retornou a URL da imagem.');
      }

      return { url: data.data.url };
    }

    const formData = new FormData();
    formData.append('file', file);

    const token = authStorage.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/images/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      if (res.status === 401) {
        authStorage.removeToken();
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }

      let errorMsg = `Erro no upload da imagem: ${res.statusText}`;
      try {
        const errData = await res.json();
        if (errData.message) errorMsg = errData.message;
        else if (errData.errors) {
          errorMsg = Object.values(errData.errors).flat().join(', ');
        }
      } catch {
        // Ignore body parsing errors on non-json error responses
      }
      throw new Error(errorMsg);
    }

    return res.json();
  },
};

export const authApi = {
  googleLogin: (idToken: string) =>
    request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),
  getMe: () => request<User>('/auth/me'),
};
