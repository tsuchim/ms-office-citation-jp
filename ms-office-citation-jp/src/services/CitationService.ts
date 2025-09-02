import { WordApi } from '../office/WordApi';
import { CiteEngine, CitationStyle } from '../engine/interfaces';
import { UserStore } from '../storage/UserStore';
import { CiteTag } from '../storage/DocStore';
import { Engine } from '../engine';

export class CitationService {
  private static engine: CiteEngine;

  static async init() {
    await Engine.initOnce();
    this.engine = Engine.engine;
  }

  static async insertAtSelection(keys: string[]): Promise<void> {
    const settings = await UserStore.loadSettings<{ style: CitationStyle }>();
    const style = settings?.style || 'author-date';
    const text = CitationService.engine.formatInText(keys, { style });
    const tag: CiteTag = { keys, style, seq: null };
    await WordApi.createCiteCCAtSelection(tag, text);
  }

  static async updateAll(): Promise<void> {
    const citeCCs = await WordApi.enumerateCiteCCs();

    // Collect all keys and their order
    const keyOrder: string[] = [];
    const keySet = new Set<string>();

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

    // Create seqMap for numeric style
    const seqMap: Record<string, number> = {};
    const settings = await UserStore.loadSettings<{ style: CitationStyle }>();
    const style = settings?.style || 'author-date';
    if (style === 'numeric') {
      keyOrder.forEach((key, index) => {
        seqMap[key] = index + 1;
      });
    }

    // Update each citation CC
    for (const cc of citeCCs) {
      const tag: CiteTag = JSON.parse(cc.tag);
      const keys = tag.keys;
      const newText = CitationService.engine.formatInText(keys, { style, seqMap });
      cc.insertText(newText, Word.InsertLocation.replace);
    }

    await Word.run(async (context) => {
      await context.sync();
    });
  }
}
