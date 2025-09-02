import * as React from "react";
import { makeStyles, Tab, TabList } from "@fluentui/react-components";
import LibraryPanel from "./LibraryPanel";
import InsertPanel from "./InsertPanel";
import UpdatePanel from "./UpdatePanel";
import SettingsPanel from "./SettingsPanel";

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
});

const App: React.FC = () => {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = React.useState("library");

  const renderTab = () => {
    switch (selectedTab) {
      case "library":
        return <LibraryPanel />;
      case "insert":
        return <InsertPanel />;
      case "update":
        return <UpdatePanel />;
      case "settings":
        return <SettingsPanel />;
      default:
        return <LibraryPanel />;
    }
  };

  return (
    <div className={styles.root}>
      <TabList selectedValue={selectedTab} onTabSelect={(_, data) => setSelectedTab(data.value as string)}>
        <Tab value="library">ライブラリ</Tab>
        <Tab value="insert">挿入</Tab>
        <Tab value="update">更新</Tab>
        <Tab value="settings">設定</Tab>
      </TabList>
      {renderTab()}
    </div>
  );
};

export default App;
