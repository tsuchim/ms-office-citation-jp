import * as React from "react";
import { makeStyles, Button, Text } from "@fluentui/react-components";
import { CitationService } from "../../services/CitationService";
import { BibliographyService } from "../../services/BibliographyService";
import { toast } from "../../app/toast";

const useStyles = makeStyles({
  root: {
    padding: "20px",
  },
  ml8: {
    marginLeft: "8px",
  },
});

const UpdatePanel: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Text>Update Panel - Regenerate citations and bibliography</Text>
      <Button
        onClick={async () => {
          try {
            await CitationService.updateAll();
            toast("引用を更新しました", "success");
          } catch (e) {
            console.error(e);
            toast("引用の更新に失敗", "error");
          }
        }}
      >
        引用を更新
      </Button>
      <Button
        className={styles.ml8}
        onClick={async () => {
          try {
            await BibliographyService.rebuild();
            toast("参考文献を再生成しました", "success");
          } catch (e) {
            console.error(e);
            toast("参考文献の再生成に失敗", "error");
          }
        }}
      >
        参考文献を再生成
      </Button>
    </div>
  );
};

export default UpdatePanel;
