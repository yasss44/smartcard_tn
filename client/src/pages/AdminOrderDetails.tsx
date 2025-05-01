import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';
import {
  FaArrowLeft,
  FaSpinner,
  FaPrint,
  FaDownload,
  FaExclamationTriangle,
  FaCheck,
  FaShippingFast,
  FaTimes,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCreditCard,
  FaBox,
  FaTag,
  FaImage,
  FaPalette,
  FaFileDownload
} from 'react-icons/fa';

interface OrderDetails {
  id: number;
  UserId: number;
  CardId: number | null;
  quantity: number;
  shipping_address: string;
  phone_number: string;
  total_price: number;
  payment_method: string;
  status: string;
  plan_type: string;
  card_created: boolean;
  custom_url_name: string | null;
  shipping_cost: number;
  has_logo_file: boolean;
  has_design_file: boolean;
  createdAt: string;
  updatedAt: string;
  user_name: string;
  card_title: string;
}

const AdminOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useContext(AuthContext);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderStatusUpdating, setOrderStatusUpdating] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user && !user.is_admin) {
      navigate('/dashboard');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/admin/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        setOrder(response.data);
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        setError(err.response?.data?.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      fetchOrderDetails();
    }
  }, [id, isAuthenticated, authLoading, user, navigate]);

  const handleUpdateOrderStatus = async (status: string) => {
    try {
      setOrderStatusUpdating(true);

      const response = await fetch(`http://localhost:5000/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder);

    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.message || 'Failed to update order status');
    } finally {
      setOrderStatusUpdating(false);
    }
  };

  const handlePrint = () => {
    // Save current scroll position
    const scrollPos = window.scrollY;

    // Add a small delay to ensure styles are applied
    setTimeout(() => {
      window.print();

      // Restore scroll position after print dialog closes
      setTimeout(() => {
        window.scrollTo(0, scrollPos);
      }, 100);
    }, 100);
  };

  const handleDownloadFile = async (fileType: 'logo' | 'design') => {
    try {
      if (!order) return;

      setError('');

      const response = await axios({
        url: `http://localhost:5000/api/admin/orders/${order.id}/files/${fileType}`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Create a blob URL for the file
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and click it to download the file
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `order-${order.id}-${fileType}${getFileExtension(response.headers['content-type'])}`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(`Error downloading ${fileType} file:`, err);
      setError(`Failed to download ${fileType} file. ${err.response?.data?.message || err.message}`);
    }
  };

  // Helper function to get file extension from MIME type
  const getFileExtension = (contentType: string) => {
    switch (contentType) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/gif':
        return '.gif';
      case 'application/pdf':
        return '.pdf';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-800/50 text-yellow-400 border-yellow-500/50';
      case 'shipped':
        return 'bg-blue-800/50 text-blue-400 border-blue-500/50';
      case 'delivered':
        return 'bg-green-800/50 text-green-400 border-green-500/50';
      case 'cancelled':
        return 'bg-red-800/50 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-800/50 text-gray-400 border-gray-500/50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin')}
              className="mr-4 bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-full transition-colors"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              Order #{id} Details
            </h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200"
            >
              <FaPrint />
              <span>Print Invoice</span>
            </button>
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

        {order ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Information */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg mb-6">
                <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Order Information
                </h2>

                {/* File Downloads Section - Only show if files are available */}
                {(order.has_logo_file || order.has_design_file) && (
                  <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                    <h3 className="text-lg font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                      Customer Files
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {order.has_logo_file && (
                        <button
                          onClick={() => handleDownloadFile('logo')}
                          className="px-4 py-2 bg-indigo-800/70 text-indigo-300 hover:bg-indigo-700 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <FaImage className="text-indigo-400" />
                          <span>Download Logo</span>
                          <FaFileDownload className="ml-1" />
                        </button>
                      )}

                      {order.has_design_file && (
                        <button
                          onClick={() => handleDownloadFile('design')}
                          className="px-4 py-2 bg-pink-800/70 text-pink-300 hover:bg-pink-700 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <FaPalette className="text-pink-400" />
                          <span>Download Design</span>
                          <FaFileDownload className="ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-start mb-4">
                      <div className="bg-blue-500/20 p-2 rounded-lg mr-3 mt-1">
                        <FaTag className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Order ID</p>
                        <p className="text-white font-medium">#{order.id}</p>
                      </div>
                    </div>

                    <div className="flex items-start mb-4">
                      <div className="bg-purple-500/20 p-2 rounded-lg mr-3 mt-1">
                        <FaCalendarAlt className="text-purple-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Order Date</p>
                        <p className="text-white font-medium">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-start mb-4">
                      <div className="bg-green-500/20 p-2 rounded-lg mr-3 mt-1">
                        <FaCreditCard className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Payment Method</p>
                        <p className="text-white font-medium capitalize">{order.payment_method.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start mb-4">
                      <div className="bg-cyan-500/20 p-2 rounded-lg mr-3 mt-1">
                        <FaBox className="text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Plan Type</p>
                        <p className="text-white font-medium capitalize">{order.plan_type}</p>
                      </div>
                    </div>

                    <div className="flex items-start mb-4">
                      <div className="bg-pink-500/20 p-2 rounded-lg mr-3 mt-1">
                        <FaBox className="text-pink-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Quantity</p>
                        <p className="text-white font-medium">{order.quantity} cards</p>
                      </div>
                    </div>

                    <div className="flex items-start mb-4">
                      <div className="bg-yellow-500/20 p-2 rounded-lg mr-3 mt-1">
                        <FaCheck className="text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Card Created</p>
                        <p className="text-white font-medium">{order.card_created ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-start mb-4">
                    <div className="bg-indigo-500/20 p-2 rounded-lg mr-3 mt-1">
                      <FaUser className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Customer</p>
                      <p className="text-white font-medium">{order.user_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start mb-4">
                    <div className="bg-red-500/20 p-2 rounded-lg mr-3 mt-1">
                      <FaPhone className="text-red-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Phone Number</p>
                      <p className="text-white font-medium">{order.phone_number}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-orange-500/20 p-2 rounded-lg mr-3 mt-1">
                      <FaMapMarkerAlt className="text-orange-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Shipping Address</p>
                      <p className="text-white font-medium whitespace-pre-line">{order.shipping_address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  Order Status
                </h2>

                <div className="flex items-center mb-6">
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-3 text-gray-300">Update Status</h3>

                <div className="flex flex-wrap gap-3">
                  {orderStatusUpdating ? (
                    <div className="flex items-center text-cyan-400">
                      <FaSpinner className="animate-spin mr-2" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleUpdateOrderStatus('pending')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          order.status === 'pending'
                            ? 'bg-yellow-800/70 text-yellow-300 border border-yellow-600'
                            : 'bg-gray-700 hover:bg-yellow-800/50 text-gray-300 hover:text-yellow-300'
                        }`}
                      >
                        <FaTag />
                        <span>Pending</span>
                      </button>

                      <button
                        onClick={() => handleUpdateOrderStatus('shipped')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          order.status === 'shipped'
                            ? 'bg-blue-800/70 text-blue-300 border border-blue-600'
                            : 'bg-gray-700 hover:bg-blue-800/50 text-gray-300 hover:text-blue-300'
                        }`}
                      >
                        <FaShippingFast />
                        <span>Shipped</span>
                      </button>

                      <button
                        onClick={() => handleUpdateOrderStatus('delivered')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          order.status === 'delivered'
                            ? 'bg-green-800/70 text-green-300 border border-green-600'
                            : 'bg-gray-700 hover:bg-green-800/50 text-gray-300 hover:text-green-300'
                        }`}
                      >
                        <FaCheck />
                        <span>Delivered</span>
                      </button>

                      <button
                        onClick={() => handleUpdateOrderStatus('cancelled')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          order.status === 'cancelled'
                            ? 'bg-red-800/70 text-red-300 border border-red-600'
                            : 'bg-gray-700 hover:bg-red-800/50 text-gray-300 hover:text-red-300'
                        }`}
                      >
                        <FaTimes />
                        <span>Cancelled</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Preview */}
            <div className="print:w-full">
              <div className="bg-white text-black p-8 rounded-xl shadow-lg print:shadow-none print-section">
                <div className="border-b border-gray-200 pb-6 mb-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
                    <p className="text-gray-500">#{order.id}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-gray-800">Smart Card Tunisia</h3>
                    <p className="text-gray-500">contact@smartcardtunisia.com</p>
                    <p className="text-gray-500">www.smartcardtunisia.com</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Bill To:</h4>
                    <p className="text-gray-800 font-medium">{order.user_name}</p>
                    <p className="text-gray-600 whitespace-pre-line">{order.shipping_address}</p>
                    <p className="text-gray-600">{order.phone_number}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-semibold text-gray-700 mb-2">Invoice Details:</h4>
                    <p className="text-gray-600">
                      <span className="font-medium">Date: </span>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Payment Method: </span>
                      {order.payment_method.replace('_', ' ')}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Status: </span>
                      <span className={
                        order.status === 'delivered' ? 'text-green-600' :
                        order.status === 'shipped' ? 'text-blue-600' :
                        order.status === 'cancelled' ? 'text-red-600' :
                        'text-yellow-600'
                      }>
                        {order.status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>

                <table className="w-full mb-6">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 text-left text-gray-700">Description</th>
                      <th className="py-2 text-center text-gray-700">Quantity</th>
                      <th className="py-2 text-right text-gray-700">Price</th>
                      <th className="py-2 text-right text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-4 text-gray-800">
                        <p className="font-medium">NFC Business Card - {order.plan_type.charAt(0).toUpperCase() + order.plan_type.slice(1)} Plan</p>
                        <p className="text-gray-600 text-sm">Pre-programmed with unique URL</p>
                      </td>
                      <td className="py-4 text-center text-gray-800">{order.quantity}</td>
                      <td className="py-4 text-right text-gray-800">
                        {order.plan_type === 'standard' ? '35' :
                         order.plan_type === 'logo' ? '45' :
                         order.plan_type === 'custom' ? '55' :
                         (order.total_price / order.quantity).toFixed(2)} DT
                      </td>
                      <td className="py-4 text-right text-gray-800">{parseFloat(order.total_price.toString()).toFixed(2)} DT</td>
                    </tr>
                  </tbody>
                </table>

                <div className="border-t border-gray-200 pt-4 flex justify-end">
                  <div className="w-1/2">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">Subtotal:</span>
                      <span className="text-gray-800">{(parseFloat(order.total_price.toString()) - (order.shipping_cost || 0)).toFixed(2)} DT</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">Shipping:</span>
                      <span className={order.plan_type === 'custom' ? "text-green-600" : "text-gray-800"}>
                        {order.plan_type === 'custom' ? 'Free Shipping (Promo)' : `${order.shipping_cost || 7} DT`}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
                      <span className="text-gray-800">Total:</span>
                      <span className="text-gray-800">{parseFloat(order.total_price.toString()).toFixed(2)} DT</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
                  <p>Thank you for your business!</p>
                  <p className="text-sm mt-2">For any questions, please contact us at contact@smartcardtunisia.com</p>

                  <button
                    onClick={handlePrint}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors print:hidden"
                  >
                    <FaPrint className="inline-block mr-2" /> Print Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-lg text-center">
            <FaExclamationTriangle className="text-yellow-400 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-300 mb-2">Order Not Found</h2>
            <p className="text-gray-400">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => navigate('/admin')}
              className="mt-6 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 inline-flex items-center gap-2"
            >
              <FaArrowLeft />
              <span>Back to Admin Dashboard</span>
            </button>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #root {
              background-color: white !important;
            }
            .container {
              padding: 0 !important;
              max-width: 100% !important;
            }
            .print-section, .print-section * {
              visibility: visible;
            }
            .print-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background-color: white !important;
              color: black !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AdminOrderDetails;
