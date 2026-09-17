import { useState, useRef, useCallback } from 'react';
import { FiUploadCloud, FiLink, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { API_BASE } from '../../../context/PortfolioContext';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
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
    setProgress(10);

    // Validate on client side
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only JPEG, PNG, GIF, WebP, SVG allowed.');
      setUploading(false);
      setProgress(0);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File too large. Maximum 5MB allowed.');
      setUploading(false);
      setProgress(0);
      return;
    }

    setProgress(30);

    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('image', file);

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise<{ success: boolean; url?: string; error?: string; originalName?: string }>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 70) + 30; // 30-100%
            setProgress(pct);
          }
        });

        xhr.addEventListener('load', () => {
          try {
            const response = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && response.success) {
              resolve(response);
            } else {
              resolve({ success: false, error: response.error || 'Upload failed' });
            }
          } catch {
            resolve({ success: false, error: 'Invalid server response' });
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

        xhr.open('POST', `${API_BASE}/api/admin/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

      const result = await uploadPromise;

      if (result.success && result.url) {
        setProgress(100);
        onChange(result.url);
        setUploadedFileName(result.originalName || file.name);
        setUploadError(null);
      } else {
        setUploadError(result.error || 'Upload failed');
        setProgress(0);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
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
