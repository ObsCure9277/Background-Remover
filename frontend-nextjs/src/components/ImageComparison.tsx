'use client';

import { useState } from 'react';
import { RotateCcw, CheckCircle, Sparkles } from 'lucide-react';
import { BackgroundRemoverAPI, ExportOptions } from '@/lib/api';
import ExportOptionsComponent from './ExportSetting';

interface ImageComparisonProps {
  originalImage: string;
  processedImage: string;
  filename: string;
  onNewImage: () => void;
}

export default function ImageComparison({ 
  originalImage, 
  processedImage, 
  filename, 
  onNewImage 
}: ImageComparisonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string>('');

  const handleExport = async (options: ExportOptions) => {
    try {
      setIsExporting(true);
      setExportError('');
      
      const blob = await BackgroundRemoverAPI.downloadFile(filename, options);
      
      // Create download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Generate filename with format
      const baseFilename = filename.split('.')[0];
      const extension = options.format === 'jpg' ? 'jpg' : options.format;
      let downloadFilename = `${baseFilename}_processed.${extension}`;
      
      if (options.width && options.height) {
        downloadFilename = `${baseFilename}_${options.width}x${options.height}.${extension}`;
      } else if (options.width) {
        downloadFilename = `${baseFilename}_w${options.width}.${extension}`;
      } else if (options.height) {
        downloadFilename = `${baseFilename}_h${options.height}.${extension}`;
      }
      
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Success Message */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-foreground">Background Removed Successfully!</h3>
          <p className="text-muted-foreground flex items-center justify-center space-x-2">
            <Sparkles size={16} className="text-primary" />
            <span>Your image is ready with a transparent background</span>
          </p>
        </div>
      </div>

      {/* Image Comparison */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <h4 className="text-lg font-semibold text-foreground">Original</h4>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <img
              src={originalImage}
              alt="Original"
              className="w-full max-h-96 object-contain rounded-lg"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h4 className="text-lg font-semibold text-foreground">Background Removed</h4>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm relative overflow-hidden">
            {/* Transparent background pattern */}
            <div 
              className="absolute inset-4 rounded-lg opacity-30"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='%23d1d5db' fill-opacity='0.4'%3e%3crect x='0' y='0' width='10' height='10'/%3e%3crect x='10' y='10' width='10' height='10'/%3e%3c/g%3e%3c/svg%3e")`
              }}
            />
            <img
              src={processedImage}
              alt="Processed"
              className="relative w-full max-h-96 object-contain rounded-lg"
            />
          </div>
        </div>
      </div>
      
      {/* Export Options */}
      <div className="bg-card border border-border rounded-xl p-2">
        <ExportOptionsComponent 
          onExport={handleExport} 
          isExporting={isExporting}
          onNewImage={onNewImage}
        />
        
        {exportError && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-300 text-sm">{exportError}</p>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="text-center p-2 bg-muted/50 rounded-xl border border-border">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Pro Tip:</span> Choose PNG for best quality with transparency, 
          JPG for smaller file sizes, or WebP for the best compression with quality balance.
        </p>
      </div>
    </div>
  );
}