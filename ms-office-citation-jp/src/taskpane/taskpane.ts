/* global Word console */

import { Engine } from '../engine';
import { CitationService } from '../services/CitationService';
import { BibliographyService } from '../services/BibliographyService';
import { SharedLibraryService } from '../services/SharedLibraryService';
import { UserStore, defaultSettings } from '../storage/UserStore';
import { toast } from '../app/toast';

(async () => {
  await Engine.initOnce();
  await CitationService.init();
  await BibliographyService.init();

  const s = await UserStore.loadSettings() || defaultSettings();
  if (s.sharedLibrary?.enabled) {
    try {
      await SharedLibraryService.loadFromFolder(s.sharedLibrary.filename || 'sources.xml');
    } catch (e) {
      console.error(e);
      toast('共有ライブラリの読み込みに失敗（ローカルのみで続行）', 'error');
    }
  }
})().catch(console.error);

export async function insertText(text: string) {
  // Write text to the document.
  try {
    await Word.run(async (context) => {
      let body = context.document.body;
      body.insertParagraph(text, Word.InsertLocation.end);
      await context.sync();
    });
  } catch (error) {
    console.log("Error: " + error);
  }
}
