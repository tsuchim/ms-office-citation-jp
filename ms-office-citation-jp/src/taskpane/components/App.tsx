import * as React from "react";
import { makeStyles, TabList, Tab, TabValue } from "@fluentui/react-components";
import AppBar from "./AppBar";
import LibraryPanel from "./LibraryPanel";
import ReferenceDetailPanel from "./ReferenceDetailPanel";
import BibliographyPanel from "./BibliographyPanel";

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,             // ← 横はみ出し抑止の肝
    overflowX: "hidden",
    boxSizing: "border-box",
  },
  tabContent: {
    flex: 1,
    padding: "8px 12px",
    overflowY: "auto",
    overflowX: "hidden",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },
});

const App: React.FC = () => {
  const styles = useStyles();
  const [tab, setTab] = React.useState<TabValue>("library");
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [styleId, setStyleId] = React.useState("jis-like");

  const handleGlobalSearch = (query: string) => {
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
      <TabList selectedValue={tab} onTabSelect={(_, d) => setTab(d.value)}>
        <Tab value="library">ライブラリ</Tab>
        <Tab value="detail">詳細編集</Tab>
        <Tab value="bibliography">参考文献</Tab>
      </TabList>
      <div className={styles.tabContent}>
        {tab === "library" && <LibraryPanel onItemSelect={(item) => { setSelectedItem(item); setTab("detail"); }} />}
        {tab === "detail" && <ReferenceDetailPanel selectedItem={selectedItem} onBack={() => setTab("library")} />}
        {tab === "bibliography" && <BibliographyPanel />}
      </div>
    </div>
  );
};

export default App;
