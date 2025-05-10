import { useState } from 'react';
import { Search } from 'lucide-react';

interface Stakeholder {
  wallet: string;
  percentage: number;
}

interface StakeholderTableProps {
  stakeholders: Stakeholder[];
}

const StakeholderTable = ({ stakeholders }: StakeholderTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredStakeholders = stakeholders.filter(stakeholder => 
    stakeholder.wallet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="input pl-10"
          placeholder="Search by address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto shadow-sm rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wallet Address
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Percentage
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStakeholders.length > 0 ? (
              filteredStakeholders.map((stakeholder, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {stakeholder.wallet.slice(0, 6)}...{stakeholder.wallet.slice(-4)}
                    </div>
                    <div className="text-xs text-gray-500 hidden md:block">
                      {stakeholder.wallet}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                      {stakeholder.percentage}%
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                  {stakeholders.length === 0 ? 'No stakeholders found' : 'No results match your search'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="text-sm text-gray-500">
        Total Stakeholders: {stakeholders.length}
      </div>
    </div>
  );
};

export default StakeholderTable;