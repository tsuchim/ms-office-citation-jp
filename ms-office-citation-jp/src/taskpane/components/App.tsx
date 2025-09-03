import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import AppBar from "./AppBar";
import LibraryPanel from "./LibraryPanel";
import ReferenceDetailPanel from "./ReferenceDetailPanel";

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  main: {
    flex: 1,
    display: "flex",
  },
  left: {
    flex: 7,
    borderRight: "1px solid #ddd",
  },
  right: {
    flex: 5,
    padding: "16px",
  },
});

const App: React.FC = () => {
  const styles = useStyles();
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [styleId, setStyleId] = React.useState("jis-like");

  const handleGlobalSearch = (query: string) => {
    // 詳細編集ダイアログを開く（後で実装）
    console.log("Global search:", query);
  };

  const handleStyleChange = (styleId: string) => {
    setStyleId(styleId);
  };

  const handleSync = () => {
    // 同期後の処理
  };

  return (
    <div className={styles.root}>
      <AppBar onGlobalSearch={handleGlobalSearch} onStyleChange={handleStyleChange} onSync={handleSync} />
      <div className={styles.main}>
        <div className={styles.left}>
          <LibraryPanel onItemSelect={setSelectedItem} />
        </div>
        <div className={styles.right}>
          <ReferenceDetailPanel selectedItem={selectedItem} />
        </div>
      </div>
    </div>
  );
};

export default App;
