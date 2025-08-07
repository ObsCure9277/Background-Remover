'use client';

import { useState } from 'react';
import { Download, Settings, X, FileImage, RotateCcw } from 'lucide-react'; // Add RotateCcw

interface ExportOptionsProps {
  onExport: (options: ExportSettings) => void;
  isExporting?: boolean;
  onNewImage?: () => void; // Add this prop
}

interface ExportSettings {
  width?: number;
  height?: number;
  format: 'png' | 'jpg' | 'webp';
  quality?: number;
  maintainAspectRatio: boolean;
}

export default function ExportOptions({ onExport, isExporting = false, onNewImage }: ExportOptionsProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'png',
    quality: 90,
    maintainAspectRatio: true,
  });

  const formatOptions = [
    { value: 'png', label: 'PNG', description: 'Best for transparency' },
    { value: 'jpg', label: 'JPG', description: 'Smaller file size' },
    { value: 'webp', label: 'WebP', description: 'Modern format' },
  ];

  const presetSizes = [
    { label: 'Original', width: undefined, height: undefined },
    { label: 'HD (1280×720)', width: 1280, height: 720 },
    { label: 'Full HD (1920×1080)', width: 1920, height: 1080 },
    { label: '4K (3840×2160)', width: 3840, height: 2160 },
    { label: 'Square (1080×1080)', width: 1080, height: 1080 },
    { label: 'Portrait (1080×1350)', width: 1080, height: 1350 },
  ];

  const handleExport = () => {
    onExport(settings);
    setShowOptions(false);
  };

  const handleQuickExport = () => {
    onExport({ format: 'png', maintainAspectRatio: true });
  };

  const handlePresetSelect = (preset: typeof presetSizes[0]) => {
    setSettings(prev => ({
      ...prev,
      width: preset.width,
      height: preset.height,
    }));
  };

  if (!showOptions) {
    return (
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => setShowOptions(true)}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl font-medium min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed border-3 border-blue-500 hover:border-blue-600"
        >
          <Settings size={20} />
          <span>Custom Export</span>
        </button>

        <button
          onClick={handleQuickExport}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl font-medium min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed border-3 border-green-500 hover:border-green-600"
        >
          <Download size={20} />
          <span>{isExporting ? 'Exporting...' : 'Quick Download (PNG)'}</span>
        </button>

        {onNewImage && (
          <button
            onClick={onNewImage}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl font-medium min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed border-3 border-violet-500 hover:border-violet-600"
          >
            <RotateCcw size={20} />
            <span>Process New Image</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Export Options</h3>
        <button
          onClick={() => setShowOptions(false)}
          className="p-2 hover:bg-secondary rounded-lg transition-colors border-2 border-red-400 hover:border-red-500"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Format Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">File Format</label>
          <div className="grid gap-2">
            {formatOptions.map((format) => (
              <label
                key={format.value}
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  settings.format === format.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-secondary/50'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={format.value}
                  checked={settings.format === format.value}
                  onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value as 'png' | 'jpg' | 'webp' }))}
                  className="sr-only"
                />
                <FileImage size={16} className="text-muted-foreground" />
                <div>
                  <div className="font-medium text-foreground">{format.label}</div>
                  <div className="text-xs text-muted-foreground">{format.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Size Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Size Presets</label>
          <div className="grid gap-2">
            {presetSizes.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetSelect(preset)}
                className={`p-3 text-left border rounded-lg transition-colors ${
                  settings.width === preset.width && settings.height === preset.height
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-secondary/50'
                }`}
              >
                <div className="font-medium text-foreground">{preset.label}</div>
                {preset.width && preset.height && (
                  <div className="text-xs text-muted-foreground">
                    {preset.width} × {preset.height} pixels
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Dimensions */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Custom Dimensions</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Width (px)</label>
            <input
              type="number"
              placeholder="Auto"
              value={settings.width || ''}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                width: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Height (px)</label>
            <input
              type="number"
              placeholder="Auto"
              value={settings.height || ''}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                height: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.maintainAspectRatio}
            onChange={(e) => setSettings(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
            className="rounded border-border text-primary focus:ring-primary/50"
          />
          <span className="text-sm text-foreground">Maintain aspect ratio</span>
        </label>
      </div>

      {/* Quality Setting (for JPG and WebP) */}
      {(settings.format === 'jpg' || settings.format === 'webp') && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Quality: {settings.quality}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={settings.quality}
            onChange={(e) => setSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Smaller file</span>
            <span>Better quality</span>
          </div>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-primary-foreground border-2 border-blue-500 rounded-lg hover:bg-primary/90 hover:border-purple-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        <Download size={20} />
        <span>{isExporting ? 'Exporting...' : `Export as ${settings.format.toUpperCase()}`}</span>
      </button>
    </div>
  );
}