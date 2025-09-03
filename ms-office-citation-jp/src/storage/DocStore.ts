export type CitationStyle = 'author-date' | 'numeric';
export type CitationOptions = { key?: string; locator?: string; prefix?: string; suffix?: string; suppressAuthor?: boolean; suppressYear?: boolean };
export type CiteTag = { keys: string[]; style: CitationStyle; seq?: number|null; options?: CitationOptions | CitationOptions[] };
export type DocMetaTag = { style: CitationStyle; locale: 'ja'|'en'; map?: Record<string, number> };

export const Titles = {
  Cite: 'JIS-Cite',
  Bib: 'JIS-Bibliography',
  Meta: 'JIS-DocMeta',
} as const;
