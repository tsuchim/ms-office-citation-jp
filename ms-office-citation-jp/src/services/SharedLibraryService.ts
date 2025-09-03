import { UserStore } from '../storage/UserStore';
import { fromXml, toXml } from '../interop/bibliography-xml';
import { readTextFromSameFolder, writeTextToSameFolder } from '../cloud/sharepoint';
import { ImportService } from './ImportService';

export class SharedLibraryService {
  static async loadFromFolder(filename: string): Promise<{imported:number}> {
    const xml = await readTextFromSameFolder(filename);
    if (!xml) return { imported: 0 };
    const csl = fromXml(xml);
    const lib = await UserStore.loadLibrary();
    const map = new Map<string, any>(lib.map((x:any)=>[ImportService.stableKey(x), x]));
    for (const it of csl) map.set(ImportService.stableKey(it), it);
    await UserStore.saveLibrary([...map.values()]);
    return { imported: csl.length };
  }

  static async saveToFolder(filename: string): Promise<void> {
    const lib = await UserStore.loadLibrary();
    const xml = toXml(lib);
    await writeTextToSameFolder(filename, xml);
  }
}
