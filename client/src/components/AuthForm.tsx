import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/auth-form.css';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: any) => void;
  loading: boolean;
  error?: string;
}

const AuthForm = ({ type, onSubmit, loading, error }: AuthFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1 className="auth-title">
          {type === 'login' ? 'LOGIN' : 'REGISTER'}
        </h1>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'register' && (
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </div>
          )}

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          {type === 'register' && (
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </div>
          )}

          {type === 'login' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="auth-checkbox"
              />
              <label htmlFor="rememberMe" className="auth-checkbox-label">
                Remember me
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading
              ? type === 'login'
                ? 'Logging in...'
                : 'Creating Account...'
              : type === 'login'
              ? 'LOGIN'
              : 'REGISTER'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="auth-divider">
            <span>Or login with</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="social-button">Facebook</button>
            <button type="button" className="social-button">Google</button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white">
          {type === 'login' ? (
            <>
              Not a member?{' '}
              <Link to="/register" className="auth-link">
                Sign up now
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Log In
              </Link>
            </>
          )}
        </p>

        <div className="nfc-card" />
      </div>
    </div>
  );
};

export default AuthForm;