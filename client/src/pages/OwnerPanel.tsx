import { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import AddStakeholderForm from '../components/owner/AddStakeholderForm';
import UpdateStakeholderForm from '../components/owner/UpdateStakeholderForm';
import RemoveStakeholderForm from '../components/owner/RemoveStakeholderForm';
import TransferOwnershipForm from '../components/owner/TransferOwnershipForm';
import WithdrawFundsForm from '../components/owner/WithdrawFundsForm';
import DeployContract from '../components/owner/DeployContract';
import ContractSelector from '../components/dashboard/ContractSelector';
import { Loader2 } from 'lucide-react';

const OwnerPanel = () => {
  const { contract, account, selectedContract } = useWeb3();
  const [contractBalance, setContractBalance] = useState<string>('0');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stakeholders, setStakeholders] = useState<Array<{ wallet: string; percentage: number }>>([]);

  const fetchContractData = async () => {
    try {
      if (contract) {
        setIsLoading(true);
        
        // Get contract balance
        const balance = await contract.provider.getBalance(contract.address);
        setContractBalance(ethers.utils.formatEther(balance));
        
        // Check if contract is paused
        const paused = await contract.paused();
        setIsPaused(paused);
        
        // Get stakeholders
        const stakeholdersData = await contract.getStakeholders();
        const formattedStakeholders = stakeholdersData.map((s: any) => ({
          wallet: s.wallet,
          percentage: Number(s.percentage),
        }));
        
        setStakeholders(formattedStakeholders);
      }
    } catch (error) {
      console.error('Error fetching contract data:', error);
      toast.error('Failed to load contract data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchContractData();
    } else {
      setIsLoading(false);
    }
  }, [contract]);

  const handlePauseUnpause = async () => {
    try {
      if (contract) {
        setIsLoading(true);
        
        if (isPaused) {
          const tx = await contract.unpause();
          await tx.wait();
          toast.success('Contract has been unpaused');
        } else {
          const tx = await contract.pause();
          await tx.wait();
          toast.success('Contract has been paused');
        }
        
        await fetchContractData();
      }
    } catch (error) {
      console.error('Error toggling pause state:', error);
      toast.error('Failed to update contract state');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSweepDust = async () => {
    try {
      if (contract) {
        setIsLoading(true);
        
        const tx = await contract.sweepDust();
        await tx.wait();
        
        toast.success('Dust swept successfully');
        await fetchContractData();
      }
    } catch (error) {
      console.error('Error sweeping dust:', error);
      toast.error('Failed to sweep dust');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !selectedContract) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading contract data...</p>
      </div>
    );
  }

  if (!selectedContract) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Owner Panel</h1>
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Deploy New Contract</h2>
          <DeployContract />
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Manage Existing Contract</h2>
          <ContractSelector />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold text-gray-900">Owner Panel</h1>
        <ContractSelector />
      </div>
      
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{selectedContract.name}</h2>
            <p className="text-gray-500 text-sm mb-4">{selectedContract.description}</p>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Balance:</span> {contractBalance} ETH
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Status:</span> {isPaused ? 'Paused' : 'Active'}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Stakeholders:</span> {stakeholders.length}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Owner:</span> {account}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3 justify-end">
            <button 
              onClick={handlePauseUnpause} 
              className={`btn ${isPaused ? 'btn-accent' : 'btn-danger'} w-full`}
              disabled={isLoading}
            >
              {isPaused ? 'Unpause Contract' : 'Pause Contract'}
            </button>
            
            <button 
              onClick={handleSweepDust} 
              className="btn-secondary w-full"
              disabled={isLoading}
            >
              Sweep Dust
            </button>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Manage Royalty Distribution</h2>
        
        <Tabs defaultValue="add">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
            <TabsTrigger value="add">Add Stakeholder</TabsTrigger>
            <TabsTrigger value="update">Update Stakeholder</TabsTrigger>
            <TabsTrigger value="remove">Remove Stakeholder</TabsTrigger>
            <TabsTrigger value="transfer">Transfer Ownership</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw Funds</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add">
            <AddStakeholderForm 
              stakeholders={stakeholders} 
              onSuccess={fetchContractData} 
            />
          </TabsContent>
          
          <TabsContent value="update">
            <UpdateStakeholderForm 
              stakeholders={stakeholders} 
              onSuccess={fetchContractData} 
            />
          </TabsContent>
          
          <TabsContent value="remove">
            <RemoveStakeholderForm 
              stakeholders={stakeholders} 
              onSuccess={fetchContractData} 
            />
          </TabsContent>
          
          <TabsContent value="transfer">
            <TransferOwnershipForm onSuccess={fetchContractData} />
          </TabsContent>
          
          <TabsContent value="withdraw">
            <WithdrawFundsForm 
              contractBalance={contractBalance} 
              onSuccess={fetchContractData} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OwnerPanel;