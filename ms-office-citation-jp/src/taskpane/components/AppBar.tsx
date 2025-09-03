import * as React from "react";
import { makeStyles, Button, Input, Dropdown, Option } from "@fluentui/react-components";
import { Search24Regular, ArrowSync24Regular } from "@fluentui/react-icons";
import { UserStore } from "../../storage/UserStore";
import { CitationService } from "../../services/CitationService";
import { SharedLibraryService } from "../../services/SharedLibraryService";
import { toast } from "../../app/toast";

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#f8f9fa",
  },
  left: {
    flex: 1,
    display: "flex",
    alignItems: "center",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  search: {
    width: "300px",
    marginLeft: "16px",
  },
});

interface AppBarProps {
  onGlobalSearch: (query: string) => void;
  onStyleChange: (styleId: string) => void;
  onSync: () => void;
}

const AppBar: React.FC<AppBarProps> = ({ onGlobalSearch, onStyleChange, onSync }) => {
  const styles = useStyles();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStyle, setSelectedStyle] = React.useState("jis-like");

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (e.ctrlKey) {
        // Ctrl+Enter: 詳細編集ダイアログ経由
        onGlobalSearch(searchQuery);
      } else {
        // Enter: トップ候補を挿入
        handleQuickInsert(searchQuery);
      }
    }
  };

  const handleQuickInsert = async (query: string) => {
    try {
      const lib = await UserStore.loadLibrary();
      const candidates = lib.filter(it =>
        it.title?.toLowerCase().includes(query.toLowerCase()) ||
        it.author?.[0]?.family?.toLowerCase().includes(query.toLowerCase()) ||
        it.DOI?.toLowerCase().includes(query.toLowerCase())
      );
      if (candidates.length === 0) {
        toast("一致する文献が見つかりません", "info");
        return;
      }
      const key = candidates[0].id || candidates[0].DOI || "unknown";
      await CitationService.insertAtSelection([key]);
      toast("引用を挿入しました", "success");
    } catch (e) {
      console.error(e);
      toast("挿入に失敗しました", "error");
    }
  };

  const handleStyleChange = (value: string) => {
    setSelectedStyle(value);
    onStyleChange(value);
  };

  const handleSync = async () => {
    try {
      const settings = await UserStore.loadSettings<{ sharedLibrary?: { enabled: boolean; filename: string } }>();
      if (!settings?.sharedLibrary?.enabled) {
        toast("共有ライブラリが有効になっていません", "info");
        return;
      }
      await SharedLibraryService.saveToFolder(settings.sharedLibrary.filename);
      toast("同期しました", "success");
    } catch (e) {
      console.error(e);
      toast("同期に失敗しました", "error");
    }
    onSync();
  };

  return (
    <div className={styles.root}>
      <div className={styles.left}>
        <span>MS Office Citation JP</span>
        <Input
          className={styles.search}
          placeholder="検索 (著者/タイトル/DOI)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          contentBefore={<Search24Regular />}
        />
      </div>
      <div className={styles.right}>
        <Dropdown value={selectedStyle} onOptionSelect={(_, data) => handleStyleChange(data.optionValue!)}>
          <Option value="jis-like">JIS</Option>
          <Option value="apa">APA</Option>
          <Option value="mla">MLA</Option>
          <Option value="chicago-author-date">Chicago (Author-Date)</Option>
          <Option value="chicago-notes-bibliography">Chicago (Notes)</Option>
          <Option value="ieee">IEEE</Option>
          <Option value="vancouver">Vancouver</Option>
          <Option value="ama">AMA</Option>
          <Option value="harvard">Harvard</Option>
        </Dropdown>
        <Button icon={<ArrowSync24Regular />} onClick={handleSync}>
          同期
        </Button>
      </div>
    </div>
  );
};

export default AppBar;
