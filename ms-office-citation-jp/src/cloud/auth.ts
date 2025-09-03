import { PublicClientApplication } from '@azure/msal-browser';
import { loadConfig } from '../config';

let msal: PublicClientApplication | null = null;

export async function getMsal(): Promise<PublicClientApplication> {
  if (msal) return msal;
  const cfg = await loadConfig(); // { azureClientId, authority, redirectUri }
  if (!cfg.azureClientId) {
    throw new Error('Missing azureClientId in config.json');
  }
  msal = new PublicClientApplication({
    auth: {
      clientId: cfg.azureClientId,
      authority: cfg.authority,
      redirectUri: cfg.redirectUri,
    },
    cache: { cacheLocation: 'sessionStorage' },
  });
  await msal.initialize();
  return msal;
}

export async function loginIfNeeded(): Promise<void> {
  const msalInstance = await getMsal();
  const accs = msalInstance.getAllAccounts();
  if (accs.length) return;
  const res = await msalInstance.loginPopup({ scopes: ['User.Read'] });
  // account is stored automatically
}

export async function getToken(): Promise<string> {
  const msalInstance = await getMsal();
  const accs = msalInstance.getAllAccounts();
  if (!accs.length) {
    await loginIfNeeded();
  }
  const request = { scopes: ['User.Read'] };
  const response = await msalInstance.acquireTokenSilent(request);
  return response.accessToken;
}
