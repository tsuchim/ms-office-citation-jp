import jisCslXml from '../styles/jis-like.csl';
import jaLocaleXml from '../locales/ja.xml';
import type { CiteEngine, CitationStyle } from './interfaces';
import { CiteProcEngine } from './citeproc/adapter';

class EngineSingleton {
  private _engine: CiteEngine | null = null;
  private _initing: Promise<void> | null = null;

  get engine(): CiteEngine {
  if (!this._engine) throw new Error('Engine not initialized yet');
  return this._engine;
  }

  initOnce(): Promise<void> {
  if (this._initing) return this._initing;
  this._engine = new CiteProcEngine();
  this._initing = this._engine.init({ styleXml: jisCslXml as unknown as string, localeXml: jaLocaleXml as unknown as string });
  return this._initing;
  }
}

export const Engine = new EngineSingleton();
