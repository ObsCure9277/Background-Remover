import "./App.css";
import Export from "./components/Export";
import ImageUpload from "./components/ImageUpload";
import ImageComparison from "./components/ImageComparison";
import { useState } from "react";

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL || "http://localhost:8000";

function App() {
  const [exportOptions, setExportOptions] = useState<{
    format: string;
    resolution: string;
  }>({
    format: "png",
    resolution: "original",
  });
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedFilename, setProcessedFilename] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExportOptionsChange = (options: { format: string; resolution: string }) => {
    setExportOptions(options);
  };

  // Clear the selected file
  const clearFile = () => {
    setFile(null);
    if (processedImageUrl) {
      URL.revokeObjectURL(processedImageUrl);
    }
    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl);
    }
    setProcessedImageUrl(null);
    setOriginalImageUrl(null);
    setProcessedFilename(null);
    setError(null);
  };

  // Handle file upload and set preview
  const handleFileUpload = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setOriginalImageUrl(imageUrl);
    setFile(file);
    setProcessedImageUrl(null);
    setProcessedFilename(null);
    setError(null);
  };

  // Remove background using API
  const handleRemoveBg = async () => {
    if (!file) {
      setError("Please select an image.");
      return;
    }
    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("resolution", exportOptions.resolution);

      const response = await fetch(`${API_BASE_URL}/api/remove-background`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Background removal failed");
      }

      const result = await response.json();
      setProcessedFilename(result.output_file);

      // Set the processed image URL for preview
      const processedUrl = `${API_BASE_URL}/api/download/${result.output_file}`;
      setProcessedImageUrl(processedUrl);
    } catch (err: unknown) {
      console.error("Background removal failed:", err);
      setError("Background removal failed. Please try again.");
    }
    setProcessing(false);
  };

  // Download the processed image
  const handleDownloadImage = async () => {
    if (!processedFilename) {
      setError("Please process an image first.");
      return;
    }

    try {
      const downloadUrl = `${API_BASE_URL}/api/download/${processedFilename}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `processed_image_${exportOptions.resolution}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading image:", err);
      setError("Failed to download the image. Please try again.");
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <img
            src="/imgPixel.png"
            alt="ImgPixel Logo"
            className="logo-image"
          />
          <div className="logo-text-container">
            <h1 className="logo-text-green">Img</h1>
            <h1 className="logo-text-white">Pixel</h1>
          </div>
        </div>
        <p className="tagline">Remove backgrounds with AI • Fast & Free</p>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Panel - Controls */}
        <aside className="left-panel">
          <div className="control-section">
            <ImageUpload
              file={file}
              setFile={(fileOrNull) => {
                if (fileOrNull) {
                  handleFileUpload(fileOrNull);
                } else {
                  clearFile();
                }
              }}
              processing={processing}
              clearFile={clearFile}
              handleRemoveBg={handleRemoveBg}
              error={error}
            />
          </div>

          <div className="control-section">
            <Export
              onExportOptionsChange={handleExportOptionsChange}
              onDownloadImage={handleDownloadImage}
              exportOptions={exportOptions}
              disabled={!processedImageUrl}
            />
          </div>

          {/* Feature List */}
          <div className="features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>High-quality AI removal</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Up to 4K resolution</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Multiple export formats</span>
            </div>
          </div>
        </aside>

        {/* Right Panel - Preview */}
        <main className="right-panel">
          <div className="preview-container">
            <ImageComparison
              originalImage={originalImageUrl}
              processedImage={processedImageUrl}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
