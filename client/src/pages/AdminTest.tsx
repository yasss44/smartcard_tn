import { useState, useEffect } from 'react';

const AdminTest = () => {
  const [publicMessage, setPublicMessage] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [publicError, setPublicError] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const testPublicAPI = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/admin/test');

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
        }

        const data = await response.json();
        setPublicMessage(data.message);
      } catch (err: any) {
        console.error('Error testing public admin API:', err);
        setPublicError(err.message || 'Unknown error');
      }
    };

    const testAuthAPI = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAuthError('No authentication token found. Please log in first.');
          return;
        }

        const response = await fetch('http://localhost:5000/api/admin/auth-test', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
        }

        const data = await response.json();
        setAuthMessage(data.message);
        setUserData(data.user);
      } catch (err: any) {
        console.error('Error testing authenticated admin API:', err);
        setAuthError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    // Run both tests
    testPublicAPI();
    testAuthAPI();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Admin API Test</h1>

      {loading && <p>Loading...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Public API Test */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Public API Test
          </h2>

          {publicError && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-bold mb-2">Error</h3>
              <p>{publicError}</p>
            </div>
          )}

          {publicMessage && (
            <div className="bg-green-900/50 border border-green-500 text-green-200 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-2">Success</h3>
              <p>{publicMessage}</p>
            </div>
          )}
        </div>

        {/* Authenticated API Test */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Authenticated API Test
          </h2>

          {authError && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-bold mb-2">Error</h3>
              <p>{authError}</p>
            </div>
          )}

          {authMessage && (
            <div className="bg-green-900/50 border border-green-500 text-green-200 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-bold mb-2">Success</h3>
              <p>{authMessage}</p>
            </div>
          )}

          {userData && (
            <div className="bg-blue-900/50 border border-blue-500 text-blue-200 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-2">User Data</h3>
              <p><strong>ID:</strong> {userData.id}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Is Admin:</strong> {userData.is_admin ? 'Yes' : 'No'}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Debug Information</h2>
        <pre className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-60">
          {JSON.stringify({
            publicMessage,
            authMessage,
            publicError,
            authError,
            userData,
            loading
          }, null, 2)}
        </pre>
      </div>

      <div className="mt-8 flex gap-4">
        <a
          href="/admin"
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
        >
          Go to Admin Dashboard
        </a>
        <a
          href="/login"
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
};

export default AdminTest;
