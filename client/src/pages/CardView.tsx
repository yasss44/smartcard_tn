import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cardAPI } from '../services/api';
import {
  FaArrowLeft,
  FaLink,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaYoutube,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa';

const CardView = () => {
  const { uniqueUrl } = useParams();

  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCard = async () => {
      if (uniqueUrl) {
        try {
          setLoading(true);
          const cardData = await cardAPI.getCardByUniqueUrl(uniqueUrl);

          // Parse JSON strings if needed
          if (typeof cardData.links === 'string') {
            cardData.links = JSON.parse(cardData.links);
          }
          if (typeof cardData.colors === 'string') {
            cardData.colors = JSON.parse(cardData.colors);
          }

          console.log('Card data received:', cardData);
          console.log('Profile pic:', cardData.profilePic ? 'Present' : 'Not present');
          setCard(cardData);
        } catch (err: any) {
          console.error('Error fetching card:', err);
          setError(err.response?.data?.message || 'Failed to fetch card');
        } finally {
          setLoading(false);
        }
      } else {
        setError('Card URL is required');
        setLoading(false);
      }
    };

    fetchCard();
  }, [uniqueUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-blue-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md w-full">
          {error}
        </div>
        <Link to="/" className="text-blue-600 hover:underline flex items-center">
          <FaArrowLeft className="mr-2" /> Back to Home
        </Link>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="text-center py-8 max-w-md w-full">
          <p className="text-gray-500 mb-4">Card not found or has been removed.</p>
          <Link to="/" className="text-blue-600 hover:underline flex items-center justify-center">
            <FaArrowLeft className="mr-2" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: card.colors?.background || '#ffffff',
        backgroundImage: card.background ? `url(${card.background})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: card.colors?.text || '#000000',
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Profile Picture */}
          {console.log('Rendering profile pic:', card.profilePic ? 'Present' : 'Not present')}
          {card.profilePic ? (
            <div className="flex justify-center mb-6">
              <div className="w-28 h-28 rounded-full overflow-hidden border-2" style={{ borderColor: card.colors?.button || '#3b82f6' }}>
                <img src={card.profilePic} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          ) : (
            <div className="text-center mb-6 text-xs opacity-50">No profile picture</div>
          )}

          <h1 className="text-3xl font-bold text-center mb-8" style={{ color: card.colors?.text || '#000000' }}>
            {card.title}
          </h1>

          <div className="space-y-4">
            {card.links && card.links.map((link: any) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-transform transform hover:scale-105 flex items-center justify-center ${link.style === 'outlined' ? 'border-2' : ''}`}
                style={{
                  backgroundColor: link.style === 'outlined' ? 'transparent' : (card.colors?.button || '#3b82f6'),
                  color: link.style === 'outlined' ? (card.colors?.text || '#000000') : '#ffffff',
                  borderColor: link.style === 'outlined' ? (card.colors?.button || '#3b82f6') : 'transparent',
                }}
              >
                {/* Icon based on link type */}
                {link.icon && (
                  <span className="mr-2">
                    {link.icon === 'facebook' ? <FaFacebookF /> :
                     link.icon === 'twitter' ? <FaTwitter /> :
                     link.icon === 'instagram' ? <FaInstagram /> :
                     link.icon === 'linkedin' ? <FaLinkedinIn /> :
                     link.icon === 'github' ? <FaGithub /> :
                     link.icon === 'youtube' ? <FaYoutube /> :
                     link.icon === 'email' ? <FaEnvelope /> :
                     link.icon === 'phone' ? <FaPhone /> :
                     <FaLink />}
                  </span>
                )}
                {link.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      <footer className="py-4 text-center" style={{ color: card.colors?.text || '#000000' }}>
        <p className="text-sm opacity-70">
          Powered by Smart Card Tunisia
        </p>
        <Link to="/" className="text-sm opacity-70 hover:opacity-100 inline-block mt-1">
          Create your own card
        </Link>
      </footer>
    </div>
  );
};

export default CardView;
