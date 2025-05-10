import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { BarChart3, TrendingUp, Shield, Coins } from 'lucide-react';

const HomePage = () => {
  const { isConnected, connectWallet } = useWeb3();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (isConnected) {
      navigate('/dashboard');
    } else {
      connectWallet();
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Track and Distribute Royalties Transparently
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A decentralized solution for artists, creators, and businesses to manage royalty payments
            with transparency and efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleCTA} 
              className="btn-primary text-lg px-8 py-3 animate-pulse"
            >
              {isConnected ? 'Launch Dashboard' : 'Connect Wallet'}
            </button>
            <a
              href="#features"
              className="btn-secondary text-lg px-8 py-3"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card transition-all duration-300 hover:shadow-lg">
              <BarChart3 className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Transparent Distribution</h3>
              <p className="text-gray-600">
                All royalty distributions are recorded on the blockchain, providing complete
                transparency for all stakeholders.
              </p>
            </div>
            
            <div className="card transition-all duration-300 hover:shadow-lg">
              <TrendingUp className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-gray-600">
                Monitor royalty payments in real-time with detailed analytics and distribution history.
              </p>
            </div>
            
            <div className="card transition-all duration-300 hover:shadow-lg">
              <Shield className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Management</h3>
              <p className="text-gray-600">
                Easily manage stakeholders, update percentages, and maintain full control over royalty distribution.
              </p>
            </div>
            
            <div className="card transition-all duration-300 hover:shadow-lg">
              <Coins className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Automatic Payments</h3>
              <p className="text-gray-600">
                Incoming payments are automatically distributed to stakeholders based on their percentage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold">
                1
              </div>
              <div className="flex-grow md:ml-4">
                <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600">
                  Connect your Ethereum wallet to interact with the royalty distribution contract.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold">
                2
              </div>
              <div className="flex-grow md:ml-4">
                <h3 className="text-xl font-semibold mb-2">Set Up Stakeholders</h3>
                <p className="text-gray-600">
                  Add stakeholders with their wallet addresses and percentage shares. All percentages must add up to 100%.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold">
                3
              </div>
              <div className="flex-grow md:ml-4">
                <h3 className="text-xl font-semibold mb-2">Receive Payments</h3>
                <p className="text-gray-600">
                  Any funds sent to the contract are automatically distributed to stakeholders based on their percentages.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold">
                4
              </div>
              <div className="flex-grow md:ml-4">
                <h3 className="text-xl font-semibold mb-2">Track & Manage</h3>
                <p className="text-gray-600">
                  Use the dashboard to track payments, update stakeholders, and manage your royalty distributions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to start managing royalties?</h2>
          <p className="text-xl mb-8 opacity-90">
            Connect your wallet and experience transparent royalty distribution.
          </p>
          <button 
            onClick={handleCTA} 
            className="bg-white text-primary-700 hover:bg-gray-100 font-medium py-3 px-8 rounded-md transition-colors"
          >
            {isConnected ? 'Go to Dashboard' : 'Connect Wallet'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;