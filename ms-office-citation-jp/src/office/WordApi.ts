import { Titles, CiteTag } from '../storage/DocStore';

export class WordApi {
  private static async getDocument(): Promise<Word.Document> {
    return Word.run(async (context) => {
      const doc = context.document;
      await context.sync();
      return doc;
    });
  }

  static async findOrCreateBibliographyCC(): Promise<Word.ContentControl> {
    const doc = await this.getDocument();
    return Word.run(async (context) => {
      const ccs = doc.contentControls;
      ccs.load('items');
      await context.sync();

      // Find existing bibliography CC
      let bibCC = ccs.items.find(cc => cc.title === Titles.Bib);
      if (!bibCC) {
        // Create new
        bibCC = doc.body.insertContentControl();
        bibCC.title = Titles.Bib;
        bibCC.tag = 'msocj:bib';
        bibCC.appearance = Word.ContentControlAppearance.boundingBox;
        bibCC.color = '#CCCCCC';
      }
      await context.sync();
      return bibCC;
    });
  }

  static async createCiteCCAtSelection(tag: CiteTag, displayText: string): Promise<Word.ContentControl> {
    return Word.run(async (context) => {
      const selection = context.document.getSelection();
      const cc = selection.insertContentControl();
      cc.title = Titles.Cite;
      cc.tag = JSON.stringify(tag);
      cc.insertText(displayText, Word.InsertLocation.replace);
      cc.appearance = Word.ContentControlAppearance.boundingBox;
      await context.sync();
      return cc;
    });
  }

  static async enumerateCiteCCs(): Promise<Word.ContentControl[]> {
    const doc = await this.getDocument();
    return Word.run(async (context) => {
      const ccs = doc.contentControls;
      ccs.load('items');
      await context.sync();

      const citeCCs = ccs.items.filter(cc => cc.title === Titles.Cite);
      return citeCCs;
    });
  }
}
