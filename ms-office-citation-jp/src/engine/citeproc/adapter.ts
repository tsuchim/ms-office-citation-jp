import { CiteEngine, CitationStyle } from '../interfaces';
import CSL from 'citeproc';
import { UserStore } from '../../storage/UserStore';
import { ImportService } from '../../services/ImportService';

export class CiteProcEngine implements CiteEngine {
  private processor: any = null;
  private items: Record<string, any> = {};
  private localeXml = '';

  async init(opts: { styleXml: string; localeXml: string }): Promise<void> {
    this.localeXml = opts.localeXml;
    const sys = {
      retrieveLocale: (_lang: string) => this.localeXml,
      retrieveItem: (id: string) => this.items[id],
      // Minimal stubs
      getAbbreviation: () => null,
      state: {} as any,
    } as any;
    this.processor = new CSL.Engine(sys, opts.styleXml);
  }

  private async ensureItems(keys: string[]): Promise<void> {
    // Load library and map requested keys to items
    const lib: any[] = await UserStore.loadLibrary();
    // Build index by stable key for quick lookup
    const index = new Map<string, any>();
    for (const it of lib) {
      const k = ImportService.stableKey(it);
      if (!index.has(k)) index.set(k, it);
    }
    for (const k of keys) {
      const it = index.get(k);
      if (it) {
        // Clone and force id to key to satisfy citeproc
        this.items[k] = { ...it, id: k };
      } else {
        // Missing item placeholder
        this.items[k] = { id: k, title: '[?]' };
      }
    }
  }

  async formatInText(keys: string[], _ctx: { style: CitationStyle; seqMap?: Record<string, number> }): Promise<string> {
    if (!this.processor) throw new Error('Engine not initialized');
    await this.ensureItems(keys);
    const citationItems = keys.map((id) => ({ id }));
    try {
      this.processor.updateItems(keys);
      const out = this.processor.makeCitationCluster(citationItems);
      if (typeof out === 'string') return out;
      if (Array.isArray(out)) {
        if (typeof out[1] === 'string') return out[1];
        if (Array.isArray(out[1])) return out[1].join('');
      }
    } catch (e) {
      console.error('formatInText failed, fallback to keys', e);
    }
    return `(${keys.join('; ')})`;
  }

  async formatBibliography(keysInOrder: string[]): Promise<string> {
    if (!this.processor) throw new Error('Engine not initialized');
    await this.ensureItems(keysInOrder);
    try {
      this.processor.updateItems(keysInOrder);
      const bibliography = this.processor.makeBibliography();
      if (Array.isArray(bibliography) && Array.isArray(bibliography[1])) {
        return bibliography[1].join('');
      }
    } catch (e) {
      console.error('formatBibliography failed, fallback to plain list', e);
    }
    return keysInOrder.map((k) => `- ${k}`).join('\n');
  }
}
