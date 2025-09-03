import { PublicClientApplication } from '@azure/msal-browser';
import { loadConfig } from '../config';

let msal: PublicClientApplication | null = null;

export async function getMsal(): Promise<PublicClientApplication> {
  if (msal) return msal;
  const cfg = await loadConfig();
  msal = new PublicClientApplication({
    auth: {
      clientId: cfg.azureClientId,
      authority: cfg.authority,
      redirectUri: cfg.redirectUri
    },
    cache: { cacheLocation: 'sessionStorage' }
  });
  return msal;
}

export async function loginIfNeeded(): Promise<void> {
  const msalInstance = await getMsal();
  const accs = msalInstance.getAllAccounts();
  if (accs.length) return;
  const res = await msalInstance.loginPopup({ scopes: ['User.Read'] });
  // account is stored automatically
}
