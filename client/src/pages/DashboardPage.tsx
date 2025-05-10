import { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import StakeholderTable from '../components/dashboard/StakeholderTable';
import SendRoyaltyForm from '../components/dashboard/SendRoyaltyForm';
import ContractSelector from '../components/dashboard/ContractSelector';
import { Loader2 } from 'lucide-react';

const DashboardPage = () => {
  const { contract, account, isOwner, selectedContract } = useWeb3();
  const [stakeholders, setStakeholders] = useState<Array<{ wallet: string; percentage: number }>>([]);
  const [contractBalance, setContractBalance] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(true);
  const [contractPaused, setContractPaused] = useState<boolean>(false);

  const COLORS = [
    '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (contract) {
          setLoading(true);
          
          // Get stakeholders
          const stakeholdersData = await contract.getStakeholders();
          const formattedStakeholders = stakeholdersData.map((s: any) => ({
            wallet: s.wallet,
            percentage: Number(s.percentage),
          }));
          
          setStakeholders(formattedStakeholders);
          
          // Get contract balance
          const balance = await contract.provider.getBalance(contract.address);
          setContractBalance(ethers.utils.formatEther(balance));
          
          // Check if contract is paused
          const paused = await contract.paused();
          setContractPaused(paused);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (contract) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [contract]);

  // Prepare data for pie chart
  const chartData = stakeholders.map((stakeholder) => ({
    name: `${stakeholder.wallet.slice(0, 6)}...${stakeholder.wallet.slice(-4)}`,
    value: stakeholder.percentage,
    address: stakeholder.wallet,
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (!selectedContract) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Select Contract</h2>
          <ContractSelector />
          {isOwner && (
            <div className="mt-8 pt-6 border-t">
              <p className="text-gray-600 mb-4">Or deploy a new contract to get started:</p>
              <Link to="/owner" className="btn-primary">
                Deploy New Contract
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <ContractSelector />
      </div>
      
      {/* Contract Status */}
      <div className="card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">{selectedContract.name}</h2>
            <p className="text-gray-500 text-sm mb-2">{selectedContract.description}</p>
            <p className="text-gray-600 mb-2">
              Current balance: <span className="font-medium">{contractBalance} ETH</span>
            </p>
            {contractPaused && (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm font-medium inline-block">
                Contract Paused
              </div>
            )}
          </div>
          {isOwner && (
            <Link to="/owner" className="btn-primary">
              Owner Panel
            </Link>
          )}
        </div>
      </div>
      
      {/* Distribution Visualization */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Royalty Distribution</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stakeholder Table */}
          <div>
            <h3 className="text-lg font-medium mb-3">Stakeholders</h3>
            <StakeholderTable stakeholders={stakeholders} />
          </div>
          
          {/* Pie Chart */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium mb-3">Distribution Breakdown</h3>
            {stakeholders.length > 0 ? (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-80 w-full bg-gray-50 rounded-lg">
                <p className="text-gray-500">No stakeholders found</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Send Royalty Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Send Royalty Payment</h2>
        <SendRoyaltyForm stakeholders={stakeholders} />
      </div>
    </div>
  );
};

export default DashboardPage;