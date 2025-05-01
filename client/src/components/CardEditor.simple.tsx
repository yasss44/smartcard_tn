import React from 'react';

interface CardEditorProps {
  initialData?: {
    title: string;
    background: string;
    profilePic: string;
    links: any[];
    colors: {
      background: string;
      text: string;
      button: string;
    };
  };
  onSave: (cardData: any) => void;
}

const CardEditor: React.FC<CardEditorProps> = ({ initialData, onSave }) => {
  const handleSave = () => {
    if (initialData) {
      onSave(initialData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-inter">
      <h1 className="text-white text-center p-4">Card Editor</h1>
      <p className="text-white text-center">This is a simplified version of the card editor.</p>
      <div className="flex justify-center mt-4">
        <button
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Card
        </button>
      </div>
    </div>
  );
};

export default CardEditor;
