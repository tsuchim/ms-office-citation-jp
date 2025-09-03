import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import { Button, TextField, Stack, Text } from '@fluentui/react';
import { DetailsList, DetailsListLayoutMode, ConstrainMode, IColumn, CheckboxVisibility } from '@fluentui/react/lib/DetailsList';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { UserStore } from '../../storage/UserStore';
import { ImportService } from '../../services/ImportService';
import { CitationService } from '../../services/CitationService';
import { SharedLibraryService } from '../../services/SharedLibraryService';
import { toast } from '../../app/toast';

type Row = { key: string; title: string; author: string; year: string; type: string; containerTitle: string; doi: string; isbn: string };

const useStyles = makeStyles({
  root: { width: "100%", maxWidth: "100%", minWidth: 0, overflowX: "hidden" },
  mb8: { marginBottom: "8px" },
  mt8: { marginTop: "8px" },
  ml8: { marginLeft: "8px" },
  toolbar: { display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", "@media (max-width: 480px)": { flexDirection: "column", alignItems:"stretch" } },
  search: { width: "100%" },
  titleCell: { display: "block", whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.3 },

  cell: {
    fontSize: "12px",
    lineHeight: "16px",
    padding: "4px 8px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  title: {
    fontSize: "12px",
    lineHeight: "16px",
    padding: "4px 8px",
    whiteSpace: "normal",
    // ★ 日本語の“1文字折り”を避ける
    wordBreak: "keep-all",
    overflowWrap: "anywhere",
    // ★ 2行でクランプ（読みやすく、縦長になりすぎない）
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  authorBold: { fontWeight: 600 },

  yearChip: {
    display: "inline-block",
    minWidth: "44px",
    maxWidth: "56px",
    textAlign: "center",
    padding: "0 6px",
    lineHeight: "18px",
    height: "18px",
    borderRadius: "9px",
    background: "#f2f2f2",
    color: "#333",
    fontSize: "11px",
    marginLeft: "6px",
  },

  // 1列（積層）表示用
  stackedMain: { display: "flex", alignItems: "center", gap: "4px" },
  stackedSub:  { color: "#666", fontSize: "11px", lineHeight: "14px", marginTop: "2px" },
  cellContent: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    flex: '1 1 auto',
    minWidth: 0,
  },
  primary: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  },
  secondary: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  },
  yearChipMargin: { marginLeft: "6px", color: "#666" },
  listHost: { width: '100%', minWidth: '280px', overflowX: 'hidden' },
  debug: { fontSize: '11px', opacity: 0.6 },
});

