import { Navigate } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import ConnectWallet from './ConnectWallet';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOwner?: boolean;
}

const ProtectedRoute = ({ children, requireOwner = false }: ProtectedRouteProps) => {
  const { isConnected, isOwner } = useWeb3();

  if (!isConnected) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Connect Your Wallet</h2>
        <p className="mb-6 text-gray-600 max-w-md text-center">
          Please connect your wallet to access this page.
        </p>
        <ConnectWallet />
      </div>
    );
  }

  if (requireOwner && !isOwner) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;