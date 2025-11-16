import axios from 'axios';

// P2P Lending providers
export type P2PProvider = 'zopa' | 'ratesetter' | 'lendingworks';

// Zopa API configuration (using Open Banking via TrueLayer or similar)
const ZOPA_AUTH_URL = 'https://api.zopa.com/oauth/authorize';
const ZOPA_API_URL = 'https://api.zopa.com/v1';

export interface P2PConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface P2PTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface P2PAccount {
  account_id: string;
  provider: P2PProvider;
  balance: number;
  interest_rate: number;
  currency: string;
}

export interface P2PInterestPayment {
  payment_id: string;
  amount: number;
  date: string;
  rate: number;
  description: string;
}

export class P2PLendingClient {
  private config: P2PConfig;
  private provider: P2PProvider;

  constructor(provider: P2PProvider, config: P2PConfig) {
    this.provider = provider;
    this.config = config;
  }

  // Generate OAuth authorization URL
  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'account:read transactions:read',
    });

    if (state) {
      params.append('state', state);
    }

    // Note: In production, use actual provider OAuth URLs
    const authUrls: Record<P2PProvider, string> = {
      zopa: `${ZOPA_AUTH_URL}?${params.toString()}`,
      ratesetter: `https://api.ratesetter.com/oauth?${params.toString()}`,
      lendingworks: `https://api.lendingworks.co.uk/oauth?${params.toString()}`,
    };

    return authUrls[this.provider];
  }

  // Exchange authorization code for access token
  async exchangeCode(code: string): Promise<P2PTokenResponse> {
    try {
      // Mock implementation - replace with actual API calls
      const response = await axios.post(
        `${ZOPA_API_URL}/oauth/token`,
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
    } catch (error) {
      console.error('Error exchanging code:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<P2PTokenResponse> {
    try {
      const response = await axios.post(
        `${ZOPA_API_URL}/oauth/token`,
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
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  // Get P2P account details
  async getAccount(accessToken: string): Promise<P2PAccount> {
    try {
      // Mock implementation
      const response = await axios.get(`${ZOPA_API_URL}/account`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching account:', error);
      // Return mock data for development
      return {
        account_id: 'mock-' + Math.random().toString(36).substr(2, 9),
        provider: this.provider,
        balance: 5000 + Math.random() * 5000,
        interest_rate: 4.5 + Math.random() * 2,
        currency: 'GBP',
      };
    }
  }

  // Get interest payments
  async getInterestPayments(
    accessToken: string,
    from?: string,
    to?: string
  ): Promise<P2PInterestPayment[]> {
    try {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const response = await axios.get(
        `${ZOPA_API_URL}/interest?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching interest payments:', error);
      // Return mock data for development
      return this.generateMockInterestPayments();
    }
  }

  // Generate mock interest payments for development
  private generateMockInterestPayments(): P2PInterestPayment[] {
    const payments: P2PInterestPayment[] = [];
    const now = new Date();

    for (let i = 0; i < 6; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);

      payments.push({
        payment_id: `int-${i}`,
        amount: 15 + Math.random() * 20,
        date: date.toISOString(),
        rate: 5.2,
        description: `${this.provider} interest payment`,
      });
    }

    return payments;
  }
}

// Helper function to get P2P client
export function getP2PClient(provider: P2PProvider): P2PLendingClient {
  return new P2PLendingClient(provider, {
    clientId: process.env[`${provider.toUpperCase()}_CLIENT_ID`] || 'mock-client-id',
    clientSecret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`] || 'mock-secret',
    redirectUri: process.env[`${provider.toUpperCase()}_REDIRECT_URI`] || `http://localhost:3000/api/p2p/${provider}/callback`,
  });
}

// Calculate total P2P interest
export function calculateTotalInterest(payments: P2PInterestPayment[]): number {
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
}

// Calculate average rate
export function calculateAverageRate(payments: P2PInterestPayment[]): number {
  if (payments.length === 0) return 0;
  const totalRate = payments.reduce((sum, payment) => sum + (payment.rate || 0), 0);
  return totalRate / payments.length;
}

