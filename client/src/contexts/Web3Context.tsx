import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import RoyaltyDistributionABI from '../constants/RoyaltyDistributionABI';
import { ownerAddress, Contract, getDeployedContracts } from '../constants/contractConfig';

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  account: string | null;
  balance: string;
  isOwner: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
  isLoading: boolean;
  deployedContracts: Contract[];
  selectedContract: Contract | null;
  selectContract: (contract: Contract) => Promise<void>;
  refreshContracts: () => void;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  contract: null,
  account: null,
  balance: '0',
  isOwner: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnected: false,
  isLoading: false,
  deployedContracts: [],
  selectedContract: null,
  selectContract: async () => {},
  refreshContracts: () => {},
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deployedContracts, setDeployedContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const refreshContracts = useCallback(() => {
    const contracts = getDeployedContracts();
    setDeployedContracts(contracts);
  }, []);

  useEffect(() => {
    refreshContracts();
  }, [refreshContracts]);

  const selectContract = async (contract: Contract) => {
    if (!signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const contractInstance = new ethers.Contract(
        contract.address,
        RoyaltyDistributionABI,
        signer
      );
      
      setContract(contractInstance);
      setSelectedContract(contract);
      toast.success(`Connected to contract: ${contract.name}`);
    } catch (error) {
      console.error('Error selecting contract:', error);
      toast.error('Failed to load contract');
    }
  };

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask not installed! Please install MetaMask to use this app.');
      return;
    }

    try {
      setIsLoading(true);
      
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      const ethSigner = ethProvider.getSigner();
      const address = await ethSigner.getAddress();
      
      // Get user balance
      const userBalance = await ethProvider.getBalance(address);
      
      // Check if user is owner
      const userIsOwner = address.toLowerCase() === ownerAddress.toLowerCase();
      
      setProvider(ethProvider);
      setSigner(ethSigner);
      setAccount(address);
      setBalance(ethers.utils.formatEther(userBalance));
      setIsOwner(userIsOwner);
      
      // Load deployed contracts
      refreshContracts();
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [refreshContracts]);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
    setBalance('0');
    setIsOwner(false);
    setSelectedContract(null);
    toast.info('Wallet disconnected');
  }, []);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      connectWallet();
    }
  }, [account, connectWallet, disconnectWallet]);

  const handleChainChanged = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [handleAccountsChanged]);

  const value = {
    provider,
    signer,
    contract,
    account,
    balance,
    isOwner,
    connectWallet,
    disconnectWallet,
    isConnected: !!account,
    isLoading,
    deployedContracts,
    selectedContract,
    selectContract,
    refreshContracts,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};