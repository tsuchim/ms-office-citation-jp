import * as React from "react";
import { makeStyles, Button, Input, Textarea, Dropdown, Option, Text } from "@fluentui/react-components";
import { Dialog, DialogFooter } from '@fluentui/react/lib/Dialog';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { UserStore } from "../../storage/UserStore";
import { ImportService } from "../../services/ImportService";
import { SharedLibraryService } from "../../services/SharedLibraryService";
import { toast } from "../../app/toast";
import { z } from "zod";

const itemSchema = z.object({
  type: z.string().min(1, "タイプは必須です"),
  title: z.string().min(1, "タイトルは必須です"),
  author: z.array(z.object({
    family: z.string().optional(),
    given: z.string().optional(),
  })).optional(),
  issued: z.object({
    "date-parts": z.array(z.array(z.number())),
  }).optional(),
  language: z.string().optional(),
  DOI: z.string().optional(),
  URL: z.string().optional(),
  ISBN: z.string().optional(),
  "container-title": z.string().optional(),
  publisher: z.string().optional(),
  "publisher-place": z.string().optional(),
  page: z.string().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  genre: z.string().optional(),
  "archive-location": z.string().optional(),
  version: z.string().optional(),
  note: z.string().optional(),
}).refine((data) => {
  if (data.type === "article-journal") {
    return data["container-title"] && data["container-title"].length > 0;
  }
  if (data.type === "book") {
    return (data.publisher && data.publisher.length > 0) || (data.ISBN && data.ISBN.length > 0);
  }
  return true;
}, {
  message: "タイプに応じた必須フィールドが不足しています",
  path: ["type"],
});

const useStyles = makeStyles({
  root: {
    padding: "8px 12px",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "4px",
    fontWeight: "bold",
  },
  authorList: {
    border: "1px solid #ddd",
    padding: "8px",
    maxHeight: "200px",
    overflowY: "auto",
  },
  authorItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
  },
  buttons: {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
  },
});

interface ReferenceDetailPanelProps {
  selectedItem: any;
  onBack?: () => void;
}

