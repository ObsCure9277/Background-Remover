import "./App.css";
import Export from "./components/Export";
import ImageUpload from "./components/ImageUpload";
import ImageComparison from "./components/ImageComparison";
import { useState } from "react";

const API_BASE_URL = process.env.BACKEND_API_URL || "http://localhost:8000";

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
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "var(--background-color)",
      }}
    >
      {/* Left Side - 30% */}
      <div
        style={{
          flex: "1 1 30%",
          background: "var(--background-color)",
          borderRight: "6px solid var(--accent-color)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "32px 24px",
          color: "var(--text-color)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
          <h2
            style={{
              fontWeight: "bold",
              fontSize: "2rem",
              color: "var(--accent-color)",
              textShadow: "2px 2px 0 var(--button-bg-color)",
            }}
          >
            Img
          </h2>
          <h2
            style={{
              fontWeight: "bold",
              fontSize: "2rem",
              color: "var(--button-text-color)",
              textShadow: "2px 2px 0 var(--button-bg-color)",
            }}
          >
            Pixel
          </h2>
        </div>
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
        {/* Step 2: Export */}
        <Export
          onExportOptionsChange={handleExportOptionsChange}
          onDownloadImage={handleDownloadImage}
          exportOptions={exportOptions}
        />
      </div>
      {/* Right Side - 70% */}
      <div
        style={{
          flex: "1 1 70%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background-color)",
          height: "100%",
        }}
      >
        <ImageComparison
          originalImage={originalImageUrl}
          processedImage={processedImageUrl}
        />
      </div>
    </div>
  );
}

export default App;
