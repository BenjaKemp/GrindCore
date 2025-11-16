import { ethers } from 'ethers';
import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';

// Crypto price fetching
export async function getCryptoPriceInGBP(token: string): Promise<number> {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${getCoingeckoId(token)}&vs_currencies=gbp`
    );
    const coinId = getCoingeckoId(token);
    return response.data[coinId]?.gbp || 0;
  } catch (error) {
    console.error(`Error fetching price for ${token}:`, error);
    return 0;
  }
}

function getCoingeckoId(token: string): string {
  const mapping: Record<string, string> = {
    ETH: 'ethereum',
    SOL: 'solana',
    ADA: 'cardano',
    BNB: 'binancecoin',
    MATIC: 'matic-network',
  };
  return mapping[token] || token.toLowerCase();
}

// Ethereum staking rewards scanner
export async function scanEthereumStaking(address: string): Promise<any[]> {
  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com'
    );

    const rewards: any[] = [];

    // Lido staking (stETH)
    const lidoAddress = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
    const lidoAbi = [
      'function balanceOf(address account) view returns (uint256)',
      'event Transfer(address indexed from, address indexed to, uint256 value)',
    ];
    const lidoContract = new ethers.Contract(lidoAddress, lidoAbi, provider);

    try {
      const balance = await lidoContract.balanceOf(address);
      if (balance > 0) {
        rewards.push({
          source: 'lido',
          token: 'ETH',
          amount: parseFloat(ethers.formatEther(balance)),
          balance: parseFloat(ethers.formatEther(balance)),
        });
      }
    } catch (err) {
      console.warn('Error fetching Lido balance:', err);
    }

    // Rocket Pool staking (rETH)
    const rocketPoolAddress = '0xae78736Cd615f374D3085123A210448E74Fc6393';
    const rocketPoolContract = new ethers.Contract(rocketPoolAddress, lidoAbi, provider);

    try {
      const balance = await rocketPoolContract.balanceOf(address);
      if (balance > 0) {
        rewards.push({
          source: 'rocketpool',
          token: 'ETH',
          amount: parseFloat(ethers.formatEther(balance)),
          balance: parseFloat(ethers.formatEther(balance)),
        });
      }
    } catch (err) {
      console.warn('Error fetching Rocket Pool balance:', err);
    }

    return rewards;
  } catch (error) {
    console.error('Error scanning Ethereum staking:', error);
    return [];
  }
}

// Solana staking rewards scanner
export async function scanSolanaStaking(address: string): Promise<any[]> {
  try {
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    );

    const publicKey = new PublicKey(address);
    const rewards: any[] = [];

    // Get staking accounts
    const stakeAccounts = await connection.getStakeActivation(publicKey);

    if (stakeAccounts.state === 'active') {
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / 1e9; // Convert lamports to SOL

      rewards.push({
        source: 'solana-native',
        token: 'SOL',
        amount: solBalance,
        balance: solBalance,
      });
    }

    // Marinade Finance (mSOL)
    try {
      const mSolMint = new PublicKey('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So');
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: mSolMint,
      });

      if (tokenAccounts.value.length > 0) {
        const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
        rewards.push({
          source: 'marinade',
          token: 'SOL',
          amount: balance,
          balance,
        });
      }
    } catch (err) {
      console.warn('Error fetching Marinade balance:', err);
    }

    return rewards;
  } catch (error) {
    console.error('Error scanning Solana staking:', error);
    return [];
  }
}

// Cardano staking rewards (via Blockfrost)
export async function scanCardanoStaking(address: string): Promise<any[]> {
  try {
    if (!process.env.BLOCKFROST_API_KEY) {
      console.warn('Blockfrost API key not set');
      return [];
    }

    const response = await axios.get(
      `https://cardano-mainnet.blockfrost.io/api/v0/accounts/${address}/rewards`,
      {
        headers: {
          project_id: process.env.BLOCKFROST_API_KEY,
        },
      }
    );

    const rewards: any[] = [];
    const rewardData = response.data;

    if (Array.isArray(rewardData) && rewardData.length > 0) {
      const totalRewards = rewardData.reduce(
        (sum: number, r: any) => sum + parseInt(r.amount),
        0
      );
      const adaAmount = totalRewards / 1e6; // Convert lovelace to ADA

      rewards.push({
        source: 'cardano',
        token: 'ADA',
        amount: adaAmount,
        balance: adaAmount,
      });
    }

    return rewards;
  } catch (error) {
    console.error('Error scanning Cardano staking:', error);
    return [];
  }
}

// Binance Smart Chain staking (PancakeSwap)
export async function scanBinanceStaking(address: string): Promise<any[]> {
  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org'
    );

    const rewards: any[] = [];

    // PancakeSwap staking pools
    const cakeAddress = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82';
    const erc20Abi = ['function balanceOf(address account) view returns (uint256)'];
    const cakeContract = new ethers.Contract(cakeAddress, erc20Abi, provider);

    try {
      const balance = await cakeContract.balanceOf(address);
      if (balance > 0) {
        rewards.push({
          source: 'pancakeswap',
          token: 'BNB',
          amount: parseFloat(ethers.formatEther(balance)),
          balance: parseFloat(ethers.formatEther(balance)),
        });
      }
    } catch (err) {
      console.warn('Error fetching PancakeSwap balance:', err);
    }

    return rewards;
  } catch (error) {
    console.error('Error scanning Binance staking:', error);
    return [];
  }
}

// Main scanner function
export async function scanWalletRewards(address: string, chain: string): Promise<any[]> {
  switch (chain.toLowerCase()) {
    case 'ethereum':
      return scanEthereumStaking(address);
    case 'solana':
      return scanSolanaStaking(address);
    case 'cardano':
      return scanCardanoStaking(address);
    case 'binance':
      return scanBinanceStaking(address);
    default:
      console.warn(`Unsupported chain: ${chain}`);
      return [];
  }
}

// Calculate total rewards in GBP
export async function calculateTotalRewardsInGBP(rewards: any[]): Promise<number> {
  let total = 0;

  for (const reward of rewards) {
    const priceGBP = await getCryptoPriceInGBP(reward.token);
    total += reward.amount * priceGBP;
  }

  return total;
}

// Detect chain from address
export function detectChain(address: string): string | null {
  if (address.startsWith('0x') && address.length === 42) {
    // Could be Ethereum or Binance Smart Chain
    return 'ethereum'; // Default to Ethereum
  }
  if (address.length >= 32 && address.length <= 44 && !address.startsWith('0x')) {
    // Likely Solana
    return 'solana';
  }
  if (address.startsWith('addr1') || address.startsWith('stake1')) {
    return 'cardano';
  }
  return null;
}

