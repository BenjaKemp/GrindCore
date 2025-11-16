import axios from 'axios';

const TRUELAYER_AUTH_URL = 'https://auth.truelayer-sandbox.com';
const TRUELAYER_API_URL = 'https://api.truelayer-sandbox.com';

export interface TrueLayerConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface TrueLayerTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface TrueLayerAccount {
  account_id: string;
  account_type: string;
  display_name: string;
  currency: string;
  account_number?: {
    number: string;
    sort_code: string;
  };
  provider: {
    provider_id: string;
    display_name: string;
  };
}

export interface TrueLayerTransaction {
  transaction_id: string;
  timestamp: string;
  description: string;
  amount: number;
  currency: string;
  transaction_type: string;
  transaction_category: string;
}

export interface TrueLayerBalance {
  currency: string;
  available: number;
  current: number;
}

export class TrueLayerClient {
  private config: TrueLayerConfig;

  constructor(config: TrueLayerConfig) {
    this.config = config;
  }

  // Generate OAuth authorization URL
  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'info accounts balance transactions offline_access',
      providers: 'uk-ob-all uk-oauth-all',
    });

    if (state) {
      params.append('state', state);
    }

    return `${TRUELAYER_AUTH_URL}?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCode(code: string): Promise<TrueLayerTokenResponse> {
    const response = await axios.post(
      `${TRUELAYER_AUTH_URL}/connect/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<TrueLayerTokenResponse> {
    const response = await axios.post(
      `${TRUELAYER_AUTH_URL}/connect/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  }

  // Get user's bank accounts
  async getAccounts(accessToken: string): Promise<TrueLayerAccount[]> {
    const response = await axios.get(`${TRUELAYER_API_URL}/data/v1/accounts`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.results || [];
  }

  // Get account balance
  async getBalance(accessToken: string, accountId: string): Promise<TrueLayerBalance> {
    const response = await axios.get(
      `${TRUELAYER_API_URL}/data/v1/accounts/${accountId}/balance`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.results[0];
  }

  // Get transactions
  async getTransactions(
    accessToken: string,
    accountId: string,
    from?: string,
    to?: string
  ): Promise<TrueLayerTransaction[]> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const response = await axios.get(
      `${TRUELAYER_API_URL}/data/v1/accounts/${accountId}/transactions?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.results || [];
  }
}

// Helper to categorize transactions based on description
export function categorizeTransaction(description: string): string {
  const lower = description.toLowerCase();
  
  if (lower.includes('dividend') || lower.includes('div pmt')) {
    return 'dividend';
  }
  if (lower.includes('interest') || lower.includes('int pmt')) {
    return 'interest';
  }
  if (lower.includes('rent') || lower.includes('rental')) {
    return 'rental';
  }
  if (lower.includes('freelance') || lower.includes('invoice')) {
    return 'freelance';
  }
  
  return 'other';
}

// Singleton instance
export function getTrueLayerClient(): TrueLayerClient {
  return new TrueLayerClient({
    clientId: process.env.TRUELAYER_CLIENT_ID!,
    clientSecret: process.env.TRUELAYER_CLIENT_SECRET!,
    redirectUri: process.env.TRUELAYER_REDIRECT_URI!,
  });
}

