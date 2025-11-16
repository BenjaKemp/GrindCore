'use client';

import { useState } from 'react';

interface CryptoReward {
  token: string;
  amount: number;
  amountGBP: number;
  sources: string[];
}

interface CryptoCardProps {
  rewards: CryptoReward[];
  totalGBP: number;
  isUAE?: boolean;
  lastScanned?: Date | null;
}

export function CryptoCard({ rewards, totalGBP, isUAE = false, lastScanned }: CryptoCardProps) {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = async () => {
    if (!walletAddress) return;

    setIsConnecting(true);
    try {
      const response = await fetch('/api/crypto/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress }),
      });

      if (response.ok) {
        setShowConnectModal(false);
        setWalletAddress('');
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to connect wallet');
      }
    } catch (error) {
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatCrypto = (amount: number, decimals = 4) => {
    return amount.toFixed(decimals);
  };

  const getSourceDisplay = (source: string) => {
    const sourceMap: Record<string, string> = {
      lido: 'Lido',
      rocketpool: 'Rocket Pool',
      marinade: 'Marinade',
      jito: 'Jito',
      solflare: 'Solflare',
      cardano: 'Cardano',
      pancakeswap: 'PancakeSwap',
      'solana-native': 'Solana Native',
    };
    return sourceMap[source] || source;
  };

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <div className="rounded-lg border bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            🚀 Crypto Staking Rewards
          </h3>
          {!rewards.length && (
            <button
              onClick={() => setShowConnectModal(true)}
              className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {rewards.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">Total Staking Balance</p>
              <p className="text-4xl font-bold">{formatCurrency(totalGBP)}</p>
              {lastScanned && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last scanned: {new Date(lastScanned).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Rewards Breakdown */}
            <div className="grid gap-3 md:grid-cols-2">
              {rewards.map((reward, idx) => (
                <div key={idx} className="rounded-lg border bg-white/50 dark:bg-zinc-900/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{reward.token}</span>
                    <span className="text-xs text-muted-foreground">
                      {reward.sources.map(getSourceDisplay).join(', ')}
                    </span>
                  </div>
                  <p className="text-xl font-bold">
                    {formatCrypto(reward.amount)} {reward.token}
                  </p>
                  <p className="text-sm text-muted-foreground">≈ {formatCurrency(reward.amountGBP)}</p>
                </div>
              ))}
            </div>

            {/* UAE Tax Advice */}
            {isUAE && (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 p-4">
                <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                  ✓ UAE Resident – No Tax on Staking Rewards
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  As a UAE resident, your crypto staking rewards are tax-free. No capital gains tax, no income tax.
                </p>
              </div>
            )}

            {/* Restaking CTA */}
            <div className="mt-6 rounded-lg border bg-white dark:bg-zinc-900 p-4">
              <p className="text-sm font-semibold mb-2">💡 Maximize Your Rewards</p>
              <p className="text-xs text-muted-foreground mb-3">
                Restake your rewards to compound your earnings. Average APY: 4-6% for ETH, 7-9% for SOL.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://lido.fi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 hover:underline dark:text-purple-400"
                >
                  Lido ETH
                </a>
                <span className="text-xs text-muted-foreground">•</span>
                <a
                  href="https://marinade.finance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 hover:underline dark:text-purple-400"
                >
                  Marinade SOL
                </a>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg font-medium mb-2">Track Your Crypto Staking Rewards</p>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your wallet to automatically track rewards from Lido, Rocket Pool, Marinade, and more.
            </p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="rounded-md bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              Connect Crypto Wallet
            </button>
          </div>
        )}
      </div>

      {/* Coinbase Affiliate */}
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-semibold mb-2">🎁 Get £10 Free on Coinbase</p>
        <p className="text-xs text-muted-foreground mb-3">
          Buy crypto on Coinbase and get £10 free when you trade £100 or more.
        </p>
        <a
          href="https://www.coinbase.com/join/kemp_benj"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
        >
          Claim £10 Free →
        </a>
      </div>

      {/* Connect Wallet Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-lg border bg-white dark:bg-zinc-900 p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Connect Crypto Wallet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your wallet address. We support Ethereum, Solana, Cardano, and Binance Smart Chain.
            </p>
            <input
              type="text"
              placeholder="0x... or wallet address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleConnectWallet}
                disabled={!walletAddress || isConnecting}
                className="flex-1 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </button>
              <button
                onClick={() => setShowConnectModal(false)}
                className="rounded-md border px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Read-only access. We never ask for private keys.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

