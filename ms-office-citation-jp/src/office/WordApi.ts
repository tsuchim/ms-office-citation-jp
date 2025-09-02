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
      let cc: Word.ContentControl | null = null;
      try {
        // Try to insert at current selection
        cc = selection.insertContentControl();
      } catch (err) {
        console.error('insertContentControl at selection failed, falling back', err);
        // Fallback: create a new paragraph after the selection (or at the end of the body)
        let para: Word.Paragraph;
        try {
          para = selection.insertParagraph('', Word.InsertLocation.after);
        } catch (e2) {
          console.error('insertParagraph after selection failed, inserting at document end', e2);
          para = context.document.body.insertParagraph('', Word.InsertLocation.end);
        }
        const range = para.getRange('Whole');
        cc = range.insertContentControl();
      }

      try {
        if (!cc) {
          const para = context.document.body.insertParagraph('', Word.InsertLocation.end);
          const range = para.getRange('Whole');
          cc = range.insertContentControl();
        }
        cc.title = Titles.Cite;
        cc.tag = JSON.stringify(tag);
        cc.insertText(displayText, Word.InsertLocation.replace);
        cc.appearance = Word.ContentControlAppearance.boundingBox;
        await context.sync();
        return cc;
      } catch (finalErr) {
        console.error('Final insertion failed, try body.end direct insertion', finalErr);
        const para = context.document.body.insertParagraph(displayText, Word.InsertLocation.end);
        const range = para.getRange('Whole');
        cc = range.insertContentControl();
        cc.title = Titles.Cite;
        cc.tag = JSON.stringify(tag);
        await context.sync();
        return cc;
      }
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
