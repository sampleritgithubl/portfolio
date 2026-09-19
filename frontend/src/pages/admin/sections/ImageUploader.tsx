import { useState, useRef, useCallback } from 'react';
import { FiUploadCloud, FiLink, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { API_BASE } from '../../../context/PortfolioContext';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

// Client-side image compression to lightweight, high-quality WebP Data URL
function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<{ dataUrl: string; sizeKb: number }> {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: reader.result as string, sizeKb: Math.round(file.size / 1024) });
      reader.onerror = () => reject(new Error('Failed to read SVG file'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: e.target?.result as string, sizeKb: Math.round(file.size / 1024) });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP (fallback to JPEG if browser does not support WebP encoding)
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
        resolve({ dataUrl, sizeKb });
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function ImageUploader({ value, onChange, label = 'Cover Image' }: ImageUploaderProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError(null);
    setProgress(15);

    // Validate on client side
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only JPEG, PNG, GIF, WebP, SVG allowed.');
      setUploading(false);
      setProgress(0);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('File too large. Maximum 8MB allowed.');
      setUploading(false);
      setProgress(0);
      return;
    }

    try {
      setProgress(40);

      // 1. Convert to optimized WebP Data URL (guarantees permanent persistence even if backend sleeps/restarts)
      const { dataUrl, sizeKb } = await compressImage(file);
      setProgress(75);

      // 2. Immediately set the Data URL so it is permanently saved in the portfolio data
      onChange(dataUrl);
      setUploadedFileName(`${file.name} (Optimized WebP • ${sizeKb} KB)`);
      setProgress(90);

      // 3. Also upload raw file to backend (if Cloudinary is configured, use the permanent CDN URL)
      try {
        const token = localStorage.getItem('adminToken');
        if (token) {
          const formData = new FormData();
          formData.append('image', file);
          const uploadRes = await fetch(`${API_BASE}/api/admin/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          });
          if (uploadRes.ok) {
            const uploadJson = await uploadRes.json();
            if (uploadJson.provider === 'cloudinary' && uploadJson.url) {
              onChange(uploadJson.url);
              setUploadedFileName(`${file.name} (Cloudinary CDN Permanent)`);
            }
          }
        }
      } catch (_) {}

      setProgress(100);
      setUploadError(null);
    } catch (err: any) {
      setUploadError(err.message || 'Image upload failed');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [uploadFile]);

  const handleRemovePreview = () => {
    onChange('');
    setUploadedFileName(null);
    setProgress(0);
    setUploadError(null);
  };

  return (
    <div className="img-uploader-wrapper">
      <label className="admin-label">{label}</label>

      {/* Tab Toggle */}
      <div className="img-uploader-tabs">
        <button
          type="button"
          className={`img-uploader-tab ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => setMode('upload')}
        >
          <FiUploadCloud size={15} />
          Upload File
        </button>
        <button
          type="button"
          className={`img-uploader-tab ${mode === 'url' ? 'active' : ''}`}
          onClick={() => setMode('url')}
        >
          <FiLink size={14} />
          Paste URL
        </button>
      </div>

      {/* Upload Mode */}
      {mode === 'upload' && (
        <>
          <div
            className={`img-upload-dropzone ${dragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="img-upload-icon">
              <FiUploadCloud />
            </span>
            <div className="img-upload-text">
              <strong>Click to upload</strong> or drag and drop
            </div>
            <div className="img-upload-hint">
              PNG, JPG, GIF, WebP, SVG — Max 5MB
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="img-upload-input"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              onChange={handleFileSelect}
            />
          </div>

          {/* Progress */}
          {uploading && (
            <>
              <div className="img-upload-progress">
                <div className="img-upload-progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <div className="img-upload-status">
                <span className="img-upload-spinner" />
                Uploading... {progress}%
              </div>
            </>
          )}

          {/* Upload Error */}
          {uploadError && (
            <div className="img-upload-status error">
              <FiAlertCircle size={14} />
              {uploadError}
            </div>
          )}

          {/* Success indicator */}
          {!uploading && !uploadError && progress === 100 && uploadedFileName && (
            <div className="img-upload-status">
              <FiCheck size={14} />
              Uploaded: {uploadedFileName}
            </div>
          )}
        </>
      )}

      {/* URL Mode */}
      {mode === 'url' && (
        <input
          type="url"
          className="admin-input"
          placeholder="https://images.unsplash.com/..."
          value={value || ''}
          onChange={(e) => {
            onChange(e.target.value);
            setUploadedFileName(null);
          }}
        />
      )}

      {/* Image Preview */}
      {value && (
        <div className="img-preview-area">
          <img
            src={value}
            alt="Preview"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
            onLoad={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'block';
            }}
          />
          <button
            type="button"
            className="img-preview-remove"
            onClick={handleRemovePreview}
            title="Remove image"
          >
            <FiX size={14} />
          </button>
          <div className="img-preview-filename">
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
              {uploadedFileName || value}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
