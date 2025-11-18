import axios from 'axios';
import type { Note, NoteCreate, NoteUpdate, Tag, SearchResult, ExportData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Notes API
export const notesApi = {
  getAll: async (skip = 0, limit = 100): Promise<Note[]> => {
    const response = await api.get(`/api/notes?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getByDate: async (date: string): Promise<Note> => {
    const response = await api.get(`/api/notes/${date}`);
    return response.data;
  },

  create: async (noteData: NoteCreate): Promise<Note> => {
    const response = await api.post('/api/notes/', noteData);
    return response.data;
  },

  update: async (date: string, noteData: NoteUpdate): Promise<Note> => {
    const response = await api.put(`/api/notes/${date}`, noteData);
    return response.data;
  },

  delete: async (date: string): Promise<void> => {
    await api.delete(`/api/notes/${date}`);
  },
};

// Tags API
export const tagsApi = {
  getAll: async (): Promise<Tag[]> => {
    const response = await api.get('/api/tags/');
    return response.data;
  },

  create: async (name: string): Promise<Tag> => {
    const response = await api.post('/api/tags/', { name });
    return response.data;
  },

  delete: async (tagId: number): Promise<void> => {
    await api.delete(`/api/tags/${tagId}`);
  },
};

// Search API
export const searchApi = {
  search: async (query: string, tagId?: number): Promise<SearchResult> => {
    const params = new URLSearchParams({ q: query });
    if (tagId) {
      params.append('tag_id', tagId.toString());
    }
    const response = await api.get(`/api/search/?${params.toString()}`);
    return response.data;
  },
};

// Export API
export const exportApi = {
  exportAll: async (): Promise<ExportData> => {
    const response = await api.get('/api/export/');
    return response.data;
  },

  exportMarkdown: async (): Promise<{ filename: string; content: string }> => {
    const response = await api.get('/api/export/markdown');
    return response.data;
  },

  exportSelected: async (dates: string[]): Promise<{ filename: string; content: string }> => {
    const response = await api.post('/api/export/markdown/selected', { dates });
    return response.data;
  },
};

export default api;
