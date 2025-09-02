import * as React from "react";
import { makeStyles, Button, Text } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    padding: "20px",
  },
});

const InsertPanel: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Text>Insert Panel - Select and insert citations</Text>
      <Button>Insert Citation</Button>
    </div>
  );
};

export default InsertPanel;
