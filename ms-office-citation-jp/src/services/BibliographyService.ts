import { WordApi } from '../office/WordApi';
import { CiteEngine } from '../engine/interfaces';

export class BibliographyService {
  private engine: CiteEngine;

  constructor(engine: CiteEngine) {
    this.engine = engine;
  }

  async updateBibliography(): Promise<void> {
    const bibCC = await WordApi.findOrCreateBibliographyCC();

    // Collect all keys from citations
    const citeCCs = await WordApi.enumerateCiteCCs();
    const keySet = new Set<string>();

    for (const cc of citeCCs) {
      const tag = JSON.parse(cc.tag);
      const keys = tag.keys as string[];
      keys.forEach(key => keySet.add(key));
    }

    const keysInOrder = Array.from(keySet);
    const html = this.engine.formatBibliography(keysInOrder);

    // Replace content
    bibCC.insertHtml(html, Word.InsertLocation.replace);

    await Word.run(async (context) => {
      await context.sync();
    });
  }
}
