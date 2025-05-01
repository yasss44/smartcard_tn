import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CardEditor from '../components/CardEditor.simple';
import { cardAPI, orderAPI } from '../services/api';
import { FaSave, FaArrowLeft, FaSpinner, FaHome, FaExclamationTriangle, FaMagic, FaEye, FaQuestionCircle, FaInfoCircle, FaUndo, FaCheck, FaTimes, FaShoppingCart } from 'react-icons/fa';

interface CardData {
  id?: string;
  title: string;
  background: string;
  profilePic?: string;
  links: any[];
  colors: {
    background: string;
    text: string;
    button: string;
  };
  planType?: 'standard' | 'logo' | 'full';
}

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

  // Get parameters from URL query
  const queryParams = new URLSearchParams(location.search);
  const planType = queryParams.get('plan') as 'standard' | 'logo' | 'full' | null;
  const orderId = queryParams.get('order');

  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showHelpTips, setShowHelpTips] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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

          // Parse JSON strings if needed
          if (typeof cardData.links === 'string') {
            cardData.links = JSON.parse(cardData.links);
          }
          if (typeof cardData.colors === 'string') {
            cardData.colors = JSON.parse(cardData.colors);
          }

          setCard(cardData);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to fetch card');
        } finally {
          setLoading(false);
        }
      } else {
        // If no ID but we have a plan type, initialize a new card with that plan type
        if (planType) {
          setCard({
            title: 'My NFC Card',
            background: '',
            links: [],
            planType: planType,
            colors: {
              background: '#ffffff',
              text: '#000000',
              button: '#3b82f6'
            }
          });
        }
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCard();
    }
  }, [id, isAuthenticated, planType]);

  const handleSave = async (cardData: any) => {
    try {
      setSaving(true);
      console.log('Saving card with profile pic:', cardData.profilePic ? 'Present (length: ' + cardData.profilePic.length + ')' : 'Not present');

      // Ensure plan type is included if it exists
      if (planType && !cardData.planType) {
        cardData.planType = planType;
      }

      if (id) {
        // Update existing card
        await cardAPI.updateCard(id, cardData);

        // Show success message for update
        setSuccessMessage('Card updated successfully!');
        setShowSuccessMessage(true);
      } else {
        // Create new card
        // If this card is being created from an order, include the orderId
        if (orderId) {
          console.log('Creating card from order:', orderId);
          cardData.orderId = orderId; // Add orderId to the card data
        }

        const newCard = await cardAPI.createCard(cardData);

        // If this card was created from an order, update the order's card_created status
        if (orderId) {
          try {
            console.log('Updating order card_created status for order:', orderId, 'with card ID:', newCard.id);
            await orderAPI.updateOrderCardCreated(orderId, true, newCard.id);
            console.log('Successfully updated order card_created status for order:', orderId);
          } catch (orderErr: any) {
            console.error('Failed to update order status:', orderErr);
            console.error('Error details:', orderErr.response?.data || orderErr.message);
            console.error('Order ID:', orderId);
            console.error('Card ID:', newCard.id);
            // Continue anyway since the card was created successfully
          }
        }

        // Show success message for creation
        setSuccessMessage('Card created successfully! Redirecting to dashboard...');
        setShowSuccessMessage(true);

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }

      // For updates, auto-hide success message after 5 seconds
      // For new cards, the message will be hidden when redirecting to dashboard
      if (id) {
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  // Toggle help tips visibility
  const toggleHelpTips = () => {
    setShowHelpTips(!showHelpTips);
  };

  // Clear error message
  const clearError = () => {
    setError('');
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
        {/* Enhanced Header with Gradient and Action Buttons */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                {id ? 'Edit Card' : 'Create New Card'} <FaMagic className="inline-block ml-2 text-purple-400" />
              </h1>
              <p className="text-gray-400 mt-3">
                {id ? 'Update your card design and links' : 'Design your new digital business card'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-2 md:mt-0 w-full md:w-auto">
              {id && (
                <Link
                  to={`/preview/${id}`}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 transform hover:translate-y-[-2px] w-full md:w-auto"
                  title="Preview your card"
                >
                  <FaEye className="text-white" />
                  <span>Preview</span>
                </Link>
              )}

              <button
                onClick={toggleHelpTips}
                className="btn-stylish btn-stylish-primary w-full md:w-auto"
                title={showHelpTips ? "Hide help tips" : "Show help tips"}
              >
                <FaQuestionCircle className="mr-2" />
                <span>{showHelpTips ? "Hide Tips" : "Show Tips"}</span>
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="btn-stylish btn-stylish-secondary w-full md:w-auto"
                title="Return to dashboard"
              >
                <FaHome className="mr-2" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>

          {/* Help Tips Section - Conditionally Rendered */}
          {showHelpTips && (
            <div className="mt-6 bg-indigo-900/30 border border-indigo-500/50 rounded-lg p-4 animate-fade-in shadow-lg">
              <div className="flex items-start gap-3">
                <div className="bg-indigo-500 rounded-full p-2 flex-shrink-0 mt-1">
                  <FaInfoCircle className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-300 text-lg mb-2">Editor Tips</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Start by giving your card a memorable title</li>
                    <li>Choose a background image or color that represents your brand</li>
                    <li>Add links to your social media profiles, website, or contact information</li>
                    <li>Preview your card to see how it will look to others</li>
                    <li>Remember to save your changes before leaving the editor</li>
                  </ul>
                  <button
                    onClick={toggleHelpTips}
                    className="mt-3 text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm"
                  >
                    <FaTimes className="text-xs" /> Close Tips
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success Message Toast */}
        {showSuccessMessage && (
          <div className="fixed top-20 right-4 z-50 animate-fade-in-down">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-4 rounded-lg shadow-xl flex items-center border border-green-400/30">
              <div className="mr-4 bg-green-600 rounded-full p-2 flex-shrink-0">
                <FaCheck className="text-white text-lg" />
              </div>
              <span className="font-medium">{successMessage}</span>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="ml-4 text-white/80 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {/* Error Message with Dismiss Button */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-5 py-4 rounded-lg mb-8 flex items-center shadow-lg">
            <div className="mr-4 bg-red-500 rounded-full p-2 flex-shrink-0">
              <FaExclamationTriangle className="text-white text-lg" />
            </div>
            <span className="font-medium">{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-red-300 hover:text-white"
              title="Dismiss error"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-gray-800 rounded-xl p-10 shadow-lg text-center border border-gray-700">
            <div className="animate-spin text-blue-500 text-4xl inline-block mb-4">
              <FaSpinner />
            </div>
            <p className="text-gray-300 text-lg">Loading card data...</p>
            <p className="text-gray-500 text-sm mt-2">This will just take a moment...</p>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-700/50 transition-all duration-300 hover:shadow-cyan-500/20 p-6">
            {/* Card Editor Component */}
            <div className="bg-gray-900/70 rounded-lg border border-gray-700/70 p-5 shadow-inner mb-6 editor-container">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-gray-700/50">
                <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Card Editor {planType && <span className="ml-2 text-sm bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">({planType.charAt(0).toUpperCase() + planType.slice(1)} Plan)</span>}
                </h2>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleSave(card)}
                    className="btn-stylish btn-stylish-action w-full md:w-auto"
                    title="Save changes"
                  >
                    <FaSave className="mr-2" />
                    <span>Save</span>
                  </button>

                  {id && (
                    <button
                      onClick={() => navigate(`/checkout/${id}`)}
                      className="btn-stylish bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600 w-full md:w-auto"
                      title="Order physical cards"
                    >
                      <FaShoppingCart className="mr-2" />
                      <span>Order Cards</span>
                    </button>
                  )}
                </div>
              </div>
              <CardEditor
                initialData={card ? {
                  title: card.title || '',
                  background: card.background || '',
                  profilePic: card.profilePic || '',
                  links: card.links || [],
                  colors: card.colors || {
                    background: '#ffffff',
                    text: '#000000',
                    button: '#3b82f6'
                  }
                } : undefined}
                onSave={handleSave}
              />
            </div>


          </div>
        )}

        {/* Saving Overlay with Animation */}
        {saving && (
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full">
              <div className="flex items-center justify-center space-x-4">
                <div className="animate-spin text-cyan-400 text-2xl">
                  <FaSpinner />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-semibold text-white">Saving your card</h3>
                  <p className="text-gray-400 text-sm">Please wait while we process your changes...</p>
                </div>
              </div>

              <div className="mt-6 w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2.5 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>
        )}

        {/* Animation styles are defined in index.css */}
        {/* The animate-fade-in and animate-fade-in-down classes are used for animations */}
      </div>
    </div>
  );
};

export default Editor;
