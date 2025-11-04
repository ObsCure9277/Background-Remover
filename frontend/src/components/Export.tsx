import React from "react";

interface ExportProps {
  onExportOptionsChange: (options: { format: string; resolution: string }) => void;
  onDownloadImage: () => void;
  exportOptions: { format: string; resolution: string };
}

const Export: React.FC<ExportProps> = ({
  onExportOptionsChange,
  onDownloadImage,
  exportOptions,
}) => {
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onExportOptionsChange({ ...exportOptions, format: e.target.value });
  };

  const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onExportOptionsChange({ ...exportOptions, resolution: e.target.value });
  };

  return (
    <div style={{ marginTop: 16, textAlign: "left" }}>
      <div
        style={{
          fontWeight: "bold",
          fontSize: "1.2rem",
          marginBottom: 8,
          color: "var(--text-color)",
        }}
      >
        Step 2: Export
      </div>
      <div style={{ marginBottom: 12, color: "var(--accent-color)" }}>
        Choose export format and resolution:
      </div>

      <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label style={{ color: "var(--text-color)", fontWeight: "bold", marginRight: 8 }}>
            Format:
          </label>
          <select
            value={exportOptions.format}
            onChange={handleFormatChange}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "2px solid var(--border-color)",
              background: "var(--button-bg-color)",
              color: "var(--text-color)",
              fontWeight: "bold",
              width: "200px",
            }}
          >
            <option value="png">PNG (transparent)</option>
            <option value="jpg">JPG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label style={{ color: "var(--text-color)", fontWeight: "bold", marginRight: 8 }}>
            Resolution:
          </label>
          <select
            value={exportOptions.resolution}
            onChange={handleResolutionChange}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "2px solid var(--border-color)",
              background: "var(--button-bg-color)",
              color: "var(--text-color)",
              fontWeight: "bold",
              width: "200px",
            }}
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
        style={{
          display: "inline-block",
          background: "var(--accent-color)",
          color: "var(--text-color)",
          border: "2px solid var(--border-color)",
          borderRadius: "6px",
          padding: "8px 18px",
          fontWeight: "bold",
          boxShadow: "2px 2px 0 var(--shadow-color)",
          marginTop: "8px",
          cursor: "pointer",
        }}
      >
        Download Image
      </button>
    </div>
  );
};

export default Export;
