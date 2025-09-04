export type AppConfig = {
  azureClientId: string;
  authority: string;
  redirectUri: string;
};

export async function loadConfig(): Promise<AppConfig> {
  // 先頭 "/" は使わない。配信中の HTML と同ディレクトリ基準で解決する
  const url = new URL('config.json', window.location.href).toString();
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`config.json not found: ${res.status}`);
  const cfg = (await res.json()) as AppConfig;

  if (!cfg.azureClientId) throw new Error('Invalid config: missing azureClientId');
  return cfg;
}
