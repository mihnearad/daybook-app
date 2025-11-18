export interface Tag {
  id: number;
  name: string;
}

export interface Note {
  id: number;
  date: string;
  content: string;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

export interface NoteCreate {
  date: string;
  content: string;
  tag_ids: number[];
}

export interface NoteUpdate {
  content?: string;
  tag_ids?: number[];
}

export interface SearchResult {
  notes: Note[];
  total: number;
}

export interface ExportData {
  notes: Note[];
  tags: Tag[];
  exported_at: string;
}
