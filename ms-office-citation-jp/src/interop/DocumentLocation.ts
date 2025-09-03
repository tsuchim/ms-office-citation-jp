import { GraphClient } from './GraphClient';

export class DocumentLocation {
  static async getDocumentLocation(): Promise<{ driveId: string; itemId: string; parentId: string }> {
    return new Promise((resolve, reject) => {
      Office.context.document.getFilePropertiesAsync((res) => {
        if (res.status !== Office.AsyncResultStatus.Succeeded) {
          reject(new Error('Failed to get document properties'));
          return;
        }
        const url = res.value.url;
        if (!url) {
          reject(new Error('Document URL not available'));
          return;
        }
        // SharePoint/OneDrive URLからshareIdを生成
        const shareId = "u!" + btoa(url.replace(/^https?:\/\//, ''));
        GraphClient.fetchGraph(`/shares/${shareId}/driveItem`)
          .then((driveItem: any) => {
            resolve({
              driveId: driveItem.parentReference.driveId,
              itemId: driveItem.id,
              parentId: driveItem.parentReference.id,
            });
          })
          .catch(reject);
      });
    });
  }
}
