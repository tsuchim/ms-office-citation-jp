import * as React from "react";
import { makeStyles, Button, Text, Input, Checkbox, Dialog, DialogTrigger, DialogSurface, DialogTitle, DialogBody, DialogActions } from "@fluentui/react-components";
import { useState } from 'react';
import { CitationService } from '../../services/CitationService';
import { toast } from '../../app/toast';

const useStyles = makeStyles({
  root: {
    padding: "20px",
  },
  mb8: {
    marginBottom: "8px",
  },
});

interface CitationOptions {
  locator?: string;
  prefix?: string;
  suffix?: string;
  suppressAuthor?: boolean;
  suppressYear?: boolean;
}

const EditCitationDialog: React.FC<{ keys: string[] }> = ({ keys }) => {
  const styles = useStyles();
  const [options, setOptions] = useState<CitationOptions>({});

  const updateOption = (key: keyof CitationOptions, value: any) => {
    setOptions({ ...options, [key]: value });
  };

  const insertWithOptions = async () => {
    try {
      await CitationService.insertAtSelection(keys, options);
      toast('引用を挿入しました', 'success');
    } catch (e) {
      console.error(e);
      toast('引用の挿入に失敗', 'error');
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button>詳細編集して挿入</Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogTitle>引用の詳細編集</DialogTitle>
        <DialogBody>
          <div className={styles.mb8}>
            <Text>プレフィックス:</Text>
            <Input value={options.prefix || ''} onChange={(e) => updateOption('prefix', e.target.value)} />
          </div>
          <div className={styles.mb8}>
            <Text>ページ/章:</Text>
            <Input value={options.locator || ''} onChange={(e) => updateOption('locator', e.target.value)} />
          </div>
          <div className={styles.mb8}>
            <Text>サフィックス:</Text>
            <Input value={options.suffix || ''} onChange={(e) => updateOption('suffix', e.target.value)} />
          </div>
          <div className={styles.mb8}>
            <Checkbox checked={options.suppressAuthor || false} onChange={(e) => updateOption('suppressAuthor', e.target.checked)} label="著者名を抑制" />
          </div>
          <div className={styles.mb8}>
            <Checkbox checked={options.suppressYear || false} onChange={(e) => updateOption('suppressYear', e.target.checked)} label="年を抑制" />
          </div>
        </DialogBody>
        <DialogActions>
          <Button onClick={insertWithOptions}>挿入</Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};

export default EditCitationDialog;
