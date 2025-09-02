import { CiteEngine, CitationStyle } from '../interfaces';

// Import citeproc from npm
import CSL from 'citeproc';

export class CiteProcEngine implements CiteEngine {
  private processor: any = null;

  async init(opts: { styleXml: string; localeXml: string }): Promise<void> {
    // Parse style and locale
    const style = CSL.parseXml(opts.styleXml);
    const locale = CSL.parseXml(opts.localeXml);

    // Create processor
    this.processor = new CSL.Engine(style, locale);
  }

  formatInText(keys: string[], ctx: { style: CitationStyle; seqMap?: Record<string, number> }): string {
    if (!this.processor) {
      throw new Error('Engine not initialized');
    }

    // Set citation items
    const citationItems = keys.map(key => ({ id: key }));

    // Configure processor for in-text citation
    this.processor.updateItems(keys);

    // Generate citation
    const citation = this.processor.makeCitationCluster(citationItems);

    return citation[1]; // The formatted citation string
  }

  formatBibliography(keysInOrder: string[]): string {
    if (!this.processor) {
      throw new Error('Engine not initialized');
    }

    // Update items
    this.processor.updateItems(keysInOrder);

    // Generate bibliography
    const bibliography = this.processor.makeBibliography();

    return bibliography[1].join(''); // HTML string
  }
}
