import { useWeb3 } from '../../contexts/Web3Context';
import { Wallet } from 'lucide-react';

const ConnectWallet = () => {
  const { connectWallet, disconnectWallet, isConnected, account, isLoading } = useWeb3();

  return (
    <div>
      {!isConnected ? (
        <button 
          onClick={connectWallet} 
          disabled={isLoading}
          className="btn-primary flex items-center gap-2"
        >
          <Wallet size={20} />
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </div>
          <button onClick={disconnectWallet} className="btn-secondary text-sm">
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;