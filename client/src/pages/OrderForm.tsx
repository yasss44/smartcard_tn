import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { orderAPI } from '../services/api';
import { FaSpinner, FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle, FaCreditCard, FaUpload, FaImage, FaPalette } from 'react-icons/fa';

const OrderForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loading: authLoading } = useContext(AuthContext);

  // Get plan type from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const planType = queryParams.get('plan') as 'standard' | 'logo' | 'full' | null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    quantity: 1,
    shipping_address: '',
    phone_number: '',
    plan_type: planType || 'standard',
    custom_url_name: ''
  });

  // For file uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');

  // For URL name validation
  const [urlNameError, setUrlNameError] = useState('');

  // Define plan prices and shipping costs
  const planPrices = {
    standard: 35,
    logo: 45,
    custom: 55
  };

  // Shipping cost (free for custom plan)
  const shippingCost = 7;

  // Get price per card based on plan type
  const getPricePerCard = () => {
    return planPrices[formData.plan_type as keyof typeof planPrices] || planPrices.standard;
  };

  // Calculate shipping fee (free for custom plan)
  const getShippingFee = () => {
    return formData.plan_type === 'custom' ? 0 : shippingCost;
  };

  // Calculate total price
  const calculateSubtotal = () => {
    return formData.quantity * getPricePerCard();
  };

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Validate URL name
  const validateUrlName = (value: string) => {
    if (!value) {
      return ''; // Empty is valid (will generate random UUID)
    }

    // Check if it contains only alphanumeric characters, hyphens, and underscores
    const validUrlPattern = /^[a-zA-Z0-9-_]+$/;
    if (!validUrlPattern.test(value)) {
      return 'Custom URL can only contain letters, numbers, hyphens, and underscores';
    }

    // Check length
    if (value.length < 3) {
      return 'Custom URL must be at least 3 characters long';
    }

    if (value.length > 30) {
      return 'Custom URL must be less than 30 characters long';
    }

    return ''; // Valid
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'quantity') {
      // Ensure quantity is at least 1
      const quantity = Math.max(1, parseInt(value) || 1);
      setFormData({ ...formData, [name]: quantity });
    } else if (name === 'custom_url_name') {
      // Validate URL name
      const error = validateUrlName(value);
      setUrlNameError(error);
      setFormData({ ...formData, [name]: value });
    } else if (name === 'plan_type') {
      // Reset file uploads when changing plan type
      if (value === 'standard') {
        setLogoFile(null);
        setDesignFile(null);
      } else if (value === 'logo') {
        setDesignFile(null);
      }
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'logo' | 'design') => {
    setUploadError('');
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setUploadError(`Invalid file type. Please upload a JPEG, PNG, GIF, or PDF file.`);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`File is too large. Maximum size is 5MB.`);
      return;
    }

    // Set the file
    if (fileType === 'logo') {
      setLogoFile(file);
    } else {
      setDesignFile(file);
    }
  };

  const calculateTotal = () => {
    return (calculateSubtotal() + getShippingFee()).toFixed(2);
  };

  // Get formatted shipping fee display
  const getShippingDisplay = () => {
    if (formData.plan_type === 'custom') {
      return 'Free Shipping (Promo)';
    } else {
      return `${shippingCost} DT`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      // Validate URL name before submitting
      if (formData.custom_url_name) {
        const error = validateUrlName(formData.custom_url_name);
        if (error) {
          setError(error);
          setLoading(false);
          return;
        }
      }

      // Validate file uploads based on plan type
      if (formData.plan_type === 'logo' && !logoFile) {
        setError('Please upload your logo for the Logo Customization plan.');
        setLoading(false);
        return;
      }

      if (formData.plan_type === 'custom' && (!logoFile || !designFile)) {
        setError('Please upload both your logo and design for the Full Customization plan.');
        setLoading(false);
        return;
      }

      // Create FormData object for file uploads
      const formDataObj = new FormData();

      // Append files if they exist
      if (logoFile) {
        formDataObj.append('logo', logoFile);
      }

      if (designFile) {
        formDataObj.append('design', designFile);
      }

      // Append other order data
      formDataObj.append('quantity', formData.quantity.toString());
      formDataObj.append('shipping_address', formData.shipping_address);
      formDataObj.append('phone_number', formData.phone_number);
      formDataObj.append('total_price', calculateTotal());
      formDataObj.append('payment_method', 'cash_on_delivery');
      formDataObj.append('plan_type', formData.plan_type);
      formDataObj.append('shipping_cost', getShippingFee().toString());

      if (formData.custom_url_name) {
        formDataObj.append('custom_url_name', formData.custom_url_name);
      }

      // Create order with files
      const orderData = {
        quantity: formData.quantity,
        shipping_address: formData.shipping_address,
        phone_number: formData.phone_number,
        total_price: parseFloat(calculateTotal()),
        payment_method: 'cash_on_delivery',
        plan_type: formData.plan_type,
        custom_url_name: formData.custom_url_name || undefined,
        shipping_cost: getShippingFee(),
        has_logo_file: !!logoFile,
        has_design_file: !!designFile
      };

      // First create the order
      const newOrder = await orderAPI.createOrder(orderData);

      // Then upload files if they exist
      if ((logoFile || designFile) && newOrder.id) {
        try {
          // Add order ID to FormData
          formDataObj.append('orderId', newOrder.id.toString());

          // Upload files
          await fetch('http://localhost:5000/api/orders/upload-files', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formDataObj
          });
        } catch (uploadErr) {
          console.error('Error uploading files:', uploadErr);
          // Continue anyway since the order was created successfully
        }
      }

      // Show success message
      setSuccess(true);

      // Reset form
      setFormData({
        quantity: 1,
        shipping_address: '',
        phone_number: '',
        plan_type: planType || 'standard',
        custom_url_name: ''
      });

      // Reset file uploads
      setLogoFile(null);
      setDesignFile(null);
      setUploadError('');

      // Reset URL name error
      setUrlNameError('');

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Order Your NFC Card
          </h1>

          {/* Success Message */}
          {success && (
            <div className="bg-green-900/50 border border-green-500 text-green-200 px-5 py-4 rounded-lg mb-8 flex items-center shadow-lg">
              <div className="mr-4 bg-green-500 rounded-full p-2 flex-shrink-0">
                <FaCheck className="text-white text-lg" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Order Placed Successfully!</h3>
                <p>Your order has been placed. You will be redirected to your dashboard shortly.</p>
              </div>
            </div>
          )}

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Form */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Shipping Information
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="plan_type" className="block text-gray-300 text-sm font-medium mb-2">
                    Plan Type
                  </label>
                  <select
                    id="plan_type"
                    name="plan_type"
                    value={formData.plan_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                    required
                  >
                    <option value="standard">Standard (35 DT)</option>
                    <option value="logo">Logo Customization (45 DT)</option>
                    <option value="custom">Full Customization (55 DT + Free Shipping)</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="quantity" className="block text-gray-300 text-sm font-medium mb-2">
                    Quantity (Minimum 1)
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="shipping_address" className="block text-gray-300 text-sm font-medium mb-2">
                    Shipping Address
                  </label>
                  <textarea
                    id="shipping_address"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="phone_number" className="block text-gray-300 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                    required
                  />
                </div>

                {/* Logo Upload - Only for logo and custom plans */}
                {(formData.plan_type === 'logo' || formData.plan_type === 'custom') && (
                  <div className="mb-4">
                    <label htmlFor="logo_upload" className="block text-gray-300 text-sm font-medium mb-2">
                      Logo Upload {formData.plan_type === 'logo' && <span className="text-red-400">*</span>}
                    </label>
                    <div className="flex items-center">
                      <label
                        htmlFor="logo_upload"
                        className="flex items-center justify-center w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md cursor-pointer hover:bg-gray-600 transition-colors"
                      >
                        {logoFile ? (
                          <>
                            <FaImage className="text-green-400 mr-2" />
                            <span className="text-green-400">{logoFile.name}</span>
                          </>
                        ) : (
                          <>
                            <FaUpload className="text-cyan-400 mr-2" />
                            <span>Upload your logo (JPG, PNG, GIF, PDF)</span>
                          </>
                        )}
                      </label>
                      <input
                        type="file"
                        id="logo_upload"
                        onChange={(e) => handleFileUpload(e, 'logo')}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.gif,.pdf"
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      Maximum file size: 5MB
                    </p>
                  </div>
                )}

                {/* Design Upload - Only for custom plan */}
                {formData.plan_type === 'custom' && (
                  <div className="mb-4">
                    <label htmlFor="design_upload" className="block text-gray-300 text-sm font-medium mb-2">
                      Design Upload <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center">
                      <label
                        htmlFor="design_upload"
                        className="flex items-center justify-center w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md cursor-pointer hover:bg-gray-600 transition-colors"
                      >
                        {designFile ? (
                          <>
                            <FaPalette className="text-green-400 mr-2" />
                            <span className="text-green-400">{designFile.name}</span>
                          </>
                        ) : (
                          <>
                            <FaUpload className="text-pink-400 mr-2" />
                            <span>Upload your design (JPG, PNG, GIF, PDF)</span>
                          </>
                        )}
                      </label>
                      <input
                        type="file"
                        id="design_upload"
                        onChange={(e) => handleFileUpload(e, 'design')}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.gif,.pdf"
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      Maximum file size: 5MB
                    </p>
                  </div>
                )}

                {/* File Upload Error */}
                {uploadError && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-md text-red-400 text-sm">
                    <FaExclamationTriangle className="inline-block mr-2" />
                    {uploadError}
                  </div>
                )}

                <div className="mb-6">
                  <label htmlFor="custom_url_name" className="block text-gray-300 text-sm font-medium mb-2">
                    Custom URL Name (Optional)
                  </label>
                  <div className="flex items-center">
                    <span className="bg-gray-800 text-gray-400 px-3 py-2 rounded-l-md border border-gray-600">
                      card/
                    </span>
                    <input
                      type="text"
                      id="custom_url_name"
                      name="custom_url_name"
                      value={formData.custom_url_name}
                      onChange={handleChange}
                      placeholder="your-custom-name"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                    />
                  </div>
                  {urlNameError && (
                    <p className="text-red-400 text-sm mt-1">{urlNameError}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    This will be used as your card's URL: card/{formData.custom_url_name || 'random-id'}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Only letters, numbers, hyphens, and underscores allowed. Leave empty for a random ID.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="mr-2" />
                      Place Order (Cash on Delivery)
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Order Summary
              </h2>

              <div className="border-b border-gray-700 pb-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Plan Type:</span>
                  <span className="text-white capitalize">{formData.plan_type}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Quantity:</span>
                  <span className="text-white">{formData.quantity}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Price per card:</span>
                  <span className="text-white">{getPricePerCard()} DT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping:</span>
                  <span className={formData.plan_type === 'custom' ? "text-green-400" : "text-white"}>
                    {getShippingDisplay()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  {calculateTotal()} DT
                </span>
              </div>

              <div className="mt-6 bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center">
                  <FaInfoCircle className="text-cyan-400 mr-2" />
                  Payment Method
                </h3>
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
                  <label htmlFor="cod" className="text-gray-300">Cash on Delivery</label>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Pay when your NFC cards are delivered to your address.
                </p>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">What You'll Get</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>{formData.quantity} custom NFC business cards</li>
                  <li>Pre-programmed with your {formData.custom_url_name ? 'custom' : 'unique'} URL</li>
                  <li>High-quality PVC material</li>
                  <li>Standard credit card size (85.6 × 54 mm)</li>
                  <li>Delivery within 7-10 business days</li>
                  <li>Access to card editor after order approval</li>
                  {formData.custom_url_name && (
                    <li className="text-cyan-400">Custom URL: card/{formData.custom_url_name}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
