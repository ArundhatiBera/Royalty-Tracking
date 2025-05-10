import { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../contexts/Web3Context';
import { toast } from 'react-toastify';
import { Send, ArrowRight } from 'lucide-react';

interface Stakeholder {
  wallet: string;
  percentage: number;
}

interface SendRoyaltyFormProps {
  stakeholders: Stakeholder[];
}

interface PreviewItem {
  wallet: string;
  amount: string;
  percentage: number;
}

const SendRoyaltyForm = ({ stakeholders }: SendRoyaltyFormProps) => {
  const { contract, signer } = useWeb3();
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<PreviewItem[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setShowPreview(false);
  };

  const handlePreview = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      if (contract) {
        setIsLoading(true);
        const amountWei = ethers.utils.parseEther(amount);
        const result = await contract.previewDistribution(amountWei);
        
        const previewData: PreviewItem[] = [];
        for (let i = 0; i < result.wallets.length; i++) {
          const stakeholder = stakeholders.find(s => s.wallet === result.wallets[i]);
          previewData.push({
            wallet: result.wallets[i],
            amount: ethers.utils.formatEther(result.shares[i]),
            percentage: stakeholder?.percentage || 0,
          });
        }
        
        setPreview(previewData);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error previewing distribution:', error);
      toast.error('Failed to preview distribution');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPayment = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      if (contract && signer) {
        setIsLoading(true);
        const amountWei = ethers.utils.parseEther(amount);
        
        const tx = await signer.sendTransaction({
          to: contract.address,
          value: amountWei,
        });
        
        toast.info('Payment sent! Waiting for confirmation...');
        
        await tx.wait();
        
        toast.success('Payment successfully distributed!');
        setAmount('');
        setShowPreview(false);
      }
    } catch (error) {
      console.error('Error sending payment:', error);
      toast.error('Failed to send payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="amount" className="label">Amount (ETH)</label>
          <input
            id="amount"
            type="number"
            step="0.0001"
            min="0"
            className="input"
            placeholder="0.0"
            value={amount}
            onChange={handleAmountChange}
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the amount of ETH to distribute as royalty.
          </p>
        </div>
        
        <div className="md:col-span-1 flex items-end">
          {!showPreview ? (
            <button
              onClick={handlePreview}
              disabled={isLoading || !amount}
              className="btn-secondary w-full flex items-center justify-center gap-1"
            >
              {isLoading ? (
                <>Loading...</>
              ) : (
                <>
                  Preview <ArrowRight size={16} />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSendPayment}
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-1"
            >
              {isLoading ? (
                <>Processing...</>
              ) : (
                <>
                  Send Payment <Send size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Preview Distribution */}
      {showPreview && preview.length > 0 && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-3">Payment Preview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (ETH)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {item.wallet.slice(0, 6)}...{item.wallet.slice(-4)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {item.percentage}%
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Total: {amount} ETH
          </div>
        </div>
      )}
    </div>
  );
};

export default SendRoyaltyForm;