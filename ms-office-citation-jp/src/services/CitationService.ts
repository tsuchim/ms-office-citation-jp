import { WordApi } from '../office/WordApi';
import { CiteEngine, CitationStyle } from '../engine/interfaces';

export class CitationService {
  private engine: CiteEngine;

  constructor(engine: CiteEngine) {
    this.engine = engine;
  }

  async updateCitations(style: CitationStyle): Promise<void> {
    const citeCCs = await WordApi.enumerateCiteCCs();

    // Collect all keys and their order
    const keyOrder: string[] = [];
    const keySet = new Set<string>();

    for (const cc of citeCCs) {
      const tag = JSON.parse(cc.tag);
      const keys = tag.keys as string[];
      keys.forEach(key => {
        if (!keySet.has(key)) {
          keySet.add(key);
          keyOrder.push(key);
        }
      });
    }

    // Create seqMap for numeric style
    const seqMap: Record<string, number> = {};
    if (style === 'numeric') {
      keyOrder.forEach((key, index) => {
        seqMap[key] = index + 1;
      });
    }

    // Update each citation CC
    for (const cc of citeCCs) {
      const tag = JSON.parse(cc.tag);
      const keys = tag.keys as string[];
      const newText = this.engine.formatInText(keys, { style, seqMap });
      cc.insertText(newText, Word.InsertLocation.replace);
    }

    await Word.run(async (context) => {
      await context.sync();
    });
  }
}
