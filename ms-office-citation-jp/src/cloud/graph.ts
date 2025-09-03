import { getToken } from './auth';

export async function gfetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  return fetch(`https://graph.microsoft.com/v1.0${path}`, {
    ...init,
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers||{}) }
  });
}
