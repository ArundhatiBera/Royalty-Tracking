import { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

interface Stakeholder {
  wallet: string;
  percentage: number;
}

interface UpdateStakeholderFormProps {
  stakeholders: Stakeholder[];
  onSuccess: () => void;
}

const UpdateStakeholderForm = ({ stakeholders, onSuccess }: UpdateStakeholderFormProps) => {
  const { contract } = useWeb3();
  const [selectedWallet, setSelectedWallet] = useState('');
  const [newPercentage, setNewPercentage] = useState('');
  const [autoAdjust, setAutoAdjust] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWallet) {
      toast.error('Please select a stakeholder');
      return;
    }
    
    if (!newPercentage || isNaN(Number(newPercentage)) || Number(newPercentage) <= 0 || Number(newPercentage) > 100) {
      toast.error('Please enter a valid percentage between 1-100');
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (contract) {
        const tx = await contract.updateStakeholder(
          selectedWallet,
          Number(newPercentage),
          autoAdjust
        );
        toast.info('Updating stakeholder... Please wait for confirmation');
        
        await tx.wait();
        toast.success('Stakeholder updated successfully');
        
        // Reset form
        setSelectedWallet('');
        setNewPercentage('');
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating stakeholder:', error);
      toast.error('Failed to update stakeholder');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="stakeholder" className="label">
          Select Stakeholder
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
      
      <div>
        <label htmlFor="new-percentage" className="label">
          New Percentage
        </label>
        <input
          id="new-percentage"
          type="number"
          min="1"
          max="100"
          className="input"
          placeholder="Enter new percentage"
          value={newPercentage}
          onChange={(e) => setNewPercentage(e.target.value)}
          disabled={isLoading}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <input
          id="auto-adjust"
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          checked={autoAdjust}
          onChange={(e) => setAutoAdjust(e.target.checked)}
          disabled={isLoading}
        />
        <label htmlFor="auto-adjust" className="text-sm text-gray-700">
          Automatically adjust other stakeholders' percentages
        </label>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> When auto-adjust is enabled, other stakeholders' percentages 
          will be proportionally adjusted to maintain a total of 100%. If disabled, you'll need to 
          manually update other stakeholders to ensure the total is 100%.
        </p>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          ) : 'Update Stakeholder'}
        </button>
      </div>
    </form>
  );
};

export default UpdateStakeholderForm;