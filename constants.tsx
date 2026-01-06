
import { Network, InstanceSize } from './types';

export const NETWORKS: Network[] = [
  { id: 'eth', name: 'Ethereum', description: 'Mainnet + Sepolia', color: 'from-blue-500 to-purple-500', isAvailable: true },
  { id: 'bsc', name: 'Binance Smart Chain', description: 'BNB Smart Chain (BSC)', color: 'from-yellow-400 to-yellow-600', isAvailable: true },
  { id: 'flare', name: 'Flare', description: 'The Data Network', color: 'from-pink-500 to-red-600', isAvailable: true },
  { id: 'songbird', name: 'Songbird', description: 'Canary Network', color: 'from-yellow-500 to-orange-500', isAvailable: true },
  { id: 'polygon', name: 'Polygon', description: 'PoS + zkEVM', color: 'from-purple-500 to-purple-700', isAvailable: true },
  { id: 'arb', name: 'Arbitrum', description: 'One + Nova', color: 'from-blue-400 to-blue-600', isAvailable: true },
  { id: 'opt', name: 'Optimism', description: 'OP Mainnet', color: 'from-red-500 to-red-700', isAvailable: true },
  { id: 'avax', name: 'Avalanche', description: 'C-Chain', color: 'from-red-600 to-red-800', isAvailable: true },
  { id: 'sol', name: 'Solana', description: 'Mainnet-Beta', color: 'from-purple-600 to-green-500', isAvailable: true },
];

export const INSTANCE_SIZES: InstanceSize[] = [
  { id: 'performance', name: 'Performance (Recommended)', price: '$0.45/hr', specs: '16 vCPU • 64GB RAM • 2TB NVMe' },
  { id: 'standard', name: 'Standard', price: '$0.22/hr', specs: '8 vCPU • 32GB RAM • 1TB SSD' },
];
