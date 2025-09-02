import * as React from "react";
import { makeStyles, Button, Text, Dropdown } from "@fluentui/react-components";
import { UserStore } from "../../storage/UserStore";
import { CitationStyle } from "../../storage/DocStore";

const useStyles = makeStyles({
  root: {
    padding: "20px",
  },
});

const SettingsPanel: React.FC = () => {
  const styles = useStyles();
  const [style, setStyle] = React.useState<CitationStyle>("author-date");

  const handleSave = async () => {
    await UserStore.saveSettings({ style, locale: "ja" });
  };

  return (
    <div className={styles.root}>
      <Text>Settings Panel - Configure citation style and options</Text>
      <Dropdown
        placeholder="Select Style"
        value={style}
        onOptionSelect={(_, data) =>
          setStyle(data.optionValue as CitationStyle)
        }
      >
        <option value="author-date">Author-Date</option>
        <option value="numeric">Numeric</option>
      </Dropdown>
      <Button onClick={handleSave}>Save Settings</Button>
    </div>
  );
};

export default SettingsPanel;
