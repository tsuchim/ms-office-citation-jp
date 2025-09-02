export class UserStore {
  static async loadLibrary(): Promise<any[]> {
    const s = await OfficeRuntime.storage.getItem('library');
    return s ? JSON.parse(s) : [];
  }
  static async saveLibrary(items: any[]): Promise<void> {
    await OfficeRuntime.storage.setItem('library', JSON.stringify(items));
  }
  static async loadSettings<T=any>(): Promise<T|null> {
    const s = await OfficeRuntime.storage.getItem('settings');
    return s ? JSON.parse(s) : null;
  }
  static async saveSettings(s: any): Promise<void> {
    await OfficeRuntime.storage.setItem('settings', JSON.stringify(s));
  }
}
