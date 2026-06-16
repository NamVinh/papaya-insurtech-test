import { useRef, useState } from 'react';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({ label, required, docKey, files, onAdd, onRemove }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [typeError, setTypeError] = useState('');

  async function handleFiles(fileList) {
    const file = fileList[0];
    if (!file) return;

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setTypeError('Only PDF, JPG, or PNG files are allowed.');
      return;
    }
    setTypeError('');

    // Validate size
    if (file.size > MAX_SIZE) {
      setTypeError('File exceeds 10 MB limit.');
      return;
    }

    // Simulate upload progress
    setUploading(true);
    setProgress(0);
    await new Promise((resolve) => {
      let p = 0;
      const iv = setInterval(() => {
        p += Math.random() * 25 + 10;
        if (p >= 100) {
          clearInterval(iv);
          setProgress(100);
          resolve();
        } else {
          setProgress(Math.round(p));
        }
      }, 120);
    });
    setUploading(false);
    onAdd(docKey, { name: file.name, size: file.size, type: file.type });
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  const uploaded = files[docKey] || null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {required ? (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
            Required
          </span>
        ) : (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
            Optional
          </span>
        )}
      </div>

      {uploaded ? (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 min-w-0">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-gray-700 truncate">{uploaded.name}</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{formatSize(uploaded.size)}</span>
          </div>
          <button
            onClick={() => onRemove(docKey)}
            className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0 focus:outline-none"
            aria-label="Remove file"
          >
            ✕
          </button>
        </div>
      ) : uploading ? (
        <div className="p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Uploading...</span>
            <span className="text-xs text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500">
            <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG · max 10 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_EXT.join(',')}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}
      {typeError && <p className="text-red-500 text-xs mt-1">{typeError}</p>}
    </div>
  );
}
