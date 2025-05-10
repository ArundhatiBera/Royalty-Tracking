import { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { saveContract } from '../../constants/contractConfig';
import { Loader2 } from 'lucide-react';
import RoyaltyDistribution from '../../../../smart-contract/artifacts/contracts/RoyaltyTracking.sol/RoyaltyDistribution.json';

interface InitialStakeholder {
  wallet: string;
  percentage: number;
}

const DeployContract = () => {
  const { signer, refreshContracts } = useWeb3();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stakeholders, setStakeholders] = useState<InitialStakeholder[]>([
    { wallet: '', percentage: 0 }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addStakeholder = () => {
    setStakeholders([...stakeholders, { wallet: '', percentage: 0 }]);
  };

  const removeStakeholder = (index: number) => {
    setStakeholders(stakeholders.filter((_, i) => i !== index));
  };

  const updateStakeholder = (index: number, field: keyof InitialStakeholder, value: string) => {
    const newStakeholders = [...stakeholders];
    if (field === 'percentage') {
      newStakeholders[index][field] = parseInt(value) || 0;
    } else {
      newStakeholders[index][field] = value;
    }
    setStakeholders(newStakeholders);
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    const totalPercentage = stakeholders.reduce((sum, s) => sum + s.percentage, 0);
    if (totalPercentage !== 100) {
      toast.error('Total percentage must be 100%');
      return;
    }

    if (!name.trim() || !description.trim()) {
      toast.error('Please provide a name and description for the contract');
      return;
    }

    try {
      setIsLoading(true);

      const factory = new ethers.ContractFactory(
        RoyaltyDistribution.abi,
        RoyaltyDistribution.bytecode,
        signer
      );

      const wallets = stakeholders.map(s => s.wallet);
      const percentages = stakeholders.map(s => s.percentage);

      const contract = await factory.deploy(wallets, percentages);
      await contract.deployed();

      // Save contract details
      saveContract({
        address: contract.address,
        name,
        description,
        deployedAt: Date.now(),
      });

      toast.success('Contract deployed successfully!');
      refreshContracts();
      
      // Reset form
      setName('');
      setDescription('');
      setStakeholders([{ wallet: '', percentage: 0 }]);
    } catch (error) {
      console.error('Error deploying contract:', error);
      toast.error('Failed to deploy contract. Please ensure all inputs are valid.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleDeploy} className="space-y-6">
      <div>
        <label htmlFor="name" className="label">Contract Name</label>
        <input
          id="name"
          type="text"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Royalty Contract"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="description" className="label">Description</label>
        <textarea
          id="description"
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the purpose of this contract"
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Initial Stakeholders</h3>
          <button
            type="button"
            onClick={addStakeholder}
            className="btn-secondary text-sm"
            disabled={isLoading}
          >
            Add Stakeholder
          </button>
        </div>

        <div className="space-y-4">
          {stakeholders.map((stakeholder, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-grow">
                <input
                  type="text"
                  className="input"
                  placeholder="Wallet Address"
                  value={stakeholder.wallet}
                  onChange={(e) => updateStakeholder(index, 'wallet', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="w-24">
                <input
                  type="number"
                  className="input"
                  placeholder="%"
                  value={stakeholder.percentage || ''}
                  onChange={(e) => updateStakeholder(index, 'percentage', e.target.value)}
                  min="0"
                  max="100"
                  disabled={isLoading}
                />
              </div>
              {stakeholders.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStakeholder(index)}
                  className="btn-danger text-sm"
                  disabled={isLoading}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="mt-2 text-sm text-gray-600">
          Total: {stakeholders.reduce((sum, s) => sum + s.percentage, 0)}%
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
              Deploying...
            </div>
          ) : 'Deploy Contract'}
        </button>
      </div>
    </form>
  );
};

export default DeployContract;