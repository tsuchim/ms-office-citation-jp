import { WordApi } from '../office/WordApi';
import { CiteEngine, CitationStyle } from '../engine/interfaces';
import { UserStore } from '../storage/UserStore';
import { CiteTag } from '../storage/DocStore';
import { Engine } from '../engine';

export class BibliographyService {
  private static engine: CiteEngine;

  static async init() {
    await Engine.initOnce();
    this.engine = Engine.engine;
  }

  static async rebuild(): Promise<void> {
    const bibCC = await WordApi.findOrCreateBibliographyCC();

    // Collect all keys from citations
    const citeCCs = await WordApi.enumerateCiteCCs();
    const keySet = new Set<string>();
    const keyOrder: string[] = [];

    for (const cc of citeCCs) {
      const tag: CiteTag = JSON.parse(cc.tag);
      const keys = tag.keys;
      keys.forEach(key => {
        if (!keySet.has(key)) {
          keySet.add(key);
          keyOrder.push(key);
        }
      });
    }

    // For numeric, sort by seq
    const settings = await UserStore.loadSettings<{ style: CitationStyle }>();
    const style = settings?.style || 'author-date';
    if (style === 'numeric') {
      // Assume seq is set in tags
      keyOrder.sort((a, b) => {
        const aSeq = citeCCs.find(cc => JSON.parse(cc.tag).keys.includes(a))?.tag ? JSON.parse(citeCCs.find(cc => JSON.parse(cc.tag).keys.includes(a))!.tag).seq : 0;
        const bSeq = citeCCs.find(cc => JSON.parse(cc.tag).keys.includes(b))?.tag ? JSON.parse(citeCCs.find(cc => JSON.parse(cc.tag).keys.includes(b))!.tag).seq : 0;
        return (aSeq || 0) - (bSeq || 0);
      });
    }

    const html = await BibliographyService.engine.formatBibliography(keyOrder);

    // Replace content
    bibCC.insertHtml(html, Word.InsertLocation.replace);

    await Word.run(async (context) => {
      await context.sync();
    });
  }

  static async formatBibliography(keys: string[]): Promise<string> {
    if (!this.engine) {
      await Engine.initOnce();
      this.engine = Engine.engine;
    }
    // TODO: Switch style if needed
    return await this.engine.formatBibliography(keys);
  }

  static async updateBibliographyInDocument(styleId: string): Promise<void> {
    // Update style in settings
    const settings: { style?: CitationStyle } = await UserStore.loadSettings() || {};
    settings.style = styleId as CitationStyle;
    await UserStore.saveSettings(settings);

    // TODO: Reinitialize engine with new style
    await Engine.initOnce();

    // Rebuild bibliography
    await this.rebuild();
  }
}
