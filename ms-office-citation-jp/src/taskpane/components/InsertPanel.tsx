import * as React from "react";
import { makeStyles, Button, Text } from "@fluentui/react-components";
import { CitationService } from "../../services/CitationService";
// TODO: Import engine instance

const useStyles = makeStyles({
  root: {
    padding: "20px",
  },
});

const InsertPanel: React.FC = () => {
  const styles = useStyles();

  const handleInsert = async () => {
    // TODO: Get selected keys from library
    const keys = ["key1"]; // Placeholder
    // const citationService = new CitationService(engine);
    // await citationService.insertAtSelection(keys);
  };

  return (
    <div className={styles.root}>
      <Text>Insert Panel - Select and insert citations</Text>
      <Button onClick={handleInsert}>Insert Citation</Button>
    </div>
  );
};

export default InsertPanel;
