import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    try {
      setError('');
      setLoading(true);
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      type="login"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    />
  );
};

export default Login;
