import type { AccountInfo, AuthenticationResult, SsoSilentRequest } from "@azure/msal-browser";
import { PublicClientApplication } from "@azure/msal-browser";

// Allow overrides via env; fall back to provided defaults for local/dev
const clientId = process.env.REACT_APP_AAD_CLIENT_ID || "f6b6f12e-8160-4f68-bdc4-c7c9a9c19019";
const tenantId = process.env.REACT_APP_AAD_TENANT_ID || "73136b73-224c-40dc-8a8d-03e6ab8917d8";
const redirectUri = process.env.REACT_APP_AAD_REDIRECT_URI || window.location.origin;

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
  },
  cache: {
    cacheLocation: "localStorage",
  },
});

export async function initializeMsal(): Promise<void> {
  // Initialize MSAL (required in v3+) and handle any pending redirects
  await msalInstance.initialize();
  await msalInstance.handleRedirectPromise();
}

export async function ensureMsalLogin(options?: {
  loginHint?: string;
  scopes?: string[];
}): Promise<AuthenticationResult | null> {
  const scopes = options?.scopes || ["openid", "profile", "email"];

  const active: AccountInfo | null = msalInstance.getActiveAccount() || null;
  if (active) {
    return { account: active } as unknown as AuthenticationResult;
  }

  const all = msalInstance.getAllAccounts();
  if (all.length > 0) {
    msalInstance.setActiveAccount(all[0]);
    return { account: all[0] } as unknown as AuthenticationResult;
  }

  try {
    const silentRequest: SsoSilentRequest = {
      scopes,
      loginHint: options?.loginHint,
    };
    const response = await msalInstance.ssoSilent(silentRequest);
    if (response?.account) {
      msalInstance.setActiveAccount(response.account);
      return response;
    }
  } catch (_) {
    // fall through to interactive redirect
  }

  await msalInstance.loginRedirect({ scopes });
  return null; // flow will continue after redirect
}

export async function acquireGraphToken(): Promise<string> {
  // Requires the API permission: Microsoft Graph User.Read delegated
  const response = await msalInstance.acquireTokenSilent({ scopes: ["User.Read"] });
  return response.accessToken;
}

export type GraphProfile = {
  displayName: string;
  email: string;
  photoDataUrl: string | null;
};

export async function fetchGraphProfile(): Promise<GraphProfile> {
  const token = await acquireGraphToken();
  const headers = { Authorization: `Bearer ${token}` } as const;

  const profileResp = await fetch("https://graph.microsoft.com/v1.0/me", { headers });
  const profile = await profileResp.json();
  const email = profile?.mail || profile?.userPrincipalName || "";
  const displayName = profile?.displayName || email || "";

  // Try to get small profile photo; if not available return null
  let photoDataUrl: string | null = null;
  try {
    const photoResp = await fetch("https://graph.microsoft.com/v1.0/me/photos/48x48/$value", { headers });
    if (photoResp.ok) {
      const blob = await photoResp.blob();
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      photoDataUrl = dataUrl;
    }
  } catch (_) {
    // ignore photo errors
  }

  return { displayName, email, photoDataUrl };
}