const ReferenceDetailPanel: React.FC<ReferenceDetailPanelProps> = ({ selectedItem, onBack }) => {
  const styles = useStyles();
  const [item, setItem] = React.useState<any>(selectedItem || { type: "article-journal" });
  const [authors, setAuthors] = React.useState<any[]>(selectedItem?.author || []);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    if (selectedItem) {
      setItem(selectedItem);
      setAuthors(selectedItem.author || []);
    } else {
      setItem({ type: "article-journal" });
      setAuthors([]);
    }
  }, [selectedItem]);

  const handleSave = async () => {
    try {
      const updatedItem = { ...item, author: authors };
      const validationResult = itemSchema.safeParse(updatedItem);
      if (!validationResult.success) {
        const errors = validationResult.error.format();
        const errorMessage = Object.values(errors).flat().filter(err => typeof err === 'object' && err !== null && 'message' in err).map(err => (err as any).message).join(", ");
        toast(errorMessage, "error");
        return;
      }

      const lib = await UserStore.loadLibrary();
      const index = lib.findIndex(it => ImportService.stableKey(it) === ImportService.stableKey(updatedItem));
      if (index >= 0) {
        lib[index] = updatedItem;
      } else {
        lib.push(updatedItem);
      }
      await UserStore.saveLibrary(lib);
      toast("保存しました", "success");
      if (onBack) onBack();

      // 共有XMLが有効なら保存
      const settings = await UserStore.loadSettings<{ sharedLibrary?: { enabled: boolean; filename: string } }>();
      if (settings?.sharedLibrary?.enabled) {
        await SharedLibraryService.saveToFolder(settings.sharedLibrary.filename);
      }
    } catch (e) {
      console.error(e);
      toast("保存に失敗しました", "error");
    }
  };

  const handleDuplicate = () => {
    const dup = { ...item, title: `${item.title} (コピー)` };
    setItem(dup);
    setAuthors([...authors]);
  };

  const handleDeleteClick = () => setConfirmOpen(true);

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    try {
      const lib = await UserStore.loadLibrary();
      const filtered = lib.filter(it => ImportService.stableKey(it) !== ImportService.stableKey(item));
      await UserStore.saveLibrary(filtered);
      toast("削除しました", "success");
      setItem({ type: "article-journal" });
      setAuthors([]);
    } catch (e) {
      console.error(e);
      toast("削除に失敗しました", "error");
    }
  };

  const handleClose = () => {
    setItem({ type: "article-journal" });
    setAuthors([]);
    onBack?.();
  };

  const addAuthor = () => {
    setAuthors([...authors, { family: "", given: "" }]);
  };

  const updateAuthor = (index: number, field: string, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setAuthors(newAuthors);
  };

  const removeAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.root}>
      <h2>文献詳細</h2>
      <div className={styles.field}>
        <label className={styles.label}>タイプ</label>
        <Dropdown value={item.type} onOptionSelect={(_, data) => setItem({ ...item, type: data.optionValue })}>
          <Option value="article-journal">論文</Option>
          <Option value="book">書籍</Option>
          <Option value="chapter">章</Option>
          <Option value="paper-conference">会議論文</Option>
          <Option value="thesis">学位論文</Option>
          <Option value="report">レポート</Option>
          <Option value="webpage">ウェブページ</Option>
          <Option value="dataset">データセット</Option>
          <Option value="software">ソフトウェア</Option>
        </Dropdown>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>タイトル *</label>
        <Input value={item.title || ""} onChange={(e) => setItem({ ...item, title: e.target.value })} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>著者</label>
        <div className={styles.authorList}>
          {authors.map((author, index) => (
            <div key={index} className={styles.authorItem}>
              <Input placeholder="姓" value={author.family || ""} onChange={(e) => updateAuthor(index, "family", e.target.value)} />
              <Input placeholder="名" value={author.given || ""} onChange={(e) => updateAuthor(index, "given", e.target.value)} style={{ marginLeft: "8px" }} />
              <Button onClick={() => removeAuthor(index)} style={{ marginLeft: "8px" }}>削除</Button>
            </div>
          ))}
          <Button onClick={addAuthor}>著者を追加</Button>
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>発行年 *</label>
        <Input value={item.issued?.["date-parts"]?.[0]?.[0] || ""} onChange={(e) => setItem({ ...item, issued: { "date-parts": [[parseInt(e.target.value)]] } })} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>言語</label>
        <Input value={item.language || ""} onChange={(e) => setItem({ ...item, language: e.target.value })} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>DOI</label>
        <Input value={item.DOI || ""} onChange={(e) => setItem({ ...item, DOI: e.target.value })} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>URL</label>
        <Input value={item.URL || ""} onChange={(e) => setItem({ ...item, URL: e.target.value })} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>ISBN</label>
        <Input value={item.ISBN || ""} onChange={(e) => setItem({ ...item, ISBN: e.target.value })} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>コンテナタイトル (雑誌名など)</label>
        <Input value={item["container-title"] || ""} onChange={(e) => setItem({ ...item, "container-title": e.target.value })} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>出版社</label>
        <Input value={item.publisher || ""} onChange={(e) => setItem({ ...item, publisher: e.target.value })} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>出版社場所</label>
        <Input value={item["publisher-place"] || ""} onChange={(e) => setItem({ ...item, "publisher-place": e.target.value })} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>ページ</label>
        <Input value={item.page || ""} onChange={(e) => setItem({ ...item, page: e.target.value })} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>巻</label>
        <Input value={item.volume || ""} onChange={(e) => setItem({ ...item, volume: e.target.value })} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>号</label>
        <Input value={item.issue || ""} onChange={(e) => setItem({ ...item, issue: e.target.value })} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>ジャンル (学位種別など)</label>
        <Input value={item.genre || ""} onChange={(e) => setItem({ ...item, genre: e.target.value })} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>アーカイブ場所</label>
        <Input value={item["archive-location"] || ""} onChange={(e) => setItem({ ...item, "archive-location": e.target.value })} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>バージョン</label>
        <Input value={item.version || ""} onChange={(e) => setItem({ ...item, version: e.target.value })} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>ノート</label>
        <Textarea value={item.note || ""} onChange={(e) => setItem({ ...item, note: e.target.value })} />
      </div>
      <div className={styles.buttons}>
        <Button onClick={handleSave}>保存</Button>
        <Button onClick={handleDuplicate}>複製</Button>
        <Button onClick={handleDeleteClick}>削除</Button>
        <Button onClick={handleClose}>閉じる</Button>
      </div>
      <Dialog
        hidden={!confirmOpen}
        onDismiss={() => setConfirmOpen(false)}
        dialogContentProps={{
          title: '削除確認',
          subText: '本当に削除してもよろしいですか？',
        }}
      >
        <DialogFooter>
          <PrimaryButton onClick={handleConfirmDelete} text="はい" />
          <DefaultButton onClick={() => setConfirmOpen(false)} text="いいえ" />
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default ReferenceDetailPanel;
