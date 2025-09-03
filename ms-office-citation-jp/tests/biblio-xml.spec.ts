import { describe, it, expect } from 'vitest';
import { fromXml, toXml } from '../src/interop/bibliography-xml';

describe('bibliography-xml', () => {
  it('roundtrip journal article', ()=>{
    const csl = [{ type:'article-journal', title:'題名', author:[{family:'山田',given:'太郎'}], issued:{'date-parts':[[2023]]}, 'container-title':'誌名', page:'1-10', DOI:'10.1/abc' }];
    const xml = toXml(csl);
    const back = fromXml(xml);
    expect(back[0].title).toContain('題名');
    expect(back[0].type).toBe('article-journal');
  });
});
