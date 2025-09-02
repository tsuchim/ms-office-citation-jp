import * as React from "react";
import { makeStyles, Button, Text, Dropdown } from "@fluentui/react-components";
import { useEffect, useState } from 'react';
import { UserStore } from '../../storage/UserStore';
import { toast } from '../../app/toast';

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

  useEffect(()=>{ (async ()=>{
    const s = await UserStore.loadSettings<{style:'author-date'|'numeric', locale:'ja'|'en'}>();
    if (s?.style) setStyle(s.style);
  })(); }, []);

  return (
    <div className={styles.root}>
      <Text>Settings Panel - Configure citation style and options</Text>
      <Dropdown
        placeholder="Select Style"
        value={style}
        onOptionSelect={async (_, data)=>{
          const v = data.optionValue as 'author-date'|'numeric';
          setStyle(v);
          await UserStore.saveSettings({ style: v, locale: 'ja' });
          toast('設定を保存しました','success');
        }}
      >
        <option value="author-date">Author-Date</option>
        <option value="numeric">Numeric</option>
      </Dropdown>
  <p className={styles.note}>※ スタイル変更後は「引用を更新」「参考文献を再生成」を実行してください。</p>
    </div>
  );
};

export default SettingsPanel;
