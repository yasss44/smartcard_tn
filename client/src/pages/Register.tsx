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

      await register(formData.name, formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
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
