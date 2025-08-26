/* eslint-disable @typescript-eslint/no-explicit-any */
import "./App.css";
import OutputFolderSelect from "./components/OutputPathSelect";
import Export from "./components/Export";
import ImageUpload from "./components/ImageUpload";
import ImageComparison from "./components/ImageComparison";
import { useState } from "react";
import imgPixelLogo from "../public/assets/imgPixel_logo.svg"; // Import the logo

function App() {
  const [outputFolder, setOutputFolder] = useState<string>("");
  const [exportOptions, setExportOptions] = useState<{
    format: string;
    resolution: string;
  }>({
    format: "png",
    resolution: "original",
  });
  const [resultPath, setResultPath] = useState<string | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null); // Path of the uploaded file
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Called when user selects output folder
  const handleOutputFolderSelect = (folder: string) => {
    setOutputFolder(folder);
  };

  const handleExportOptionsChange = (options: { format: string; resolution: string }) => {
    setExportOptions(options);
  };

  // Clear the selected file
  const clearFile = () => {
    setFile(null);
    setResultPath(null);
    setUploadedFilePath(null); // Clear the uploaded file path
    setError(null);
  };

  // Save uploaded file to disk via Electron IPC
  const saveFileToDisk = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Uint8Array.from(new Uint8Array(arrayBuffer));
    const fileName = file.name;
    const electron = (window as any).electron;
    return await electron.ipcRenderer.invoke("save-uploaded-file", buffer, fileName);
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const uploadedPath = await saveFileToDisk(file); // Save the file to disk
      setUploadedFilePath(uploadedPath); // Store the uploaded file path
      setFile(file); // Set the file state
      setResultPath(null); // Clear the processed image path
      setError(null); // Clear any errors
    } catch (err) {
      console.error("Error saving file:", err);
      setError("Failed to save the uploaded file.");
    }
  };

  // Remove background using AI
  const handleRemoveBg = async () => {
    if (!file || !outputFolder) {
      setError("Please select an image and output folder.");
      return;
    }
    setProcessing(true);
    setError(null);

    try {
      const inputPath = uploadedFilePath || (await saveFileToDisk(file)); // Use the uploaded file path

      // Determine output file extension and name
      const ext = exportOptions.format || "png";
      const baseName = inputPath.replace(/\.[^/.]+$/, "");
      const outputPath = `${baseName}_bg_removed.${ext}`;

      // Call Electron IPC to run Python AI
      const result = await (window as any).electron.ipcRenderer.invoke(
        "remove-background",
        inputPath,
        outputPath,
        exportOptions.resolution // Pass the selected resolution
      );
      setResultPath(result);
    } catch (err: any) {
      console.error("Background removal failed:", err);
      setError("Background removal failed. Please try again.");
    }
    setProcessing(false);
  };

  // Download the processed image
  const handleDownloadImage = async () => {
    if (!resultPath || !outputFolder) {
      setError("Please process an image and select an output folder.");
      return;
    }

    try {
      const electron = (window as any).electron;

      // Generate the output file name based on format and resolution
      const fileName = `processed_image_${exportOptions.resolution}.${exportOptions.format}`;
      const outputFilePath = `${outputFolder}/${fileName}`;

      // Use Electron IPC to resize and save the processed image
      await electron.ipcRenderer.invoke(
        "export-image",
        resultPath, // Path to the processed image
        outputFilePath, // Destination path
        exportOptions.resolution // Selected resolution
      );

      alert(`Image downloaded successfully to: ${outputFilePath}`);
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
        background: "var(--background-color)", // Bunker
      }}
    >
      {/* Left Side - 30% */}
      <div
        style={{
          flex: "1 1 30%", // Adjusted to 30%
          background: "var(--background-color)", // Bunker
          borderRight: "6px solid var(--accent-color)", // Jungle Green
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "32px 24px",
          color: "var(--text-color)", // Athens Gray
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
          <img
            src={imgPixelLogo} 
            alt="ImgPixel Logo"
            style={{ width: "48px", height: "48px", marginRight: "12px" }}
          />
          <h2
            style={{
              fontWeight: "bold",
              fontSize: "2rem",
              color: "var(--accent-color)", // Jungle Green
              textShadow: "2px 2px 0 var(--button-bg-color)", // Black
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
        {/* Step 2: Set Output Folder */}
        <div style={{ marginBottom: "32px", width: "100%" }}>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "1.2rem",
              marginBottom: 8,
              color: "var(--text-color)", // Athens Gray
              textAlign: "left",
            }}
          >
            Step 2: Set Output Folder
          </div>
          <div
            style={{
              alignSelf: "flex-start",
            }}
          >
            <OutputFolderSelect onSelect={handleOutputFolderSelect} />
            {outputFolder && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: "0.95rem",
                  color: "var(--accent-color)", // Jungle Green
                  textAlign: "left",
                }}
              >
                Output folder:{" "}
                <span style={{ fontWeight: "bold", color: "var(--text-color)" }}>
                  {outputFolder}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Step 3: Export */}
        <Export
          onExportOptionsChange={handleExportOptionsChange}
          onDownloadImage={handleDownloadImage} // Pass the download handler
          exportOptions={exportOptions}
        />
      </div>
      {/* Right Side - 60% */}
      <div
        style={{
          flex: "1 1 70%", // Adjusted to 60%
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background-color)", // Bunker
          height: "100%",
        }}
      >
        <ImageComparison
          originalImage={uploadedFilePath ? `file://${uploadedFilePath}` : null} // Use the uploaded file path
          processedImage={resultPath ? `file://${resultPath}` : null}
        />
      </div>
    </div>
  );
}

export default App;
