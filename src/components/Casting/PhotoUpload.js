import React, { useState } from 'react';
import { validateFile } from '../../utils/formValidation';

const PhotoUpload = ({
  name,
  label,
  description,
  required = true,
  onChange,
  error
}) => {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file
      const validation = validateFile(file);

      if (validation.valid) {
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
        setFileName(file.name);

        // Pass file to parent component
        onChange(name, file, null);
      } else {
        // Clear preview and pass error to parent
        setPreview(null);
        setFileName('');
        onChange(name, null, validation.error);
      }
    }
  };

  const clearFile = () => {
    setPreview(null);
    setFileName('');
    onChange(name, null, null);
  };

  return (
    <div className="flex flex-col">
      <label className="block mb-2">
        <span className="text-xs font-semibold text-gray-900">
          {label} {required && <span className="text-red-400">*</span>}
        </span>
        {description && (
          <span className="block text-xs text-gray-500 mt-1">{description}</span>
        )}
      </label>

      <div className="flex flex-col items-center">
        {/* Upload Button / Preview */}
        <div className="relative w-full">
          {preview ? (
            <div className="relative group">
              <img
                src={preview}
                alt={label}
                className="w-full aspect-square object-cover rounded border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={clearFile}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="w-full aspect-square border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors bg-gray-50">
              <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs text-gray-500 font-medium">Upload</span>
              <input
                type="file"
                name={name}
                accept="image/jpeg,image/jpg,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* File Info / Error */}
        <div className="w-full mt-2">
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
          {!preview && !error && (
            <p className="text-xs text-gray-400">
              Max 5MB
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
