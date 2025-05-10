import { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

interface Stakeholder {
  wallet: string;
  percentage: number;
}

interface RemoveStakeholderFormProps {
  stakeholders: Stakeholder[];
  onSuccess: () => void;
}

const RemoveStakeholderForm = ({ stakeholders, onSuccess }: RemoveStakeholderFormProps) => {
  const { contract } = useWeb3();
  const [selectedWallet, setSelectedWallet] = useState('');
  const [autoRedistribute, setAutoRedistribute] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWallet) {
      toast.error('Please select a stakeholder to remove');
      return;
    }
    
    if (stakeholders.length <= 1) {
      toast.error('Cannot remove the last stakeholder');
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (contract) {
        const tx = await contract.removeStakeholder(selectedWallet, autoRedistribute);
        toast.info('Removing stakeholder... Please wait for confirmation');
        
        await tx.wait();
        toast.success('Stakeholder removed successfully');
        
        // Reset form
        setSelectedWallet('');
        onSuccess();
      }
    } catch (error) {
      console.error('Error removing stakeholder:', error);
      toast.error('Failed to remove stakeholder');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="stakeholder" className="label">
          Select Stakeholder to Remove
        </label>
        <select
          id="stakeholder"
          className="input"
          value={selectedWallet}
          onChange={(e) => setSelectedWallet(e.target.value)}
          disabled={isLoading}
        >
          <option value="">Select a stakeholder</option>
          {stakeholders.map((stakeholder, index) => (
            <option key={index} value={stakeholder.wallet}>
              {stakeholder.wallet.slice(0, 6)}...{stakeholder.wallet.slice(-4)} ({stakeholder.percentage}%)
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          id="auto-redistribute"
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          checked={autoRedistribute}
          onChange={(e) => setAutoRedistribute(e.target.checked)}
          disabled={isLoading}
        />
        <label htmlFor="auto-redistribute" className="text-sm text-gray-700">
          Automatically redistribute shares to remaining stakeholders
        </label>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
        <p className="text-sm text-amber-800">
          <strong>Warning:</strong> Removing a stakeholder is permanent. If auto-redistribute is disabled, 
          you'll need to manually update other stakeholders to ensure the total is 100%.
        </p>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-danger"
          disabled={isLoading || stakeholders.length <= 1}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          ) : 'Remove Stakeholder'}
        </button>
      </div>
    </form>
  );
};

export default RemoveStakeholderForm;