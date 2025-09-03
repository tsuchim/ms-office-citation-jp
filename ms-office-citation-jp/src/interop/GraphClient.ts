export class GraphClient {
  private static async getAccessToken(): Promise<string> {
    try {
      const token = await OfficeRuntime.auth.getAccessToken({ allowSignInPrompt: true });
      return token;
    } catch (e) {
      console.error('SSO failed, fallback to manual auth', e);
      throw new Error('Graph API access requires authentication. Please sign in to Office.');
    }
  }

  static async fetchGraph(endpoint: string, method: 'GET' | 'PUT' = 'GET', body?: string): Promise<any> {
    const token = await this.getAccessToken();
    const url = `https://graph.microsoft.com/v1.0${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/xml',
      },
      body,
    });
    if (!response.ok) {
      throw new Error(`Graph API error: ${response.status} ${response.statusText}`);
    }
    return method === 'GET' ? response.text() : response.json();
  }
}
