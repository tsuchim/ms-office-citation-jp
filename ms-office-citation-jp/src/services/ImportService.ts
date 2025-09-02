import { z } from 'zod';
import Cite from '@citation-js/core';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-ris';
import '@citation-js/plugin-csl';

const CSLJSONSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  title: z.string().optional(),
  author: z.array(z.object({ family: z.string().optional(), given: z.string().optional() })).optional(),
  issued: z.any().optional(),
  DOI: z.string().optional(),
  ISBN: z.string().optional(),
}).passthrough();
export type CSLItem = z.infer<typeof CSLJSONSchema>;

export class ImportService {
  static toCSLJSON(input: string, format: 'bibtex'|'ris'|'csljson'): CSLItem[] {
    if (format === 'csljson') {
      const parsed = JSON.parse(input);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      return arr.map(x => CSLJSONSchema.parse(x));
    }
    const cite = new Cite(input, { forceType: format });
    const data = cite.get({ type: 'json', style: 'csl' }) as any[];
    return data.map(x => CSLJSONSchema.parse(x));
  }

  static stableKey(it: CSLItem): string {
    if (it.DOI)  return `doi:${it.DOI.toLowerCase()}`;
    if (it.ISBN) return `isbn:${it.ISBN.replace(/-/g,'')}`;
    const year = (it as any).issued?.['date-parts']?.[0]?.[0] ?? '';
    const title = (it.title ?? '').trim().toLowerCase().replace(/\s+/g,' ');
    const au = (it.author?.[0]?.family ?? '').toLowerCase();
    return `local:${au}|${year}|${title}`;
  }
}
