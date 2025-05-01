import { useState, useRef } from 'react';
import { uploadAPI } from '../services/api';

interface BackgroundSelectorProps {
  background: string;
  onSelect: (background: string) => void;
  onUpload: (background: string) => void;
}

const BackgroundSelector = ({ background, onSelect, onUpload }: BackgroundSelectorProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample background options (Consider fetching these dynamically or defining them elsewhere)
  const backgroundOptions = [
    { id: 'bg1', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', name: 'Gradient 1' },
    { id: 'bg2', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', name: 'Gradient 2' },
    { id: 'bg3', url: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', name: 'Gradient 3' },
    { id: 'bg4', url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', name: 'Abstract' },
  ];

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // Simulate upload delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000)); 

      // Use a local URL for preview
      const localUrl = URL.createObjectURL(file);
      onUpload(localUrl);

      // TODO: Implement actual server upload
      // const response = await uploadAPI.uploadImage(file);
      // onUpload(response.filePath);
    } catch (error) {
      console.error('Error uploading file:', error);
      // TODO: Add user-facing error message
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-6 bg-gray-50 p-6 rounded-xl shadow-inner space-y-6">
      <h3 className="text-lg font-manrope font-semibold flex items-center text-gray-800">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span>Background Image</span>
        <span className="ml-2 text-xs text-gray-500 font-normal">Choose or upload an image for your card</span>
      </h3>

      {/* Enhanced Background Preview & Upload Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 min-h-[220px] flex flex-col justify-center items-center text-center relative overflow-hidden group">
        {background ? (
          <>
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-300 ease-in-out"
              style={{ backgroundImage: `url(${background})` }}
              aria-label="Current background preview"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="space-y-3">
                <p className="text-white text-sm font-medium">Current Background</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center shadow-md transform hover:scale-105 duration-200"
                    title="Upload a different background image"
                    aria-label="Change background image"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Change Background
                  </button>
                  <button
                    onClick={() => onSelect('')} // Clear background
                    className="bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center shadow-md transform hover:scale-105 duration-200"
                    title="Remove the current background image"
                    aria-label="Remove background image"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Background
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-full relative group">
              <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Background image icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center bg-blue-100 bg-opacity-0 rounded-full group-hover:bg-opacity-50 transition-all duration-300">
                <span className="text-blue-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">Background Image</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">No background selected</p>
              <p className="text-xs text-gray-500 mb-4">Recommended size: 1200×800 pixels</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2 mx-auto shadow-sm"
                title="Click to upload a background image"
                aria-label="Upload background image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Image
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
        id="background-upload-input"
        aria-label="Upload background image"
      />
      
      {/* Upload Instructions */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start text-xs text-blue-700">
        <div className="flex-shrink-0 bg-blue-100 rounded-full p-1 mt-0.5 mr-2" title="Important information about background images">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Information icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="font-medium mb-1">Tips for best results:</p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>Use high-resolution images (at least 1200×800px)</li>
            <li>Simple backgrounds work best for readability</li>
            <li>Supported formats: JPG, PNG, GIF</li>
          </ul>
        </div>
      </div>

      {/* Background Presets - Enhanced Grid */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full mr-2" title="Choose from preset background options">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <span>Preset Backgrounds</span>
          <span className="ml-2 text-xs text-gray-500 font-normal">Quick select from our curated collection</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {backgroundOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.url)}
              className="group bg-white border border-gray-200 rounded-lg overflow-hidden aspect-video hover:border-blue-400 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 relative"
              aria-label={`Select ${option.name} background`}
            >
              <div
                className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-105 duration-300"
                style={{ backgroundImage: `url(${option.url})` }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 px-2 py-1 rounded">
                  {option.name}
                </span>
              </div>
              {background === option.url && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-sm">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BackgroundSelector;
