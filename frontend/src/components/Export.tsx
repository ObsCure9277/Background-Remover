import React from "react";

interface ExportProps {
  onExportOptionsChange: (options: { format: string; resolution: string }) => void;
  onDownloadImage: () => void;
  exportOptions: { format: string; resolution: string };
  disabled?: boolean;
}

const Export: React.FC<ExportProps> = ({
  onExportOptionsChange,
  onDownloadImage,
  exportOptions,
  disabled = false,
}) => {
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onExportOptionsChange({ ...exportOptions, format: e.target.value });
  };

  const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onExportOptionsChange({ ...exportOptions, resolution: e.target.value });
  };

  return (
    <div className="export-container">
      <h3 className="section-title">
        <span className="step-number">2</span>
        Export Options
      </h3>

      <div className="export-options">
        <div className="option-group">
          <label className="option-label">Format</label>
          <select
            value={exportOptions.format}
            onChange={handleFormatChange}
            className="select-input"
            disabled={disabled}
          >
            <option value="png">PNG (transparent)</option>
            <option value="jpg">JPG</option>
            <option value="webp">WebP</option>
          </select>
        </div>

        <div className="option-group">
          <label className="option-label">Resolution</label>
          <select
            value={exportOptions.resolution}
            onChange={handleResolutionChange}
            className="select-input"
            disabled={disabled}
          >
            <option value="original">Original</option>
            <option value="hd">HD (1280x720)</option>
            <option value="fullhd">Full HD (1920x1080)</option>
            <option value="4k">4K (3840x2160)</option>
          </select>
        </div>
      </div>

      <button
        onClick={onDownloadImage}
        className="download-button"
        disabled={disabled}
      >
        <span className="button-icon">↓</span>
        Download Image
      </button>
    </div>
  );
};

export default Export;
