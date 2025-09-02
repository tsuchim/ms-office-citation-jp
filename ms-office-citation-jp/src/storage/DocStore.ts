export type CitationStyle = 'author-date' | 'numeric';
export type CiteTag = { keys: string[]; style: CitationStyle; seq?: number|null };
export type DocMetaTag = { style: CitationStyle; locale: 'ja'|'en'; map?: Record<string, number> };

export const Titles = {
  Cite: 'JIS-Cite',
  Bib: 'JIS-Bibliography',
  Meta: 'JIS-DocMeta',
} as const;
