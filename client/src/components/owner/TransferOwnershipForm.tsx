import { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

interface TransferOwnershipFormProps {
  onSuccess: () => void;
}

const TransferOwnershipForm = ({ onSuccess }: TransferOwnershipFormProps) => {
  const { contract } = useWeb3();
  const [newOwner, setNewOwner] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newOwner || !ethers.utils.isAddress(newOwner)) {
      toast.error('Please enter a valid wallet address');
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (contract) {
        const tx = await contract.transferOwnership(newOwner);
        toast.info('Transferring ownership... Please wait for confirmation');
        
        await tx.wait();
        toast.success('Ownership transferred successfully');
        
        // Reset form
        setNewOwner('');
        onSuccess();
      }
    } catch (error) {
      console.error('Error transferring ownership:', error);
      toast.error('Failed to transfer ownership');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="new-owner" className="label">
          New Owner Address
        </label>
        <input
          id="new-owner"
          type="text"
          className="input"
          placeholder="0x..."
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
          disabled={isLoading}
        />
      </div>
      
      <div className="bg-red-50 border border-red-200 p-4 rounded-md">
        <p className="text-sm text-red-800">
          <strong>Warning:</strong> Transferring ownership will give complete control of the contract 
          to the new owner. You will no longer be able to manage stakeholders or withdraw funds.
          This action cannot be undone.
        </p>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-danger"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          ) : 'Transfer Ownership'}
        </button>
      </div>
    </form>
  );
};

export default TransferOwnershipForm;