// Contract configuration
export const ownerAddress = import.meta.env.VITE_PUBLIC_OWNER_CONTRACT_ADDRESS;

export interface Contract {
  address: string;
  name: string;
  description: string;
  deployedAt: number;
}

// Store deployed contracts in local storage
export const saveContract = (contract: Contract) => {
  const contracts = getDeployedContracts();
  contracts.push(contract);
  localStorage.setItem('deployedContracts', JSON.stringify(contracts));
};

export const getDeployedContracts = (): Contract[] => {
  const contracts = localStorage.getItem('deployedContracts');
  return contracts ? JSON.parse(contracts) : [];
};

export const removeContract = (address: string) => {
  const contracts = getDeployedContracts().filter(c => c.address !== address);
  localStorage.setItem('deployedContracts', JSON.stringify(contracts));
};