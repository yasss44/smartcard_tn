import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { FaUsers, FaCreditCard, FaChartLine, FaSpinner, FaCheck, FaTimes, FaShippingFast, FaExclamationTriangle, FaSearch, FaEye } from 'react-icons/fa';
import axios from 'axios';

// Define types
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface Order {
  id: number;
  UserId: number;
  CardId: number;
  quantity: number;
  shipping_address: string;
  phone_number: string;
  total_price: number;
  payment_method: string;
  status: string;
  plan_type: string;
  createdAt: string;
  user_name?: string;
  card_title?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'analytics'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusUpdating, setOrderStatusUpdating] = useState<number | null>(null);

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    planBreakdown: {
      standard: 0,
      logo: 0,
      custom: 0
    }
  });

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!authLoading && (!isAuthenticated || !user?.is_admin)) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate, user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);

        // Fetch users
        console.log('Fetching users...');
        try {
          const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          if (!usersResponse.ok) {
            const text = await usersResponse.text();
            console.error('Users API error response text:', text);
            throw new Error(`HTTP error! status: ${usersResponse.status}, response: ${text.substring(0, 100)}...`);
          }

          try {
            const userData = await usersResponse.json();
            console.log('Users API response:', userData);

            setUsers(Array.isArray(userData) ? userData : []);
          } catch (jsonError) {
            console.error('Error parsing users JSON:', jsonError);
            const text = await usersResponse.text();
            console.error('Raw response:', text.substring(0, 200));
            throw new Error('Failed to parse users JSON response');
          }
        } catch (userError) {
          console.error('Error fetching users:', userError);
          setError('Failed to fetch users: ' + (userError.message || 'Unknown error'));
        }

        // Fetch orders
        console.log('Fetching orders...');
        try {
          const ordersResponse = await fetch('http://localhost:5000/api/admin/orders', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          if (!ordersResponse.ok) {
            const text = await ordersResponse.text();
            console.error('Orders API error response text:', text);
            throw new Error(`HTTP error! status: ${ordersResponse.status}, response: ${text.substring(0, 100)}...`);
          }

          try {
            const orderData = await ordersResponse.json();
            console.log('Orders API response:', orderData);

            setOrders(Array.isArray(orderData) ? orderData : []);
          } catch (jsonError) {
            console.error('Error parsing orders JSON:', jsonError);
            const text = await ordersResponse.text();
            console.error('Raw response:', text.substring(0, 200));
            throw new Error('Failed to parse orders JSON response');
          }
        } catch (orderError) {
          console.error('Error fetching orders:', orderError);
          setError('Failed to fetch orders: ' + (orderError.message || 'Unknown error'));
        }

        // Calculate analytics
        try {
          // Get the latest data from state
          const usersData = Array.isArray(users) ? users : [];
          const ordersData = Array.isArray(orders) ? orders : [];

          // Use the data from the API responses instead of state
          // This ensures we're using the most up-to-date data
          const latestUsersData = Array.isArray(userData) ? userData : [];
          const latestOrdersData = Array.isArray(orderData) ? orderData : [];

          calculateAnalytics(latestUsersData, latestOrdersData);
        } catch (analyticsError) {
          console.error('Error calculating analytics:', analyticsError);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.is_admin) {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const calculateAnalytics = (users: any, orders: any) => {
    // Ensure users and orders are arrays
    const usersArray = Array.isArray(users) ? users : [];
    const ordersArray = Array.isArray(orders) ? orders : [];

    // Calculate total users (excluding admin users)
    const totalUsers = usersArray.filter(user => !user.is_admin).length;

    // Calculate total orders
    const totalOrders = ordersArray.length;

    // Calculate total revenue with fixed prices
    const totalRevenue = ordersArray.reduce((sum, order) => {
      let orderPrice = 0;

      // Calculate base price based on plan type
      if (order.plan_type === 'standard') {
        orderPrice = 35 * order.quantity;
      } else if (order.plan_type === 'logo') {
        orderPrice = 45 * order.quantity;
      } else if (order.plan_type === 'custom') {
        orderPrice = 55 * order.quantity;
      } else {
        // Fallback to the stored price if plan type is unknown
        orderPrice = parseFloat(order.total_price.toString());
      }

      // Add shipping cost (7 DT) for standard and logo plans
      if (order.plan_type === 'standard' || order.plan_type === 'logo') {
        orderPrice += 7;
      }

      return sum + orderPrice;
    }, 0);

    // Calculate plan breakdown
    const planBreakdown = {
      standard: ordersArray.filter(order => order.plan_type === 'standard').length,
      logo: ordersArray.filter(order => order.plan_type === 'logo').length,
      custom: ordersArray.filter(order => order.plan_type === 'custom').length
    };

    setAnalytics({
      totalUsers,
      totalOrders,
      totalRevenue,
      planBreakdown
    });
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      setOrderStatusUpdating(orderId);

      // Use the regular endpoint
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status } : order
      ));

    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.message || 'Failed to update order status');
    } finally {
      setOrderStatusUpdating(null);
    }
  };

  const handleBanUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setUsers(users.filter(user => user.id !== userId));

    } catch (err: any) {
      console.error('Error banning user:', err);
      setError(err.message || 'Failed to ban user');
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const filteredOrders = Array.isArray(orders) ? orders.filter(order =>
    order.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.card_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.plan_type.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-blue-500 text-4xl mb-3">
            <FaSpinner />
          </div>
          <p className="text-gray-300 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Admin Dashboard
          </h1>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg mr-4">
                <FaUsers className="text-blue-400 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-400 text-sm">Total Users</h3>
                <p className="text-2xl font-bold text-white">{analytics.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg mr-4">
                <FaCreditCard className="text-purple-400 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-400 text-sm">Total Orders</h3>
                <p className="text-2xl font-bold text-white">{analytics.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg mr-4">
                <FaChartLine className="text-green-400 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-400 text-sm">Total Revenue</h3>
                <p className="text-2xl font-bold text-white">{analytics.totalRevenue.toFixed(2)} DT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 px-6 font-medium text-sm rounded-t-lg transition-all duration-200 ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-cyan-300'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-3 px-6 font-medium text-sm rounded-t-lg transition-all duration-200 ml-4 ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-purple-300'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 px-6 font-medium text-sm rounded-t-lg transition-all duration-200 ml-4 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-green-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              className="bg-gray-800/50 border border-gray-700 text-white rounded-lg block w-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-5 py-4 rounded-lg mb-8 flex items-center shadow-lg">
            <div className="mr-4 bg-red-500 rounded-full p-2 flex-shrink-0">
              <FaExclamationTriangle className="text-white text-lg" />
            </div>
            <span className="font-medium">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-300 hover:text-white"
              title="Dismiss error"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/30 divide-y divide-gray-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <button
                            onClick={() => handleBanUser(user.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Ban User
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Card
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/30 divide-y divide-gray-700">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-400">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/admin/orders/${order.id}`} className="text-sm font-medium text-white hover:text-cyan-400 transition-colors">
                            #{order.id}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{order.user_name || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{order.card_title || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300 capitalize">{order.plan_type || 'standard'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{order.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{parseFloat(order.total_price.toString()).toFixed(2)} DT</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${order.status === 'pending' ? 'bg-yellow-800/50 text-yellow-400' : ''}
                            ${order.status === 'shipped' ? 'bg-blue-800/50 text-blue-400' : ''}
                            ${order.status === 'delivered' ? 'bg-green-800/50 text-green-400' : ''}
                            ${order.status === 'cancelled' ? 'bg-red-800/50 text-red-400' : ''}
                          `}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {orderStatusUpdating === order.id ? (
                            <FaSpinner className="animate-spin text-cyan-400" />
                          ) : (
                            <div className="flex space-x-3">
                              <Link
                                to={`/admin/orders/${order.id}`}
                                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                                title="View Order Details"
                              >
                                <FaEye />
                              </Link>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="Mark as Shipped"
                              >
                                <FaShippingFast />
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                className="text-green-400 hover:text-green-300 transition-colors"
                                title="Mark as Delivered (allows customer to create card)"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Cancel Order"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Plan Breakdown
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Standard</span>
                    <span className="text-gray-300">{analytics.planBreakdown.standard} orders</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-cyan-500 h-2.5 rounded-full"
                      style={{ width: `${analytics.totalOrders ? (analytics.planBreakdown.standard / analytics.totalOrders * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Logo Customization</span>
                    <span className="text-gray-300">{analytics.planBreakdown.logo} orders</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-purple-500 h-2.5 rounded-full"
                      style={{ width: `${analytics.totalOrders ? (analytics.planBreakdown.logo / analytics.totalOrders * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Full Customization</span>
                    <span className="text-gray-300">{analytics.planBreakdown.custom} orders</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-pink-500 h-2.5 rounded-full"
                      style={{ width: `${analytics.totalOrders ? (analytics.planBreakdown.custom / analytics.totalOrders * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Export Data
              </h3>
              <p className="text-gray-400 mb-4">
                Download your data for further analysis or reporting.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // In a real app, this would trigger a CSV download
                    alert('This would download a CSV of all users');
                  }}
                  className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaUsers className="mr-2" />
                  Export Users
                </button>

                <button
                  onClick={() => {
                    // In a real app, this would trigger a CSV download
                    alert('This would download a CSV of all orders');
                  }}
                  className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaCreditCard className="mr-2" />
                  Export Orders
                </button>

                <button
                  onClick={() => {
                    // In a real app, this would trigger a CSV download
                    alert('This would download a CSV of analytics data');
                  }}
                  className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaChartLine className="mr-2" />
                  Export Analytics
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
