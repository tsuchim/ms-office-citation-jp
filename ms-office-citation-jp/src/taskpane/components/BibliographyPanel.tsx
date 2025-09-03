import * as React from "react";
import { makeStyles, Button, Dropdown, Option, Text } from "@fluentui/react-components";
import { UserStore } from "../../storage/UserStore";
import { BibliographyService } from "../../services/BibliographyService";
import { Engine } from "../../engine";
import { toast } from "../../app/toast";

const useStyles = makeStyles({
  root: {
    padding: "8px 12px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
  },
  preview: {
    flex: 1,
    border: "1px solid #ddd",
    padding: "8px",
    overflowY: "auto",
    backgroundColor: "#f9f9f9",
    lineHeight: "1.6",
    fontFamily: "monospace",
  },
  buttons: {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
  },
});

const BibliographyPanel: React.FC = () => {
  const styles = useStyles();
  const [selectedStyle, setSelectedStyle] = React.useState("jis-like");
  const [previewHtml, setPreviewHtml] = React.useState("");

  React.useEffect(() => {
    generatePreview();
  }, [selectedStyle]);

  const generatePreview = async () => {
    try {
      const lib = await UserStore.loadLibrary();
      const keys = lib.map(item => item.id || item.DOI || "unknown");
      const html = await BibliographyService.formatBibliography(keys);
      setPreviewHtml(html);
    } catch (e) {
      console.error(e);
      setPreviewHtml("<p>プレビュー生成に失敗しました</p>");
    }
  };

  const handleStyleChange = (value: string) => {
    setSelectedStyle(value);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(previewHtml);
      toast("コピーしました", "success");
    } catch (e) {
      console.error(e);
      toast("コピーに失敗しました", "error");
    }
  };

  const handleApplyToDocument = async () => {
    try {
      await BibliographyService.updateBibliographyInDocument(selectedStyle);
      toast("参考文献を本文に反映しました", "success");
    } catch (e) {
      console.error(e);
      toast("反映に失敗しました", "error");
    }
  };

  return (
    <div className={styles.root}>
      <h2>参考文献プレビュー</h2>
      <div className={styles.controls}>
        <label>スタイル:</label>
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
      </div>
      <div className={styles.preview} dangerouslySetInnerHTML={{ __html: previewHtml }} />
      <div className={styles.buttons}>
        <Button onClick={copyToClipboard}>コピー</Button>
        <Button onClick={handleApplyToDocument}>本文に反映</Button>
      </div>
    </div>
  );
};

export default BibliographyPanel;
