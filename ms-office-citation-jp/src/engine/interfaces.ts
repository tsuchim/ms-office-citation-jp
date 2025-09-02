export type CitationStyle = 'author-date' | 'numeric';

export interface CiteEngine {
  init(opts: { styleXml: string; localeXml: string }): Promise<void>;
  formatInText(keys: string[], ctx: { style: CitationStyle; seqMap?: Record<string, number> }): string;
  formatBibliography(keysInOrder: string[]): string; // HTML
}
