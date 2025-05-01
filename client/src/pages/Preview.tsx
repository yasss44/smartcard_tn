import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { cardAPI } from '../services/api';
import { FaEdit, FaShoppingCart, FaShareAlt, FaSpinner } from 'react-icons/fa';

const Preview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  // Helper function to safely format dates
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';

    try {
      const date = new Date(dateValue);
      return date.toString() !== 'Invalid Date'
        ? date.toLocaleDateString()
        : 'N/A';
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'N/A';
    }
  };

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

          console.log('Card data received:', cardData);
          console.log('Created at:', cardData.created_at, 'Type:', typeof cardData.created_at);
          console.log('createdAt:', cardData.createdAt, 'Type:', typeof cardData.createdAt);
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

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/card/${card.unique_url}`;
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  if (authLoading || loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4 shadow-lg">
            {error}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 px-4 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-cyan-500/20"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12 bg-gray-800/50 rounded-lg shadow-lg border border-gray-700/50 backdrop-blur-sm">
            <div className="mb-6 inline-block p-4 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-gray-300 mb-6 text-lg">Card not found.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Preview: {card.title}
          </h1>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-lg border-2 border-gray-700 text-gray-300 hover:border-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <Link
              to={`/editor/${id}`}
              className="px-4 py-2 rounded-lg border-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center gap-2"
            >
              <FaEdit /> Edit
            </Link>
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-lg border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-colors flex items-center gap-2"
            >
              <FaShareAlt /> Share
            </button>
            <Link
              to={`/checkout/${id}`}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20"
            >
              <FaShoppingCart /> Order
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mobile Preview */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <div className="border-8 border-gray-800 rounded-3xl overflow-hidden shadow-2xl mx-auto bg-black" style={{ maxWidth: '300px' }}>
                {/* Phone notch */}
                <div className="h-6 bg-black relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl"></div>
                </div>
                <div
                  className="h-[600px] overflow-y-auto"
                  style={{
                    backgroundColor: card.colors?.background || '#ffffff',
                    backgroundImage: card.background ? `url(${card.background})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: card.colors?.text || '#000000',
                  }}
                >
                  <div className="p-6">
                    {/* Profile Picture */}
                    {card.profilePic && (
                      <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2" style={{ borderColor: card.colors?.button || '#3b82f6' }}>
                          <img src={card.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}

                    <h1 className="text-2xl font-bold text-center mb-6" style={{ color: card.colors?.text || '#000000' }}>
                      {card.title}
                    </h1>
                    <div className="space-y-3">
                      {card.links && card.links.map((link: any) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block w-full text-center py-3 px-4 rounded-full font-medium transition-transform transform hover:scale-105 flex items-center justify-center ${link.style === 'outlined' ? 'border-2' : ''}`}
                          style={{
                            backgroundColor: link.style === 'outlined' ? 'transparent' : (card.colors?.button || '#3b82f6'),
                            color: link.style === 'outlined' ? (card.colors?.text || '#000000') : '#ffffff',
                            borderColor: link.style === 'outlined' ? (card.colors?.button || '#3b82f6') : 'transparent',
                          }}
                        >
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg py-2 px-4 border border-cyan-500/30">
                <p className="text-cyan-400 font-medium">Mobile Preview</p>
              </div>
            </div>
          </div>

          {/* Card Info */}
          <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Card Information</h2>
            <div className="space-y-6">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Title</p>
                <p className="font-medium text-white">{card.title}</p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Created On</p>
                <p className="font-medium text-white">
                  {formatDate(card.created_at || card.createdAt)}
                </p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Number of Links</p>
                <p className="font-medium text-white">{card.links ? card.links.length : 0}</p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Public URL</p>
                <div className="flex items-center">
                  <a
                    href={`/card/${card.unique_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 hover:underline mr-2 break-all"
                  >
                    {window.location.origin}/card/{card.unique_url}
                  </a>
                  <button
                    onClick={copyToClipboard}
                    className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700/50 transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-5 rounded-lg border border-purple-500/30">
              <h3 className="text-lg font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Order Physical NFC Cards</h3>
              <p className="text-gray-300 mb-4">
                Get physical NFC business cards that link directly to your digital profile.
                Tap the card on any smartphone to instantly share your information.
              </p>
              <Link
                to={`/checkout/${id}`}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors inline-flex items-center gap-2 shadow-lg shadow-purple-500/20"
              >
                <FaShoppingCart /> Order Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Share Your Card</h3>
            <p className="text-gray-300 mb-6">
              Share this link with anyone to give them access to your digital business card.
            </p>
            <div className="flex items-center mb-6">
              <input
                type="text"
                value={`${window.location.origin}/card/${card.unique_url}`}
                readOnly
                className="flex-1 px-3 py-3 bg-gray-900 border border-gray-700 rounded-l-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-gray-300"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-colors rounded-r-md"
              >
                Copy
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded-lg border-2 border-gray-700 text-gray-300 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Preview;
