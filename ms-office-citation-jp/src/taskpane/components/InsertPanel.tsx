import * as React from "react";
import { makeStyles, Button, Text } from "@fluentui/react-components";
import { useState, useEffect } from 'react';
import { CitationService } from '../../services/CitationService';
import { UserStore } from '../../storage/UserStore';
import { toast } from '../../app/toast';
import EditCitationDialog from './EditCitationDialog';

const useStyles = makeStyles({
  root: {
    padding: "20px",
  },
  mb8: {
    marginBottom: "8px",
  },
  previewBox: {
    padding: "8px",
    background: "#fafafa",
    minHeight: "40px",
    border: "1px solid #eee",
  },
  mt8: {
    marginTop: "8px",
  },
});

const InsertPanel: React.FC = () => {
  const styles = useStyles();
  const [preview, setPreview] = useState<string>('');
  const [recentKeys, setRecentKeys] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const recents = await UserStore.loadRecentKeys();
      setRecentKeys(recents);
    })();
  }, []);

  function getSelectedKeys(): string[] {
    return (window as any).__msocj_selectedKeys ?? [];
  }

  return (
    <div className={styles.root}>
      <Text>Insert Panel - Select and insert citations</Text>
      {recentKeys.length > 0 && (
        <div className={styles.mb8}>
          <Text>最近使った文献:</Text>
          {recentKeys.map(key => (
            <Button key={key} onClick={() => CitationService.insertAtSelection([key])}>{key}</Button>
          ))}
        </div>
      )}
      <div className={styles.mb8}>
        <Button onClick={()=>{
          const keys = getSelectedKeys();
          if (keys.length === 0) { toast('Libraryタブで文献を選択→「選択を確定」してください','info'); return; }
          setPreview(keys.join(', '));
        }}>選択内容をプレビュー</Button>
      </div>

      <div className={styles.previewBox}>
        {preview || '（プレビューなし）'}
      </div>

      <div className={styles.mt8}>
        <Button onClick={async ()=>{
          try{
            const keys = getSelectedKeys();
            if (keys.length === 0) { toast('文献が選択されていません','info'); return; }
            await CitationService.insertAtSelection(keys);
            toast('引用を挿入しました','success');
          }catch(e){ console.error(e); toast('引用の挿入に失敗','error'); }
        }}>カーソル位置に挿入</Button>
        {getSelectedKeys().length > 0 && <EditCitationDialog keys={getSelectedKeys()} />}
      </div>
    </div>
  );
};

export default InsertPanel;
