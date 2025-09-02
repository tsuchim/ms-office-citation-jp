/* global Word console */

import { Engine } from '../engine';
import { CitationService } from '../services/CitationService';
import { BibliographyService } from '../services/BibliographyService';

(async () => {
  await Engine.initOnce();
  await CitationService.init();
  await BibliographyService.init();
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
