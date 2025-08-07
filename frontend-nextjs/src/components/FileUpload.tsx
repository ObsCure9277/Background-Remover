'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage, AlertCircle } from 'lucide-react';

<link rel="icon" href="../icon.png"></link>;

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: unknown[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0] as { errors: { code: string }[] };
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File size must be less than 10MB');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Please upload a valid image file');
      } else {
        setError('Invalid file. Please try again.');
      }
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: isProcessing
  });

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setError(null);
  };

  if (preview) {
    return (
      <div className="w-full space-y-4 animate-fade-in">
        <div className="relative group">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-80 object-contain rounded-lg"
            />
            <button
              onClick={clearPreview}
              className="absolute top-6 right-6 p-2 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
              disabled={isProcessing}
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <FileImage size={16} />
              <span>Ready to process</span>
            </div>
            {!isProcessing && (
              <button
                onClick={clearPreview}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Choose different image
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 group
          ${isDragActive 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border hover:border-primary/50 hover:bg-accent/50'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-destructive bg-destructive/5' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-6">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
            isDragActive ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground'
          }`}>
            <Upload className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              {isDragActive ? 'Drop your image here' : 'Upload your image'}
            </h3>
            <p className="text-muted-foreground">
              Drag and drop your image here, or{' '}
              <span className="text-primary font-medium hover:underline">
                click to browse
              </span>
            </p>
          </div>
          
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground">
            <FileImage size={16} />
            <span>PNG, JPG, JPEG, GIF, BMP, WEBP • Max 10MB</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="flex items-center space-x-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive animate-slide-up">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}