import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import { Button, Text, TextField, DetailsList, DetailsListLayoutMode, Selection, IColumn, IconButton } from "@fluentui/react";
import { useEffect, useState } from 'react';
import { UserStore } from '../../storage/UserStore';
import { ImportService } from '../../services/ImportService';
import { CitationService } from '../../services/CitationService';
import { SharedLibraryService } from '../../services/SharedLibraryService';
import { toast } from '../../app/toast';

type Row = { key: string; title: string; author: string; year: string; type: string; containerTitle: string; doi: string; isbn: string };

const useStyles = makeStyles({
  root: {
    padding: "8px 12px",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  mb8: {
    marginBottom: "8px",
  },
  mt8: {
    marginTop: "8px",
  },
  ml8: {
    marginLeft: "8px",
  },
  toolbar: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginBottom: "8px",
    flexWrap: "wrap",
    "@media (max-width: 480px)": { flexDirection: "column", alignItems:"stretch" },
  },
  search: { width: "100%" },
  titleCell: {
    display: "block",
    whiteSpace: "normal",
    wordBreak: "break-word",
    lineHeight: 1.3,
  },
});

interface LibraryPanelProps {
  onItemSelect: (item: any) => void;
}

const LibraryPanel: React.FC<LibraryPanelProps> = ({ onItemSelect }) => {
  const styles = useStyles();
  const [rows, setRows] = useState<Row[]>([]);
  const [filteredRows, setFilteredRows] = useState<Row[]>([]);
  const [search, setSearch] = useState<string>('');
  const [searchIndex, setSearchIndex] = useState<Map<string, Set<string>>>(new Map());
  const [selection] = useState(() => new Selection({
    onSelectionChanged: () => {
      const selected = selection.getSelection();
      if (selected.length > 0) {
        onItemSelect(selected[0]);
      }
    }
  }));

  const columns: IColumn[] = [
    {
      key: 'type',
      name: ' ',
      fieldName: 'type',
      minWidth: 24,
      maxWidth: 24,
      isResizable: false,
      onRender: (item: Row) => <span>{getTypeIcon(item.type)}</span>,
    },
    {
      key: 'author',
      name: '著者',
      fieldName: 'author',
      minWidth: 80,
      maxWidth: 140,
      isResizable: true,
      isSorted: true,
      isSortedDescending: false,
      onColumnClick: () => sortBy('author'),
    },
    {
      key: 'year',
      name: '年',
      fieldName: 'year',
      minWidth: 52,
      maxWidth: 56,
      isResizable: false,
      isSorted: true,
      isSortedDescending: true,
      onColumnClick: () => sortBy('year'),
    },
    {
      key: 'title',
      name: 'タイトル',
      fieldName: 'title',
      minWidth: 120,
      isResizable: true,
      isMultiline: true,
      onRender: (item: Row) => <span className={styles.titleCell}>
        {item.title}
      </span>,
    },
    {
      key: 'containerTitle',
      name: '出典',
      fieldName: 'containerTitle',
      minWidth: 100,
      maxWidth: 150,
      onRender: (item: Row) => <span title={item.containerTitle}>{item.containerTitle.length > 30 ? item.containerTitle.substring(0, 30) + '...' : item.containerTitle}</span>,
    },
    {
      key: 'doi',
      name: 'DOI/ISBN',
      fieldName: 'doi',
      minWidth: 100,
      maxWidth: 120,
      onRender: (item: Row) => <span title={item.doi || item.isbn}>{(item.doi || item.isbn || '').substring(0, 20) + ((item.doi || item.isbn || '').length > 20 ? '...' : '')}</span>,
    },
    {
      key: 'actions',
      name: '',
      minWidth: 120,
      onRender: (item: Row) => (
        <div>
          <IconButton iconProps={{ iconName: 'QuickNote' }} title="引用" onClick={() => handleCite(item.key)} />
          <IconButton iconProps={{ iconName: 'Edit' }} title="編集" onClick={() => onItemSelect(rows.find(r => r.key === item.key))} />
          <IconButton iconProps={{ iconName: 'Delete' }} title="削除" onClick={() => handleDelete(item.key)} />
          <IconButton iconProps={{ iconName: 'Add' }} title="追加" onClick={() => handleAdd()} />
        </div>
      ),
    },
  ];

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

  const sortBy = (field: string) => {
    const sorted = [...filteredRows].sort((a, b) => {
      if (field === 'author') return a.author.localeCompare(b.author);
      if (field === 'year') return parseInt(b.year) - parseInt(a.year);
      return 0;
    });
    setFilteredRows(sorted);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article-journal': return '📄';
      case 'book': return '📖';
      case 'chapter': return '📑';
      case 'paper-conference': return '🎤';
      case 'thesis': return '🎓';
      case 'report': return '📊';
      case 'webpage': return '🌐';
      case 'dataset': return '💾';
      case 'software': return '💻';
      default: return '📄';
    }
  };

  const handleCite = async (key: string) => {
    try {
      await CitationService.insertAtSelection([key]);
      toast('引用を挿入しました', 'success');
    } catch (e) {
      console.error(e);
      toast('挿入に失敗しました', 'error');
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('削除しますか？')) return;
    try {
      const lib = await UserStore.loadLibrary();
      const filtered = lib.filter(it => ImportService.stableKey(it) !== key);
      await UserStore.saveLibrary(filtered);
      toast('削除しました', 'success');
      await refresh();
    } catch (e) {
      console.error(e);
      toast('削除に失敗しました', 'error');
    }
  };

  const handleAdd = () => {
    onItemSelect(null); // 新規追加
  };

  const handleLoadSample = async () => {
    try {
      const res = await fetch('/samples/seed.csljson');
      const text = await res.text();
      await ImportService.importAndMerge(text, 'csljson');
      toast('サンプルを読み込みました', 'success');
      await refresh();
    } catch (e) {
      console.error(e);
      toast('サンプル読み込みに失敗', 'error');
    }
  };

  const handleSaveShared = async () => {
    const settings = await UserStore.loadSettings<{ sharedLibrary?: { enabled: boolean; filename: string } }>();
    if (!settings?.sharedLibrary?.enabled) {
      toast('共有ライブラリが有効になっていません', 'info');
      return;
    }
    await SharedLibraryService.saveToFolder(settings.sharedLibrary.filename);
  };

  return (
    <div className={styles.root}>
      <Text>ライブラリ</Text>
      <div className={styles.mb8}>
        <TextField className={styles.search} placeholder="検索 (タイトル/著者/年/DOI/ISBN)" value={search} onChange={(_, newValue) => setSearch(newValue || '')} />
      </div>
      <div className={styles.toolbar}>
        <Button onClick={handleLoadSample}>サンプル読み込み</Button>
        <Button onClick={handleSaveShared}>共有保存</Button>
      </div>
      <DetailsList
        items={filteredRows}
        columns={columns}
        setKey="key"
        layoutMode={DetailsListLayoutMode.fixedColumns} // 列幅の暴走防止
        compact={true}                                  // 行高を詰める
        isHeaderVisible={true}
        selection={selection}
        selectionPreservedOnEmptyClick={true}
        enterModalSelectionOnTouch={true}
        styles={{
          root: {
            overflowX: "hidden", // 横スクロール禁止
            width: "100%", maxWidth: "100%", minWidth: 0,
          },
        }}
      />
    </div>
  );
};

export default LibraryPanel;
