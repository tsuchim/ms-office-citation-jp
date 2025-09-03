export class UserStore {
  static async loadLibrary(): Promise<any[]> {
    const s = await OfficeRuntime.storage.getItem('library');
    return s ? JSON.parse(s) : [];
  }
  static async saveLibrary(items: any[]): Promise<void> {
    await OfficeRuntime.storage.setItem('library', JSON.stringify(items));
  }
  static async loadSettings<T=AppSettings>(): Promise<T|null> {
    const s = await OfficeRuntime.storage.getItem('settings');
    return s ? JSON.parse(s) : null;
  }
  static async saveSettings(s: any): Promise<void> {
    await OfficeRuntime.storage.setItem('settings', JSON.stringify(s));
  }
  static async loadRecentKeys(): Promise<string[]> {
    const s = await OfficeRuntime.storage.getItem('recentKeys');
    return s ? JSON.parse(s) : [];
  }
  static async saveRecentKeys(keys: string[]): Promise<void> {
    await OfficeRuntime.storage.setItem('recentKeys', JSON.stringify(keys));
  }
}

export type AppSettings = {
  style: 'author-date'|'numeric';
  locale: 'ja'|'en';
  sharedLibrary?: {
    enabled: boolean;
    filename: string;
  };
};

export function defaultSettings(): AppSettings {
  return { style: 'author-date', locale: 'ja', sharedLibrary: { enabled: false, filename: 'sources.xml' } };
}
