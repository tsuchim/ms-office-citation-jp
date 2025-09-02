import * as React from "react";
import { makeStyles, Button, Text } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    padding: "20px",
  },
});

const LibraryPanel: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Text>Library Panel - Import and manage citations</Text>
      <Button>Import BibTeX</Button>
      <Button>Search Citations</Button>
      <Button>Delete Citation</Button>
    </div>
  );
};

export default LibraryPanel;
