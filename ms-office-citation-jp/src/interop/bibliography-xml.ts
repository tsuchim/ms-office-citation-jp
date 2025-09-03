import { XMLParser, XMLBuilder } from 'fast-xml-parser';
type CSL = any;

const NS = "http://schemas.openxmlformats.org/officeDocument/2006/bibliography";

export function fromXml(xml: string): CSL[] {
  const p = new XMLParser({ ignoreAttributes:false, attributeNamePrefix:'@_' });
  const j = p.parse(xml);
  const sources = j?.['b:Sources']?.['b:Source'];
  if (!sources) return [];
  const arr = Array.isArray(sources) ? sources : [sources];
  return arr.map(x => mapSourceToCSL(x));
}

export function toXml(items: CSL[]): string {
  const rows = items.map(mapCSLToSource);
  const root = { 'b:Sources': { '@_xmlns:b': NS, 'b:Source': rows } };
  const b = new XMLBuilder({ ignoreAttributes:false, attributeNamePrefix:'@_', suppressEmptyNode:true });
  const body = b.build(root);
  return `<?xml version="1.0" encoding="utf-8"?>\n${body}`;
}

function mapSourceToCSL(s:any): CSL {
  const type = s['b:SourceType'];
  const title = s['b:Title'] || '';
  const year = s['b:Year'] ? Number(s['b:Year']) : undefined;
  const authors = extractAuthors(s);
  const base:any = { title, author: authors, issued: year ? { 'date-parts': [[year]] } : undefined };

  switch (type) {
    case 'JournalArticle':
      return { ...base, type:'article-journal', 'container-title': s['b:JournalName'], page: s['b:Pages'], DOI: s['b:DOI'] };
    case 'Book':
      return { ...base, type:'book', publisher: s['b:Publisher'], ISBN: s['b:ISBN'] };
    case 'BookSection':
      return { ...base, type:'chapter', 'container-title': s['b:BookTitle'], page: s['b:Pages'], editor: extractEditors(s) };
    case 'ConferenceProceedings':
      return { ...base, type:'paper-conference', 'container-title': s['b:ConferenceName'], page: s['b:Pages'] };
    default:
      return { ...base, type:'article' };
  }
}

function mapCSLToSource(it:CSL): any {
  const type = it.type;
  const year = (it.issued?.['date-parts']?.[0]?.[0]) ?? '';
  const common:any = {
    'b:Tag': stableKey(it),
    'b:Title': it.title || '',
    'b:Year': String(year),
    ...authorsXml(it.author),
  };
  if (type === 'article-journal') {
    return { ...common, 'b:SourceType':'JournalArticle', 'b:JournalName': it['container-title'], 'b:Pages': it.page, 'b:DOI': it.DOI };
  } else if (type === 'book') {
    return { ...common, 'b:SourceType':'Book', 'b:Publisher': it.publisher, 'b:ISBN': it.ISBN };
  } else if (type === 'chapter') {
    return { ...common, 'b:SourceType':'BookSection', 'b:BookTitle': it['container-title'], 'b:Pages': it.page, ...editorsXml(it.editor) };
  } else if (type === 'paper-conference') {
    return { ...common, 'b:SourceType':'ConferenceProceedings', 'b:ConferenceName': it['container-title'], 'b:Pages': it.page };
  }
  return { ...common, 'b:SourceType':'DocumentFromInternetSite' };
}

function extractAuthors(s:any) {
  const list = s?.['b:Author']?.['b:Author']?.['b:NameList']?.['b:Person'];
  const arr = Array.isArray(list) ? list : (list ? [list] : []);
  return arr.map((p:any)=>({ family: p['b:Last'], given: p['b:First'] }));
}
function extractEditors(s:any){
  const list = s?.['b:Editor']?.['b:Editor']?.['b:NameList']?.['b:Person'];
  const arr = Array.isArray(list) ? list : (list ? [list] : []);
  return arr.map((p:any)=>({ family: p['b:Last'], given: p['b:First'] }));
}
function authorsXml(authors: any[] = []) {
  if (!authors?.length) return {};
  return { 'b:Author': { 'b:Author': { 'b:NameList': { 'b:Person': authors.map(a=>({'b:Last':a.family, 'b:First':a.given})) } } } };
}
function editorsXml(editors: any[] = []) {
  if (!editors?.length) return {};
  return { 'b:Editor': { 'b:Editor': { 'b:NameList': { 'b:Person': editors.map(a=>({'b:Last':a.family, 'b:First':a.given})) } } } };
}

function stableKey(it:any): string {
  if (it.DOI)  return `doi:${String(it.DOI).toLowerCase()}`;
  if (it.ISBN) return `isbn:${String(it.ISBN).replace(/-/g,'')}`;
  const year = it?.issued?.['date-parts']?.[0]?.[0] ?? '';
  const title = (it.title ?? '').trim().toLowerCase().replace(/\s+/g,' ');
  const au = (it.author?.[0]?.family ?? '').toLowerCase();
  return `local:${au}|${year}|${title}`;
}
