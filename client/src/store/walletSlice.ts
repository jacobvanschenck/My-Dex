import Provider from '@walletconnect/ethereum-provider';
import { Address, PublicClient, WalletClient } from 'viem';
import { StateCreator } from 'zustand';
import { getEthereumProvider, getPublicClient } from '../utils';

export type WalletSlice = {
  isConnected: boolean;
  provider: Provider | null;
  setProvider: (provider: Provider) => void;
  account: Address | null;
  setAccount: (account: Address | null) => void;
  balance: string | null;
  setBalance: (balance: string | null) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  publicClient: PublicClient;
  walletClient: WalletClient | null;
  setWalletClient: (client: WalletClient) => void;
};

export const createWalletSlice: StateCreator<WalletSlice> = (set, get) => ({
  isConnected: JSON.parse(window.localStorage.getItem('dex.wc_connected') as string),
  provider: null,
  setProvider: (provider: Provider) => set({ provider }),
  account: null,
  setAccount: (account: Address | null) => set({ account }),
  balance: null,
  setBalance: (balance: string | null) => set({ balance }),
  connect: async () => {
    const provider = await getEthereumProvider();
    const isConnected = get().isConnected;
    if (!provider) return;
    if (!isConnected) {
      await provider.connect();
      window.localStorage.setItem('dex.wc_connected', JSON.stringify(true));
      set({ account: provider.accounts[0] as Address, isConnected: true });
    }
  },
  disconnect: async () => {
    const provider = get().provider;
    if (!provider) return;

    const wcConnected = JSON.parse(window.localStorage.getItem('dex.wc_connected'));
    const metaConnected = JSON.parse(window.localStorage.getItem('dex.metamask_connected'));

    if (wcConnected) {
      window.localStorage.setItem('dex.wc_connected', JSON.stringify(false));
      await provider.disconnect();
    }
    if (metaConnected) {
      window.localStorage.setItem('dex.metamask_connected', JSON.stringify(false));
    }
    set({ account: null, isConnected: false, balance: null });
  },
  publicClient: getPublicClient(),
  walletClient: null,
  setWalletClient: (client: WalletClient) => set({ walletClient: client }),
});
