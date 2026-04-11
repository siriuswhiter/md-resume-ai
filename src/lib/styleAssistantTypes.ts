export interface SavedStyleTemplate {
  id: string;
  name: string;
  css: string;
  summary?: string;
  createdAt: string;
}

export interface GeneratedStyleTemplate {
  name: string;
  css: string;
  summary?: string;
}
