import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
  faGithub,
  faYoutube
} from '@fortawesome/free-brands-svg-icons';
import {
  faEnvelope,
  faPhone,
  faLink,
  faMobile,
  faDesktop
} from '@fortawesome/free-solid-svg-icons';

interface NFCCardPreviewProps {
  title: string;
  background: string;
  links: {
    id: string;
    title: string;
    url: string;
    icon: string;
  }[];
  colors: {
    background: string;
    text: string;
    button: string;
  };
  onTap?: (url: string) => void;
}

const NFCCardPreview: React.FC<NFCCardPreviewProps> = ({
  title,
  background,
  links,
  colors,
  onTap
}) => {
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Get the appropriate icon component based on the icon type
  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case 'facebook':
        return <FontAwesomeIcon icon={faFacebook} />;
      case 'twitter':
        return <FontAwesomeIcon icon={faTwitter} />;
      case 'instagram':
        return <FontAwesomeIcon icon={faInstagram} />;
      case 'linkedin':
        return <FontAwesomeIcon icon={faLinkedin} />;
      case 'github':
        return <FontAwesomeIcon icon={faGithub} />;
      case 'youtube':
        return <FontAwesomeIcon icon={faYoutube} />;
      case 'email':
        return <FontAwesomeIcon icon={faEnvelope} />;
      case 'phone':
        return <FontAwesomeIcon icon={faPhone} />;
      case 'link':
      default:
        return <FontAwesomeIcon icon={faLink} />;
    }
  };

  const handleTap = (url: string) => {
    if (onTap) {
      onTap(url);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Preview Mode Toggle */}
      <div className="flex justify-end">
        <div className="bg-gray-900 rounded-lg p-1 inline-flex border border-gray-700">
          <Button
            onClick={() => setPreviewMode('mobile')}
            variant="dark"
            size="sm"
            className={`${previewMode === 'mobile' ? 'bg-gray-800' : 'bg-transparent'}`}
            aria-label="Mobile preview"
          >
            <FontAwesomeIcon icon={faMobile} className="mr-2" />
            Mobile
          </Button>
          <Button
            onClick={() => setPreviewMode('desktop')}
            variant="dark"
            size="sm"
            className={`${previewMode === 'desktop' ? 'bg-gray-800' : 'bg-transparent'}`}
            aria-label="Desktop preview"
          >
            <FontAwesomeIcon icon={faDesktop} className="mr-2" />
            Desktop
          </Button>
        </div>
      </div>

      {/* Card Preview */}
      <div
        className={`${
          previewMode === 'mobile' ? 'aspect-[9/16] max-w-[320px]' : 'aspect-[16/9] max-w-full'
        } mx-auto border-4 border-gray-800 ${
          previewMode === 'mobile' ? 'rounded-3xl' : 'rounded-xl'
        } overflow-hidden shadow-2xl bg-white transition-all duration-300 ease-in-out relative group`}
        style={{
          backgroundColor: colors.background,
          backgroundImage: background ? `url(${background})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: colors.text,
        }}
      >
        {/* Device frame for mobile preview */}
        {previewMode === 'mobile' && (
          <div className="absolute inset-0 pointer-events-none border-8 border-gray-800 rounded-3xl z-10">
            {/* Phone notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-5 bg-black rounded-b-xl"></div>
          </div>
        )}

        {/* Interactive elements indicator */}
        <div className="absolute top-0 right-0 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-bold px-3 py-1 m-2 rounded-full opacity-70 group-hover:opacity-100 transition-opacity z-20 shadow-md">
          <span className="animate-pulse">
            {previewMode === 'mobile' ? 'Interactive Mobile Preview' : 'Interactive Desktop Preview'}
          </span>
        </div>

        {/* Tilt effect wrapper */}
        <div className="p-6 flex flex-col h-full transform transition-transform duration-300 group-hover:scale-[1.01] relative">
          {/* Simulated NFC tap area */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-xl animate-pulse z-0"></div>

          <h1
            className="text-2xl font-bold text-center mb-6 flex-shrink-0 relative z-10"
            style={{ color: colors.text }}
          >
            {title || 'Your Card Title'}
            <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
          </h1>

          <div className="space-y-3 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent p-1 relative z-10 flex flex-col items-center">
            {links.map((link) => (
              <Button
                key={link.id}
                onClick={() => handleTap(link.url)}
                variant="dark"
                width="fixed"
                className="mb-[17px] border-2"
                style={{
                  borderColor: colors.button,
                  color: colors.text,
                }}
              >
                <span className="mr-2">{getIconComponent(link.icon)}</span>
                {link.title}
              </Button>
            ))}

            {links.length === 0 && (
              <div className="text-center py-12 opacity-80 bg-gradient-to-b from-transparent to-white/10 rounded-xl">
                <div className="relative inline-block">
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full blur-md animate-pulse"></div>
                  <FontAwesomeIcon icon={faLink} className="text-4xl mb-3 relative" />
                </div>
                <p className="text-sm font-medium">Your links will appear here</p>
                <p className="text-xs opacity-70 mt-1">Add links using the form on the left</p>
              </div>
            )}
          </div>

          <div
            className="mt-6 text-center text-xs opacity-70 relative z-10"
            style={{ color: colors.text }}
          >
            <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              <p>Tap links to interact with preview</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFCCardPreview;
