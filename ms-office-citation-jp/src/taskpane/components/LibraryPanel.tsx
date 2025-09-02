import * as React from "react";
import { makeStyles, Button, Text } from "@fluentui/react-components";
import { useEffect, useState } from 'react';
import { UserStore } from '../../storage/UserStore';
import { ImportService } from '../../services/ImportService';
import { toast } from '../../app/toast';

type Row = { key: string; title: string; author: string; year: string };

const useStyles = makeStyles({
  root: {
    padding: "20px",
  },
  mb8: {
    marginBottom: "8px",
  },
  listBox: {
    maxHeight: "280px",
    overflowY: "auto",
    border: "1px solid #ddd",
  },
  rowLabel: {
    display: "block",
    padding: "6px 8px",
    borderBottom: "1px solid #eee",
  },
  ml8: {
    marginLeft: "8px",
  },
  mt8: {
    marginTop: "8px",
  },
});

const LibraryPanel: React.FC = () => {
  const styles = useStyles();
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  async function refresh() {
    const lib = await UserStore.loadLibrary();
    const rs: Row[] = lib.map((it:any) => {
      const key = ImportService.stableKey(it);
      const au = it?.author?.[0]?.family ?? it?.author?.[0]?.literal ?? '';
      const year = it?.issued?.['date-parts']?.[0]?.[0] ?? '';
      return { key, title: it.title ?? '(無題)', author: au, year: String(year) };
    });
    setRows(rs);
  }

  useEffect(() => { void refresh(); }, []);

  async function onLoadSample() {
    try {
      const res = await fetch('/samples/seed.csljson');
      const text = await res.text();
      await ImportService.importAndMerge(text, 'csljson');
      toast('サンプルを読み込みました', 'success');
      await refresh();
    } catch (e) { console.error(e); toast('サンプル読み込みに失敗', 'error'); }
  }

  function toggle(k:string) {
    const s = new Set(selected);
    s.has(k) ? s.delete(k) : s.add(k);
    setSelected(s);
  }

  return (
    <div className={styles.root}>
      <Text>Library Panel - Import and manage citations</Text>
  <div className={styles.mb8}>
        <Button onClick={onLoadSample}>Load Sample Data</Button>
      </div>
  <div className={styles.listBox}>
        {rows.map(r => (
      <label key={r.key} className={styles.rowLabel}>
            <input type="checkbox" checked={selected.has(r.key)} onChange={()=>toggle(r.key)} />
    <span className={styles.ml8}>{r.author} {r.year} — {r.title}</span>
          </label>
        ))}
      </div>
  <div className={styles.mt8}>
        <Button
          onClick={()=>{
            const arr = Array.from(selected);
            if (arr.length === 0) { toast('文献を選択してください','info'); return; }
            (window as any).__msocj_selectedKeys = arr; // InsertPanel と共有（簡便）
            toast(`${arr.length} 件選択しました`, 'success');
          }}
        >選択を確定</Button>
      </div>
    </div>
  );
};

export default LibraryPanel;