const useCompactStyles = makeStyles({
  root: { width: "100%", maxWidth: "100%", minWidth: 0, overflowX: "hidden" },
  cell: {
    fontSize: "12px", lineHeight: "16px", padding: "2px 8px",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  titleCell: {
    fontSize: "12px", lineHeight: "16px", padding: "2px 8px",
    whiteSpace: "normal", wordBreak: "break-word",
  },
  yearChip: {
    display: "inline-block",
    minWidth: "44px", maxWidth: "52px", textAlign: "center",
    padding: "0 6px", lineHeight: "18px", height: "18px",
    borderRadius: "9px", background: "#f2f2f2", color: "#333",
    fontSize: "11px",
  },
  stackedMain: { fontWeight: 600 },
  stackedSub:  { color: "#666", fontSize: "11px", lineHeight: "14px", marginTop: "2px" },
  yearChipMargin: { marginLeft: "6px", color: "#666" },
});

interface LibraryPanelProps {
  onItemSelect: (item: any) => void;
}

const LIST_POLICY = {
  minColPx: 280, maxColPx: 4096,
  narrowThreshold: 360,   // <360px は積層1列
  mediumThreshold: 480,   // 360–479px は3列
  yearMin: 48, yearMax: 56,
  authorMin: 96, authorMax: 160,
  titleMin: 120,
} as const;

const LibraryPanel: React.FC<LibraryPanelProps> = ({ onItemSelect }) => {
  const styles = useStyles();
  const s = useCompactStyles();
  const [rows, setRows] = useState<Row[]>([]);
  const [filteredRows, setFilteredRows] = useState<Row[]>([]);
  const [search, setSearch] = useState<string>('');
  const [mode, setMode] = React.useState<"narrow"|"medium"|"wide">("narrow");
  const [widthMode, setWidthMode] = useState<'narrow'|'medium'|'wide'>('narrow');
  const [sort, setSort] = useState<{ key?: "title" | "author" | "year", asc: boolean }>({ asc: true });
  const [searchIndex, setSearchIndex] = useState<Map<string, Set<string>>>(new Map());

  const onColumnClick = useCallback((_ev?: React.MouseEvent<HTMLElement>, col?: IColumn) => {
    if (!col) return;
    const newSort = sort.key === col.key ? { key: col.key, asc: !sort.asc } : { key: col.key as "title" | "author" | "year", asc: true };
    setSort(newSort);
  }, [sort]);

  const renderAuthorYear = useCallback((item: any) => (
    <span>
      <span className={styles.authorBold}>{item.author}</span>
      <span className={styles.yearChipMargin}>({item.year})</span>
    </span>
  ), [styles]);

  const renderDocCell = useCallback((item: any) => (
    <div className={styles.cellContent}>
      <div className={styles.primary}>{renderAuthorYear(item)}</div>
      <div className={styles.secondary}>{item.title}</div>
    </div>
  ), [styles, renderAuthorYear]);

  const [columns, setColumns] = useState<IColumn[]>([
    { key:'doc', name:'文献', fieldName: 'title', minWidth: LIST_POLICY.minColPx, maxWidth: LIST_POLICY.maxColPx, isResizable: false, isMultiline: true, onRender: renderDocCell },
  ]);

  const [stackColumns, setStackColumns] = useState<IColumn[]>([
    { key:'stack', name:'文献', minWidth: LIST_POLICY.minColPx, isResizable:true }
  ]);
  const hostRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!hostRef.current) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      if (w < LIST_POLICY.narrowThreshold) {
        setMode("narrow");
        setWidthMode('narrow');
      } else if (w < LIST_POLICY.mediumThreshold) {
        setMode("medium");
        setWidthMode('medium');
      } else {
        setMode("wide");
        setWidthMode('wide');
      }
    });
    ro.observe(hostRef.current);
    return () => ro.disconnect();
  }, []);

  const onRenderItemColumn = useCallback((item: any, _index?: number, column?: IColumn) => {
    if (!column) return null;
    const key = column.key;
    if (mode === 'narrow') {
      return (
        <div className={styles.cellContent}>
          <Text variant="small" styles={{ root: { fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal', wordBreak: 'break-word' } }}>{item.author}</Text>
          <Text variant="small" styles={{ root: { color: '#666', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal', wordBreak: 'break-word' } }}>({item.year})</Text>
          <Text variant="small" block styles={{ root: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal', wordBreak: 'break-word' } }}>{item.title}</Text>
        </div>
      );
    }
    switch (key) {
      case 'author':
        return <Text variant="small" styles={{ root: { fontWeight: 600, wordBreak: 'break-word', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' } }}>{item.author}</Text>;
      case 'year':
        return <Text variant="small" styles={{ root: { color: '#666', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' } }}>{item.year}</Text>;
      case 'title':
        return <Text variant="small" block styles={{ root: { wordBreak: 'break-word', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' } }}>{item.title}</Text>;
      default:
        return null;
    }
  }, [mode]);

  async function refresh() {
    const lib = await UserStore.loadLibrary();
    const rs: Row[] = lib.map((it: any) => {
      const key = ImportService.stableKey(it);
      const au = it?.author?.[0]?.family ?? it?.author?.[0]?.literal ?? '';
      const year = it?.issued?.['date-parts']?.[0]?.[0] ?? '';
      return {
        key,
        title: it.title ?? '(無題)',
        author: au,
        year: String(year),
        type: it.type ?? 'article-journal',
        containerTitle: it['container-title'] ?? '',
        doi: it.DOI ?? '',
        isbn: it.ISBN ?? '',
      };
    });
    setRows(rs);
    setFilteredRows(rs);

    // Build search index
    const index = new Map<string, Set<string>>();
    rs.forEach(r => {
      const text = `${r.title} ${r.author} ${r.year} ${r.doi} ${r.isbn}`.toLowerCase();
      for (let i = 0; i < text.length - 2; i++) {
        const ngram = text.substring(i, i + 3);
        if (!index.has(ngram)) index.set(ngram, new Set());
        index.get(ngram)!.add(r.key);
      }
    });
    setSearchIndex(index);
  }

  useEffect(() => { void refresh(); }, []);

  useEffect(() => {
    if (search.length < 3) {
      setFilteredRows(rows);
      return;
    }
    const query = search.toLowerCase();
    const matchedKeys = new Set<string>();
    for (let i = 0; i < query.length - 2; i++) {
      const ngram = query.substring(i, i + 3);
      const keys = searchIndex.get(ngram);
      if (keys) {
        keys.forEach(k => matchedKeys.add(k));
      }
    }
    const filtered = rows.filter(r => matchedKeys.has(r.key));
    setFilteredRows(filtered);
  }, [search, rows, searchIndex]);

  // 初回orデータ変化時の既定ソート
  const baseSorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a,b) => {
      const A = (a.author || '').localeCompare(b.author || '', 'ja');
      if (A) return A;
      const Y = String(a.year||'').localeCompare(String(b.year||''));
      if (Y) return Y;
      return (a.title||'').localeCompare(b.title||'', 'ja');
    });
    return arr;
  }, [rows]);

  // ヘッダクリック適用
  const sorted = useMemo(() => {
    if (!sort.key) return baseSorted;
    const k = sort.key;
    const arr = [...baseSorted];
    arr.sort((a,b) => (String(a[k]||'').localeCompare(String(b[k]||''), 'ja')) * (sort.asc ? 1 : -1));
    return arr;
  }, [baseSorted, sort]);

  return (
    <Stack verticalFill styles={{ root: { minWidth: 0, minHeight: 0 } }}>
      <Stack.Item grow disableShrink styles={{ root: { minWidth: 0, minHeight: 0, display:'flex' } }}>
        <div ref={hostRef} className={styles.root}>
          <div className={styles.toolbar}>
            <TextField className={styles.search} value={search} onChange={(_, v) => setSearch(v || '')} placeholder="検索 (タイトル/著者/年/DOI/ISBN)" />
            <Button onClick={() => { /* 追加ボタンの処理 */ }}>追加</Button>
          </div>
          <div className={styles.debug}>
            host={hostRef.current?.clientWidth ?? 0}px / mode={widthMode}
          </div>
          <DetailsList
            items={sorted}
            columns={mode === 'narrow' ? stackColumns : columns}
            onRenderItemColumn={onRenderItemColumn}
            onColumnHeaderClick={onColumnClick}
            onItemInvoked={onItemSelect}
            layoutMode={DetailsListLayoutMode.justified}
            constrainMode={ConstrainMode.unconstrained}
            compact={true}
            checkboxVisibility={2}
            selectionMode={0}
            setKey={widthMode}
            styles={{ root: { width: '100%' } }}
          />
        </div>
      </Stack.Item>
    </Stack>
  );
};

export default LibraryPanel;
