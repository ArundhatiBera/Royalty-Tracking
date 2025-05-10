import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import ConnectWallet from '../common/ConnectWallet';
import { BarChart3 } from 'lucide-react';

const Navbar = () => {
  const { isConnected, isOwner } = useWeb3();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary-600" />
            <Link to="/" className="text-xl font-bold text-gray-900">
              RoyaltyTracking
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className={`px-3 py-2 text-sm font-medium ${
                isActive('/') 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Home
            </Link>
            
            {isConnected && (
              <Link 
                to="/dashboard" 
                className={`px-3 py-2 text-sm font-medium ${
                  isActive('/dashboard') 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Dashboard
              </Link>
            )}
            
            {isConnected && isOwner && (
              <Link 
                to="/owner" 
                className={`px-3 py-2 text-sm font-medium ${
                  isActive('/owner') 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Owner Panel
              </Link>
            )}
          </div>
          
          <div className="flex items-center">
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;