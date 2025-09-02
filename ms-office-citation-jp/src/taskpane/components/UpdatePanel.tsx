import * as React from "react";
import { makeStyles, Button, Text } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    padding: "20px",
  },
});

const UpdatePanel: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Text>Update Panel - Regenerate citations and bibliography</Text>
      <Button>Update Citations</Button>
      <Button>Update Bibliography</Button>
    </div>
  );
};

export default UpdatePanel;
