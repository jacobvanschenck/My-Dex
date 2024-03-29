import { DexAbi } from './contracts/DexAbi';
import { TokenAbi } from './contracts/TokenAbi';
import {
  Address,
  GetContractReturnType,
  PublicClient,
  WalletClient,
  createPublicClient,
  formatEther,
  getContract,
  http,
} from 'viem';
import { goerli, mainnet, sepolia } from 'viem/chains';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { DEX_ADDRESS } from './consts';
dayjs.extend(relativeTime);

export type DexContractRead = GetContractReturnType<typeof DexAbi, PublicClient>;
export type DexContractWrite = GetContractReturnType<typeof DexAbi, WalletClient>;
export type Order = {
  amount: string;
  filled: string;
  price: string;
  date: string;
  trader: Address;
};

export type Trade = {
  amount: string;
  price: string;
  date: string;
};

export const getDexRead = async (publicClient: PublicClient): Promise<DexContractRead> => {
  return getContract({
    address: DEX_ADDRESS,
    abi: DexAbi,
    publicClient,
  });
};

export const getDexReadWrite = async (
  publicClient: PublicClient,
  walletClient: WalletClient,
): Promise<DexContractWrite> => {
  const dex = getContract({
    address: DEX_ADDRESS,
    abi: DexAbi,
    walletClient,
    publicClient,
  });
  return dex;
};

export const getDexTradeEvents = async (client: PublicClient, dex: DexContractRead) => {
  const logs = await client.getContractEvents({
    address: dex.address,
    abi: DexAbi,
    eventName: 'NewTrade',
    fromBlock: 'earliest',
  });

  return logs;
};

export function getPublicClient() {
  return createPublicClient({
    chain: sepolia,
    transport: http(
      `https://eth-sepolia.g.alchemy.com/v2/${
        process.env.NETLIFY === 'true' ? process.env.VITE_ALCHEMY_API_KEY : import.meta.env.VITE_ALCHEMY_API_KEY
      }`,
    ),
  });
}

export async function getEthereumProvider() {
  const projectId =
    process.env.NETLIFY === 'true' ? process.env.VITE_WC_PROJECT_ID : import.meta.env.VITE_WC_PROJECT_ID;
  const provider = await EthereumProvider.init({
    projectId,
    showQrModal: false,
    chains: [mainnet.id],
    optionalChains: [goerli.id, sepolia.id],
    metadata: {
      name: 'TsunamiTrades',
      description: 'Decentrailzed exchange for Market and Limit orders',
      url: 'https://dex-vs.netlify.app/',
      icons: ['https://avatars.githubusercontent.com/u/37784886'],
    },
  });
  return provider;
}

export async function getTokenBalance(tokenAddress: Address, userAddress: Address, publicClient: PublicClient) {
  const data = await publicClient.readContract({
    address: tokenAddress,
    abi: TokenAbi,
    functionName: 'balanceOf',
    args: [userAddress],
  });
  return data;
}

export async function getDexBalance(userAddress: Address, ticker: Address, publicClient: PublicClient) {
  const data = await publicClient.readContract({
    address: DEX_ADDRESS,
    abi: DexAbi,
    functionName: 'traderBalances',
    args: [userAddress, ticker],
  });
  return data;
}

export function isAndroid(): boolean {
  return typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
}

export function isSmallIOS(): boolean {
  return typeof navigator !== 'undefined' && /iPhone|iPod/.test(navigator.userAgent);
}

export function isLargeIOS(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    (/iPad/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  );
}

export function isIOS(): boolean {
  return isSmallIOS() || isLargeIOS();
}

export function isMobile(): boolean {
  return isAndroid() || isIOS();
}

export function getRelativeDateFromBlockTimestamp(timestamp: bigint | undefined) {
  return dayjs(Number(timestamp) * 1000).fromNow();
}

export function truncateAddreess(address: Address) {
  return address.slice(0, 4) + '...' + address.slice(-4);
}

export function formatBalance(balance: bigint, digits: number = 3) {
  return formatEther(balance)
    .split('.')
    .map((s, i) => (i === 1 ? s.slice(0, digits) : s))
    .join('.');
}
