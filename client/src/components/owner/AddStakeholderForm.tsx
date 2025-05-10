import { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

interface Stakeholder {
  wallet: string;
  percentage: number;
}

interface AddStakeholderFormProps {
  stakeholders: Stakeholder[];
  onSuccess: () => void;
}

const AddStakeholderForm = ({ stakeholders, onSuccess }: AddStakeholderFormProps) => {
  const { contract } = useWeb3();
  const [newWallet, setNewWallet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [percentages, setPercentages] = useState<number[]>(
    stakeholders.map(s => s.percentage)
  );
  const [newPercentage, setNewPercentage] = useState(0);

  const handlePercentageChange = (index: number, value: string) => {
    const newValue = value === '' ? 0 : Number(value);
    const newPercentages = [...percentages];
    newPercentages[index] = newValue;
    setPercentages(newPercentages);
    
    // Calculate what remains for the new stakeholder
    const sum = newPercentages.reduce((acc, val) => acc + val, 0);
    setNewPercentage(Math.max(0, 100 - sum));
  };

  const validateForm = () => {
    if (!newWallet || !ethers.utils.isAddress(newWallet)) {
      toast.error('Please enter a valid wallet address');
      return false;
    }
    
    if (stakeholders.some(s => s.wallet.toLowerCase() === newWallet.toLowerCase())) {
      toast.error('This address is already a stakeholder');
      return false;
    }
    
    const totalPercentage = [...percentages, newPercentage].reduce((acc, val) => acc + val, 0);
    if (totalPercentage !== 100) {
      toast.error('Total percentage must be 100%');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      if (contract) {
        // All percentages including the new stakeholder
        const allPercentages = [...percentages, newPercentage];
        
        const tx = await contract.addStakeholder(newWallet, allPercentages);
        toast.info('Adding stakeholder... Please wait for confirmation');
        
        await tx.wait();
        toast.success('Stakeholder added successfully');
        
        // Reset form
        setNewWallet('');
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding stakeholder:', error);
      toast.error('Failed to add stakeholder');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="new-wallet" className="label">
          New Stakeholder Wallet Address
        </label>
        <input
          id="new-wallet"
          type="text"
          className="input"
          placeholder="0x..."
          value={newWallet}
          onChange={(e) => setNewWallet(e.target.value)}
          disabled={isLoading}
        />
      </div>
      
      <div>
        <h3 className="text-md font-medium mb-3">Adjust Percentages</h3>
        <p className="text-sm text-gray-500 mb-4">
          Redistribute percentages between existing stakeholders. The total must add up to 100%.
        </p>
        
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {stakeholders.map((stakeholder, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-grow">
                <span className="text-sm font-medium">
                  {stakeholder.wallet.slice(0, 6)}...{stakeholder.wallet.slice(-4)}
                </span>
              </div>
              <div className="w-24">
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input"
                  value={percentages[index]}
                  onChange={(e) => handlePercentageChange(index, e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <span className="text-sm">%</span>
            </div>
          ))}
          
          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-md">
            <div className="flex-grow">
              <span className="text-sm font-medium">New Stakeholder</span>
            </div>
            <div className="w-24">
              <input
                type="number"
                className="input bg-white"
                value={newPercentage}
                readOnly
              />
            </div>
            <span className="text-sm">%</span>
          </div>
        </div>
        
        <div className="mt-3 flex justify-between text-sm">
          <span>Total:</span>
          <span className={`font-medium ${[...percentages, newPercentage].reduce((acc, val) => acc + val, 0) === 100 ? 'text-accent-600' : 'text-red-500'}`}>
            {[...percentages, newPercentage].reduce((acc, val) => acc + val, 0)}%
          </span>
        </div>
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
          ) : 'Add Stakeholder'}
        </button>
      </div>
    </form>
  );
};

// Import required dependencies
import { ethers } from 'ethers';

export default AddStakeholderForm;