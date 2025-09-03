import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';

const msal = new PublicClientApplication({
  auth: {
    clientId: "<YOUR-AAD-APP-ID>", // TODO: Replace with actual client ID
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin
  },
  cache: { cacheLocation: "localStorage" }
});

let account: AccountInfo | null = null;

export async function loginIfNeeded(): Promise<void> {
  if (account) return;
  const accs = msal.getAllAccounts();
  if (accs.length) { account = accs[0]; return; }
  const res = await msal.loginPopup({ scopes: ["Files.ReadWrite", "Sites.ReadWrite.All", "User.Read"] });
  account = res.account!;
}

export async function getToken(): Promise<string> {
  await loginIfNeeded();
  const res = await msal.acquireTokenSilent({
    account: msal.getAllAccounts()[0],
    scopes: ["Files.ReadWrite", "Sites.ReadWrite.All", "User.Read"]
  }).catch(()=> msal.acquireTokenPopup({
    scopes: ["Files.ReadWrite", "Sites.ReadWrite.All", "User.Read"]
  }));
  return res!.accessToken;
}
