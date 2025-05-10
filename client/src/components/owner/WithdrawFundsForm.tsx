import { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

interface WithdrawFundsFormProps {
  contractBalance: string;
  onSuccess: () => void;
}

const WithdrawFundsForm = ({ contractBalance, onSuccess }: WithdrawFundsFormProps) => {
  const { contract } = useWeb3();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (Number(amount) > Number(contractBalance)) {
      toast.error('Amount exceeds contract balance');
      return;
    }
    
    if (!recipient || !ethers.utils.isAddress(recipient)) {
      toast.error('Please enter a valid recipient address');
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (contract) {
        const amountWei = ethers.utils.parseEther(amount);
        
        const tx = await contract.withdraw(amountWei, recipient);
        toast.info('Withdrawing funds... Please wait for confirmation');
        
        await tx.wait();
        toast.success('Funds withdrawn successfully');
        
        // Reset form
        setAmount('');
        onSuccess();
      }
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast.error('Failed to withdraw funds');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="amount" className="label">
          Amount (ETH)
        </label>
        <input
          id="amount"
          type="number"
          step="0.0001"
          min="0"
          max={contractBalance}
          className="input"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isLoading}
        />
        <p className="mt-1 text-sm text-gray-500">
          Available balance: {contractBalance} ETH
        </p>
      </div>
      
      <div>
        <label htmlFor="recipient" className="label">
          Recipient Address
        </label>
        <input
          id="recipient"
          type="text"
          className="input"
          placeholder="0x..."
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          disabled={isLoading}
        />
      </div>
      
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Withdrawing funds will reduce the contract's balance. These funds will not be distributed
          according to the royalty rules but will be sent directly to the specified recipient.
        </p>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading || Number(contractBalance) <= 0}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          ) : 'Withdraw Funds'}
        </button>
      </div>
    </form>
  );
};

export default WithdrawFundsForm;