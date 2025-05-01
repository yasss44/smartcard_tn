import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';

interface ColorPickerProps {
  colors: {
    background: string;
    text: string;
    button: string;
  };
  onChange: (colors: {
    background: string;
    text: string;
    button: string;
  }) => void;
}

const ColorPicker = ({ colors, onChange }: ColorPickerProps) => {
  const [activeColorType, setActiveColorType] = useState<'background' | 'text' | 'button'>('background');

  const handleColorChange = (color: string) => {
    onChange({
      ...colors,
      [activeColorType]: color,
    });
  };

  const colorOptions = [
    { type: 'background', label: 'Accent Color', color: colors.background },
    { type: 'text', label: 'Text Color', color: colors.text },
    { type: 'button', label: 'Button Color', color: colors.button },
  ] as const; // Use 'as const' for stricter typing

  return (
    <div className="mt-6 bg-gray-50 p-6 rounded-xl shadow-inner space-y-6">
      <h3 className="text-lg font-manrope font-semibold flex items-center text-gray-800">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </div>
        <span>Color Scheme</span>
        <span className="ml-2 text-xs text-gray-500 font-normal">Customize your card's colors</span>
      </h3>

      {/* Color Type Selection */}
      <div className="grid grid-cols-3 gap-4">
        {colorOptions.map(({ type, label, color }) => (
          <button
            key={type}
            onClick={() => setActiveColorType(type)}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 ease-in-out ${activeColorType === type ? 'border-blue-500 bg-blue-50 scale-105 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
          >
            <div
              className="w-8 h-8 rounded-full mb-2 border border-gray-300 shadow-sm"
              style={{ backgroundColor: color }}
            />
            <span className={`text-xs font-medium ${activeColorType === type ? 'text-blue-700' : 'text-gray-600'}`}>{label}</span>
          </button>
        ))}
      </div>

      {/* Color Picker and Input */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex-shrink-0">
          <HexColorPicker
            color={colors[activeColorType]}
            onChange={handleColorChange}
            className="!w-40 !h-40"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {colorOptions.find(opt => opt.type === activeColorType)?.label} Hex Code
          </label>
          <input
            type="text"
            value={colors[activeColorType]}
            onChange={(e) => handleColorChange(e.target.value)} // Basic validation could be added here
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="#RRGGBB"
          />
           {/* Preset Colors for the active type */}
           <div className="mt-4">
             <h4 className="text-xs font-medium text-gray-500 mb-2">Presets</h4>
             <div className="grid grid-cols-6 gap-2">
               {[ '#f06292', '#ec407a', '#e91e63', '#d81b60', '#c2185b', '#ad1457', '#880e4f', '#ff80ab', '#ff4081', '#f50057', '#c51162', '#f8bbd0'].map((presetColor) => (
                 <button
                   key={presetColor}
                   onClick={() => handleColorChange(presetColor)}
                   className="w-8 h-8 rounded-full border border-gray-200 hover:scale-110 transition-all shadow-sm"
                   style={{ backgroundColor: presetColor }}
                   aria-label={`Select color ${presetColor}`}
                 />
               ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
