import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CyberpunkLogin from '../components/CyberpunkLogin';

const CyberpunkLoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-900/80 backdrop-blur-sm border border-red-500 text-red-100 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}
      <CyberpunkLogin onLogin={handleLogin} loading={loading} />
    </>
  );
};

export default CyberpunkLoginPage;
