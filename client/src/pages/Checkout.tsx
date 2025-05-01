import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { cardAPI, orderAPI } from '../services/api';

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    quantity: 10,
    shipping_address: '',
    phone_number: '',
  });

  // Pricing based on plan type
  const getPricePerCard = () => {
    if (!card) return 19.99; // Default price

    switch (card.planType) {
      case 'standard':
        return 19.99;
      case 'logo':
        return 29.99;
      case 'full':
        return 49.99;
      default:
        return 19.99; // Default to standard price if no plan type
    }
  };

  const shippingFee = 4.99;

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchCard = async () => {
      if (id) {
        try {
          setLoading(true);
          const cardData = await cardAPI.getCardById(id);
          setCard(cardData);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to fetch card');
        } finally {
          setLoading(false);
        }
      } else {
        setError('Card ID is required');
        setLoading(false);
      }
    };

    if (isAuthenticated && id) {
      fetchCard();
    }
  }, [id, isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'quantity') {
      // Ensure quantity is at least 10
      const quantity = Math.max(10, parseInt(value) || 10);
      setFormData({ ...formData, [name]: quantity });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const calculateTotal = () => {
    return (formData.quantity * getPricePerCard() + shippingFee).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      setProcessing(true);

      // Create order
      const orderData = {
        card_id: id,
        quantity: formData.quantity,
        shipping_address: formData.shipping_address,
        phone_number: formData.phone_number,
        total_price: parseFloat(calculateTotal()),
        payment_method: 'cash_on_delivery',
        plan_type: card.planType || 'standard', // Include plan type
      };

      const newOrder = await orderAPI.createOrder(orderData);

      // Show success message and redirect
      alert('Order placed successfully! You will pay upon delivery.');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-blue-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Card not found.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Order NFC Cards</h1>
          <button
            onClick={() => navigate(`/preview/${id}`)}
            className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Back to Preview
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Shipping Information</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Card
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {card.title}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="quantity" className="block text-gray-700 text-sm font-medium mb-2">
                  Quantity (Minimum 10)
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="10"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="shipping_address" className="block text-gray-700 text-sm font-medium mb-2">
                  Shipping Address
                </label>
                <textarea
                  id="shipping_address"
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="phone_number" className="block text-gray-700 text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Place Order (Cash on Delivery)'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Card:</span>
                <span className="font-medium">{card.title}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{formData.quantity}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Price per card:</span>
                <span className="font-medium">${getPricePerCard().toFixed(2)}</span>
              </div>
              {card.planType && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Plan type:</span>
                  <span className="font-medium capitalize">{card.planType}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium">${shippingFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${calculateTotal()}</span>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Payment Method</h3>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="cod"
                  name="payment_method"
                  value="cash_on_delivery"
                  checked
                  readOnly
                  className="mr-2"
                />
                <label htmlFor="cod">Cash on Delivery</label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Pay when your NFC cards are delivered to your address.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">What You'll Get</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>{formData.quantity} custom NFC business cards</li>
                <li>Pre-programmed with your unique URL</li>
                <li>High-quality PVC material</li>
                <li>Standard credit card size (85.6 × 54 mm)</li>
                <li>Delivery within 7-10 business days</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
