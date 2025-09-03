declare module '*.csl' {
  const content: string;
  export default content;
}

declare module '*.xml' {
  const content: string;
  export default content;
}

declare module 'citeproc';

declare module '@citation-js/core';
declare module '@citation-js/plugin-bibtex';
declare module '@citation-js/plugin-ris';
declare module '@citation-js/plugin-csl';
