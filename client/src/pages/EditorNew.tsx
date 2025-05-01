import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CardEditor from '../components/CardEditor.new';
import { cardAPI } from '../services/api';
import { FaSave, FaArrowLeft, FaSpinner, FaHome, FaExclamationTriangle, FaMagic, FaEye, FaQuestionCircle, FaInfoCircle, FaUndo, FaCheck, FaTimes } from 'react-icons/fa';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const [card, setCard] = useState(null);
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
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCard();
    }
  }, [id, isAuthenticated]);

  const handleSave = async (cardData: any) => {
    try {
      setSaving(true);

      if (id) {
        // Update existing card
        await cardAPI.updateCard(id, cardData);
      } else {
        // Create new card
        const newCard = await cardAPI.createCard(cardData);
        navigate(`/editor/${newCard.id}`);
      }

      // Show success message with modern toast instead of alert
      setSuccessMessage(id ? 'Card updated successfully!' : 'Card created successfully!');
      setShowSuccessMessage(true);

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
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
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
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
    <div className="min-h-screen bg-[#0F172A] text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header with Gradient and Action Buttons */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                {id ? 'Edit Card' : 'Create New Card'} <FaMagic className="inline-block ml-2 text-purple-400" />
              </h1>
              <p className="text-gray-400 mt-3">
                {id ? 'Update your card design and links' : 'Design your new digital business card'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
              <button
                onClick={() => navigate('/preview')}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <FaEye />
                Preview
              </button>
              
              <button
                onClick={toggleHelpTips}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaQuestionCircle />
                {showHelpTips ? "Hide Tips" : "Show Tips"}
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <FaHome />
                Dashboard
              </button>
            </div>
          </div>
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
          <div className="bg-[#1E293B] rounded-xl p-10 shadow-lg text-center border border-gray-700">
            <div className="animate-spin text-blue-500 text-4xl inline-block mb-4">
              <FaSpinner />
            </div>
            <p className="text-gray-300 text-lg">Loading card data...</p>
            <p className="text-gray-500 text-sm mt-2">This will just take a moment...</p>
          </div>
        ) : (
          <div className="bg-[#1E293B]/50 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-700/50 transition-all duration-300 hover:shadow-cyan-500/20 p-6">
            {/* Card Editor Component */}
            <CardEditor
              initialData={card}
              onSave={handleSave}
            />
          </div>
        )}

        {/* Saving Overlay with Animation */}
        {saving && (
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1E293B] p-8 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full">
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
      </div>
    </div>
  );
};

export default Editor;
