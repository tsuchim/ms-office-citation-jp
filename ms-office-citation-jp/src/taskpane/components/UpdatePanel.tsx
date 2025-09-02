import * as React from "react";
import { makeStyles, Button, Text } from "@fluentui/react-components";
import { CitationService } from "../../services/CitationService";
import { BibliographyService } from "../../services/BibliographyService";
// TODO: Import engine instance

const useStyles = makeStyles({
  root: {
    padding: "20px",
  },
});

const UpdatePanel: React.FC = () => {
  const styles = useStyles();

  const handleUpdateCitations = async () => {
    // const citationService = new CitationService(engine);
    // await citationService.updateAll();
  };

  const handleUpdateBibliography = async () => {
    // const bibliographyService = new BibliographyService(engine);
    // await bibliographyService.rebuild();
  };

  return (
    <div className={styles.root}>
      <Text>Update Panel - Regenerate citations and bibliography</Text>
      <Button onClick={handleUpdateCitations}>Update Citations</Button>
      <Button onClick={handleUpdateBibliography}>Update Bibliography</Button>
    </div>
  );
};

export default UpdatePanel;
