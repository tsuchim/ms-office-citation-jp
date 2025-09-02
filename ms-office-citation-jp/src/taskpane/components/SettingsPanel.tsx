import * as React from "react";
import { makeStyles, Button, Text, Dropdown } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    padding: "20px",
  },
});

const SettingsPanel: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Text>Settings Panel - Configure citation style and options</Text>
      <Dropdown placeholder="Select Style" />
      <Button>Save Settings</Button>
    </div>
  );
};

export default SettingsPanel;
