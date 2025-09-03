import { getToken } from './auth';
import { gfetch } from './graph';

export async function resolveCurrentParent(): Promise<{ driveId:string; parentId:string; }> {
  const url = await new Promise<string>((resolve, reject)=>{
    Office.context.document.getFilePropertiesAsync(res=>{
      if (res.status !== Office.AsyncResultStatus.Succeeded) return reject(new Error("file props"));
      resolve(res.value.url);
    });
  });

  const shareId = "u!" + btoa(url.replace(/^https?:\/\//,''));
  const token = await getToken();
  const res = await gfetch(`/shares/${encodeURIComponent(shareId)}/driveItem`, { method: 'GET' });
  if (!res.ok) throw new Error(`Graph error: ${res.status}`);
  const di = await res.json();
  return { driveId: di.parentReference.driveId, parentId: di.parentReference.id };
}

export async function readTextFromSameFolder(filename: string): Promise<string|null> {
  const { driveId, parentId } = await resolveCurrentParent();
  const token = await getToken();
  const res = await gfetch(`/drives/${driveId}/items/${parentId}/children?$filter=name eq '${filename}'`, { method: 'GET' });
  if (!res.ok) throw new Error(`Graph error: ${res.status}`);
  const children = await res.json();
  if (!children.value?.length) return null;
  const itemId = children.value[0].id;
  const contentRes = await gfetch(`/drives/${driveId}/items/${itemId}/content`, { method: 'GET' });
  if (!contentRes.ok) throw new Error(`Graph error: ${contentRes.status}`);
  return contentRes.text();
}

export async function writeTextToSameFolder(filename: string, content: string): Promise<void> {
  const { driveId, parentId } = await resolveCurrentParent();
  const token = await getToken();
  const res = await gfetch(`/drives/${driveId}/items/${parentId}:/${filename}:/content`, {
    method: "PUT",
    headers: { "Content-Type": "text/xml" },
    body: content
  });
  if (!res.ok) throw new Error(`Graph error: ${res.status}`);
}
