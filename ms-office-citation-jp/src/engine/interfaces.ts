import { CitationOptions } from '../storage/DocStore';

export type CitationStyle = 'author-date' | 'numeric';

export interface CiteEngine {
  init(opts: { styleXml: string; localeXml: string }): Promise<void>;
  formatInText(keys: string[], ctx: { style: CitationStyle; seqMap?: Record<string, number>; options?: CitationOptions }): Promise<string>;
  formatBibliography(keysInOrder: string[], style?: CitationStyle): Promise<string>; // HTML
}
