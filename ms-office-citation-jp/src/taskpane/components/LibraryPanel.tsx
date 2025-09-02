import * as React from "react";
import { makeStyles, Button, Text } from "@fluentui/react-components";
import { ImportService } from "../../services/ImportService";

const useStyles = makeStyles({
  root: {
    padding: "20px",
  },
});

const LibraryPanel: React.FC = () => {
  const styles = useStyles();

  const handleLoadSample = async () => {
    try {
      const response = await fetch('/samples/seed.csljson');
      const data = await response.text();
      await ImportService.importAndMerge(data, 'csljson');
      alert('Sample data loaded successfully!');
    } catch (error) {
      console.error('Error loading sample data:', error);
      alert('Failed to load sample data.');
    }
  };

  return (
    <div className={styles.root}>
      <Text>Library Panel - Import and manage citations</Text>
      <Button onClick={handleLoadSample}>Load Sample Data</Button>
      <Button>Import BibTeX</Button>
      <Button>Search Citations</Button>
      <Button>Delete Citation</Button>
    </div>
  );
};

export default LibraryPanel;
