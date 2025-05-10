import { useWeb3 } from '../../contexts/Web3Context';
// import { Contract } from '../../constants/contractConfig';

const ContractSelector = () => {
  const { deployedContracts, selectedContract, selectContract } = useWeb3();

  if (deployedContracts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No contracts deployed yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select Contract</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {deployedContracts.map((contract) => (
          <button
            key={contract.address}
            onClick={() => selectContract(contract)}
            className={`p-4 rounded-lg border transition-all ${
              selectedContract?.address === contract.address
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <h3 className="font-medium">{contract.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{contract.description}</p>
            <p className="text-xs text-gray-500 mt-2">
              {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContractSelector;