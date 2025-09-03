import * as React from "react";
import { makeStyles, Button, Input, Textarea, Checkbox } from "@fluentui/react-components";
import { CitationService } from "../../services/CitationService";
import { toast } from "../../app/toast";

const useStyles = makeStyles({
  root: {
    padding: "16px",
  },
  item: {
    border: "1px solid #ddd",
    padding: "8px",
    marginBottom: "8px",
  },
  field: {
    marginBottom: "8px",
  },
  label: {
    display: "block",
    marginBottom: "4px",
    fontWeight: "bold",
  },
  buttons: {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
  },
});

interface CitationItem {
  key: string;
  prefix?: string;
  suffix?: string;
  locator?: string;
  suppressAuthor?: boolean;
  suppressYear?: boolean;
}

interface CitationGroupEditorProps {
  citeControlId: string;
  items: CitationItem[];
  onClose: () => void;
}

const CitationGroupEditor: React.FC<CitationGroupEditorProps> = ({ citeControlId, items, onClose }) => {
  const styles = useStyles();
  const [editedItems, setEditedItems] = React.useState<CitationItem[]>(items);

  const updateItem = (index: number, field: keyof CitationItem, value: any) => {
    const newItems = [...editedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditedItems(newItems);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...editedItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setEditedItems(newItems);
  };

  const moveDown = (index: number) => {
    if (index === editedItems.length - 1) return;
    const newItems = [...editedItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setEditedItems(newItems);
  };

  const handleApply = async () => {
    try {
      await CitationService.updateGroup(citeControlId, editedItems);
      toast("更新しました", "success");
      onClose();
    } catch (e) {
      console.error(e);
      toast("更新に失敗しました", "error");
    }
  };

  return (
    <div className={styles.root}>
      <h2>引用グループ編集</h2>
      {editedItems.map((item, index) => (
        <div key={item.key} className={styles.item}>
          <div className={styles.field}>
            <label className={styles.label}>文献 {index + 1}</label>
            <div>キー: {item.key}</div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>接頭語</label>
            <Input value={item.prefix || ""} onChange={(e) => updateItem(index, "prefix", e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>接尾語</label>
            <Input value={item.suffix || ""} onChange={(e) => updateItem(index, "suffix", e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>位置指定子 (ページなど)</label>
            <Input value={item.locator || ""} onChange={(e) => updateItem(index, "locator", e.target.value)} />
          </div>
          <div className={styles.field}>
            <Checkbox
              label="著者を抑制"
              checked={item.suppressAuthor || false}
              onChange={(_, data) => updateItem(index, "suppressAuthor", data.checked)}
            />
            <Checkbox
              label="年を抑制"
              checked={item.suppressYear || false}
              onChange={(_, data) => updateItem(index, "suppressYear", data.checked)}
            />
          </div>
          <div>
            <Button onClick={() => moveUp(index)} disabled={index === 0}>上へ</Button>
            <Button onClick={() => moveDown(index)} disabled={index === editedItems.length - 1}>下へ</Button>
          </div>
        </div>
      ))}
      <div className={styles.buttons}>
        <Button onClick={handleApply}>適用</Button>
        <Button onClick={onClose}>キャンセル</Button>
      </div>
    </div>
  );
};

export default CitationGroupEditor;
