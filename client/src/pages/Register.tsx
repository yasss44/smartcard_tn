import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      console.log('Register component: Submitting registration form');

      await register(formData.name, formData.email, formData.password);
      console.log('Register component: Registration successful, navigating to dashboard');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Register component: Registration error', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        setError(err.response.data?.message || 'Failed to register');
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server. Please try again.');
      } else {
        console.error('Error message:', err.message);
        setError(err.message || 'Failed to register');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      type="register"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    />
  );
};

export default Register;
