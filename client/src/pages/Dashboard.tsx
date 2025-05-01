import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { cardAPI, orderAPI } from '../services/api';
import { FaEdit, FaTrash, FaEye, FaShoppingCart, FaSpinner } from 'react-icons/fa';

interface Card {
  id: number;
  title: string;
  unique_url: string;
  background: string;
  created_at: string;
}

interface Order {
  id: number;
  card_id: number | null;
  card_title?: string;
  quantity: number;
  total_price: number;
  status: string;
  plan_type: string;
  card_created: boolean;
  created_at: string;
}

const Dashboard = () => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cards, setCards] = useState<Card[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('cards');

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch cards
        const cardsData = await cardAPI.getUserCards();
        setCards(cardsData);

        // Fetch orders
        const ordersData = await orderAPI.getUserOrders();
        setOrders(ordersData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleDeleteCard = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        await cardAPI.deleteCard(id.toString());
        setCards(cards.filter(card => card.id !== id));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete card');
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-cyan-400 text-4xl">
            <FaSpinner />
          </div>
          <p className="mt-2 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Dashboard</h1>
          <Link
            to="/plans"
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 px-4 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Order New Card
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4 shadow-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('cards')}
              className={`py-3 px-6 font-medium text-sm rounded-t-lg transition-all duration-200 ${
                activeTab === 'cards'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-cyan-300'
              }`}
            >
              My Cards
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-3 px-6 font-medium text-sm rounded-t-lg transition-all duration-200 ml-4 ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-purple-300'
              }`}
            >
              My Orders
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-8 bg-gray-800/50 rounded-lg shadow-lg border border-gray-700/50">
            <div className="animate-spin text-cyan-400 text-4xl inline-block mb-3">
              <FaSpinner />
            </div>
            <p className="mt-2 text-gray-300">Loading your data...</p>
          </div>
        ) : (
          <>
            {/* Cards Tab */}
            {activeTab === 'cards' && (
              <div>
                {cards.length === 0 ? (
                  <div className="text-center py-12 bg-gray-800/50 rounded-lg shadow-lg border border-gray-700/50 backdrop-blur-sm">
                    <div className="mb-6 inline-block p-4 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="text-gray-300 mb-6 text-lg">You haven't created any cards yet.</p>

                    {/* Different messages based on order status */}
                    {orders.some(order => order.status === 'delivered' && !order.card_created) ? (
                      <p className="text-gray-400 mb-6">
                        Your order has been delivered! You can now create your digital card.
                      </p>
                    ) : orders.some(order => order.status === 'shipped') ? (
                      <p className="text-gray-400 mb-6">
                        Your order has been shipped! Once delivered, you'll be able to create your first card.
                      </p>
                    ) : orders.some(order => order.status === 'pending') ? (
                      <p className="text-gray-400 mb-6">
                        Your order is being processed. Once approved and delivered, you'll be able to create your card.
                      </p>
                    ) : (
                      <p className="text-gray-400 mb-6">
                        First, order a card from our plans page. After your order is approved, you'll be able to create your card.
                      </p>
                    )}

                    {orders.some(order => order.status === 'delivered' && !order.card_created) ? (
                      <Link
                        to={`/editor?order=${orders.find(order => order.status === 'delivered' && !order.card_created)?.id}&plan=${orders.find(order => order.status === 'delivered' && !order.card_created)?.plan_type}`}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                      >
                        <FaEdit className="h-5 w-5" />
                        Create Your First Card
                      </Link>
                    ) : (
                      <Link
                        to="/plans"
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Browse Card Plans
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card) => (
                      <div key={card.id} className="bg-gray-800/50 rounded-lg shadow-lg overflow-hidden border border-gray-700/50 backdrop-blur-sm hover:shadow-cyan-500/10 transition-all duration-300">
                        <div
                          className="h-40 bg-cover bg-center"
                          style={{
                            backgroundImage: card.background
                              ? `url(${card.background})`
                              : 'linear-gradient(to right, #0ea5e9, #2563eb)',
                          }}
                        />
                        <div className="p-5">
                          <h3 className="text-lg font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{card.title}</h3>
                          <p className="text-sm text-gray-400 mb-4">
                            Created on {new Date(card.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex justify-between">
                            <div className="flex space-x-2">
                              <Link
                                to={`/editor/${card.id}`}
                                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-full transition-colors"
                                title="Edit"
                              >
                                <FaEdit />
                              </Link>
                              <Link
                                to={`/preview/${card.id}`}
                                className="p-2 text-green-400 hover:bg-green-500/20 rounded-full transition-colors"
                                title="Preview"
                              >
                                <FaEye />
                              </Link>
                              <button
                                onClick={() => handleDeleteCard(card.id)}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-full transition-colors"
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                            <Link
                              to={`/checkout/${card.id}`}
                              className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-full transition-colors"
                              title="Order Physical Cards"
                            >
                              <FaShoppingCart />
                            </Link>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-sm text-gray-400">Share URL:</p>
                            <a
                              href={`/card/${card.unique_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline break-all transition-colors"
                            >
                              {window.location.origin}/card/{card.unique_url}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                {orders.length === 0 ? (
                  <div className="text-center py-12 bg-gray-800/50 rounded-lg shadow-lg border border-gray-700/50 backdrop-blur-sm">
                    <div className="mb-6 inline-block p-4 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <p className="text-gray-300 mb-6 text-lg">You haven't placed any orders yet.</p>
                    <Link
                      to="/plans"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-md hover:from-purple-600 hover:to-pink-600 transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-purple-500/20"
                    >
                      <FaShoppingCart className="h-5 w-5" />
                      Order Your First Card
                    </Link>
                  </div>
                ) : (
                  <div className="bg-gray-800/50 rounded-lg shadow-lg overflow-hidden border border-gray-700/50 backdrop-blur-sm">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Plan Type
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-700/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              #{order.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 capitalize">
                              {order.plan_type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {order.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              ${order.total_price}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.status === 'delivered'
                                    ? 'bg-green-900/50 text-green-400 border border-green-500/50'
                                    : order.status === 'shipped'
                                    ? 'bg-blue-900/50 text-blue-400 border border-blue-500/50'
                                    : order.status === 'cancelled'
                                    ? 'bg-red-900/50 text-red-400 border border-red-500/50'
                                    : 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/50'
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {order.status === 'delivered' && !order.card_created && (
                                <Link
                                  to={`/editor?order=${order.id}&plan=${order.plan_type}`}
                                  className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 inline-flex items-center gap-1"
                                >
                                  <FaEdit className="text-xs" />
                                  Create Card
                                </Link>
                              )}
                              {order.card_created && order.card_id && (
                                <Link
                                  to={`/editor/${order.card_id}`}
                                  className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-md hover:from-green-600 hover:to-emerald-600 transition-all duration-200 inline-flex items-center gap-1"
                                >
                                  <FaEye className="text-xs" />
                                  View Card
                                </Link>
                              )}
                              {order.status === 'shipped' && (
                                <span className="text-blue-400 text-xs">
                                  Shipped - awaiting delivery
                                </span>
                              )}
                              {order.status === 'pending' && (
                                <span className="text-yellow-400 text-xs">
                                  Processing your order
                                </span>
                              )}
                              {order.status === 'cancelled' && (
                                <span className="text-red-400 text-xs">
                                  Order cancelled
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
