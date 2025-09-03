export interface Config {
  azureClientId: string;
  authority: string;
  redirectUri: string;
}

let configCache: Config | null = null;

export async function loadConfig(): Promise<Config> {
  if (configCache) return configCache;
  const response = await fetch('/config.json');
  if (!response.ok) {
    throw new Error('Failed to load config.json');
  }
  configCache = await response.json();
  return configCache!;
}
