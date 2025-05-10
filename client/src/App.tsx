import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import OwnerPanel from './pages/OwnerPanel';
import Layout from './components/layout/Layout';
import { Web3Provider } from './contexts/Web3Context';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Web3Provider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/owner" 
              element={
                <ProtectedRoute requireOwner>
                  <OwnerPanel />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
      </Router>
      <ToastContainer position="bottom-right" theme="colored" />
    </Web3Provider>
  );
}

export default App;