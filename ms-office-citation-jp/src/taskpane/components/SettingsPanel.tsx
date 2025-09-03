import * as React from "react";
import { makeStyles, Button, Text, Dropdown, Checkbox, Input } from "@fluentui/react-components";
import { useEffect, useState } from 'react';
import { UserStore, defaultSettings } from '../../storage/UserStore';
import { toast } from '../../app/toast';
import { SharedLibraryService } from '../../services/SharedLibraryService';

const useStyles = makeStyles({
  root: {
    padding: "20px",
  },
  note: {
    color: "#666",
    marginTop: "8px",
  },
});

const SettingsPanel: React.FC = () => {
  const styles = useStyles();
  const [style, setStyle] = useState<'author-date'|'numeric'>('author-date');
  const [sharedEnabled, setSharedEnabled] = useState<boolean>(false);
  const [sharedFilename, setSharedFilename] = useState<string>('sources.xml');

  useEffect(()=>{ (async ()=>{
    const s = await UserStore.loadSettings();
    if (s) {
      setStyle(s.style);
      if (s.sharedLibrary) {
        setSharedEnabled(s.sharedLibrary.enabled);
        setSharedFilename(s.sharedLibrary.filename);
      }
    } else {
      const def = defaultSettings();
      setStyle(def.style);
      setSharedEnabled(def.sharedLibrary!.enabled);
      setSharedFilename(def.sharedLibrary!.filename);
    }
  })(); }, []);

  const saveSettings = async () => {
    const settings = { style, locale: 'ja', sharedLibrary: { enabled: sharedEnabled, filename: sharedFilename } };
    await UserStore.saveSettings(settings);
    toast('設定を保存しました','success');
  };

  const syncNow = async () => {
    try {
      await SharedLibraryService.saveToFolder(sharedFilename);
      toast('共有ライブラリに保存しました', 'success');
    } catch (e) {
      console.error(e);
      toast('共有ライブラリの保存に失敗しました', 'error');
    }
  };

  return (
    <div className={styles.root}>
      <Text>Settings Panel - Configure citation style and options</Text>
      <Dropdown
        placeholder="Select Style"
        value={style}
        onOptionSelect={async (_, data)=>{
          const v = data.optionValue as 'author-date'|'numeric';
          setStyle(v);
          await saveSettings();
        }}
      >
        <option value="author-date">Author-Date</option>
        <option value="numeric">Numeric</option>
      </Dropdown>
      <div className={styles.note}>
        <Checkbox checked={sharedEnabled} onChange={(e) => setSharedEnabled(e.target.checked)} label="共有ライブラリ（標準XML）を使う" />
        <Input placeholder="ファイル名" value={sharedFilename} onChange={(e) => setSharedFilename(e.target.value)} disabled={!sharedEnabled} />
        <Button onClick={saveSettings}>保存</Button>
        {sharedEnabled && <Button onClick={syncNow}>今すぐ同期</Button>}
      </div>
      <p className={styles.note}>※ スタイル変更後は「引用を更新」「参考文献を再生成」を実行してください。</p>
    </div>
  );
};

export default SettingsPanel;
