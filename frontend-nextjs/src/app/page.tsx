'use client';

import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import ProcessingProgress from '@/components/ProcessingProgress';
import ImageComparison from '@/components/ImageComparison';
import { BackgroundRemoverAPI } from '@/lib/api';
import Footer from '@/components/Footer';

type ProcessingState = 'idle' | 'processing' | 'completed' | 'error';

export default function Home() {
  const [state, setState] = useState<ProcessingState>('idle');
  const [originalImage, setOriginalImage] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [backendHealthy, setBackendHealthy] = useState<boolean>(false);

  useEffect(() => {
    BackgroundRemoverAPI.healthCheck().then(setBackendHealthy);
  }, []);

  const handleFileSelect = async (file: File) => {
    try {
      setState('processing');
      setError('');
      
      const originalUrl = URL.createObjectURL(file);
      setOriginalImage(originalUrl);

      const result = await BackgroundRemoverAPI.removeBackground(file);
      
      if (result.success && result.image && result.filename) {
        setProcessedImage(result.image);
        setFilename(result.filename);
        setState('completed');
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleNewImage = () => {
    setState('idle');
    setOriginalImage('');
    setProcessedImage('');
    setFilename('');
    setError('');
  };

  const handleRetry = () => {
    setState('idle');
    setError('');
  };

  if (!backendHealthy) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full mx-4">
            <h1 className="text-2xl font-bold text-card-foreground mb-4">Backend Unavailable</h1>
            <p className="text-muted-foreground mb-4">
              The backend server is not responding. Please make sure it is running on port 5000.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Retry Connection
            </button>
          </div>
        </div>
        {/* Footer for error state */}
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              CleanLayer
            </h1>
            <p className="text-l text-muted-foreground">
              Say goodbye to your background — let&apos;s make it disappear!
            </p>
          </header>

          <main className="bg-card border border-border rounded-2xl shadow-2xl p-6 md:p-8 max-w-4xl mx-auto">
            {state === 'idle' && (
              <FileUpload
                onFileSelect={handleFileSelect}
                isProcessing={false}
              />
            )}

            {state === 'processing' && (
              <>
                {originalImage && (
                  <div className="mb-6">
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full max-h-64 object-contain bg-muted rounded-lg"
                    />
                  </div>
                )}
                <ProcessingProgress isVisible={true} />
              </>
            )}

            {state === 'completed' && (
              <ImageComparison
                originalImage={originalImage}
                processedImage={processedImage}
                filename={filename}
                onNewImage={handleNewImage}
              />
            )}

            {state === 'error' && (
              <div className="text-center py-8">
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Error</h3>
                  <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
