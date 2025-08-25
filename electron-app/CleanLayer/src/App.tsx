/* eslint-disable @typescript-eslint/no-explicit-any */
import "./App.css";
import OutputFolderSelect from "./components/OutputPathSelect";
import Export from "./components/Export";
import ImageUpload from "./components/ImageUpload";
import ImageComparizon from "./components/ImageComparizon";
import { useState } from "react";

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
        background: "#2e2e2e",
      }}
    >
      {/* Left Side - 40% */}
      <div
        style={{
          flex: "1 1 40%", // Adjusted to 40%
          background: "#2e2e2e",
          borderRight: "6px solid #ff6f20",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "32px 24px",
          color: "#f1f1f1",
        }}
      >
        <h2
          style={{
            fontWeight: "bold",
            fontSize: "2rem",
            color: "#ff6f20",
            marginBottom: "32px",
            alignSelf: "flex-start",
            letterSpacing: "2px",
            textShadow: "2px 2px 0 #bec3c7",
          }}
        >
          CleanLayer
        </h2>
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
              color: "#f1f1f1",
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
                  color: "#ff6f20",
                  textAlign: "left",
                }}
              >
                Output folder:{" "}
                <span style={{ fontWeight: "bold", color: "#f1f1f1" }}>
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
          flex: "1 1 60%", // Adjusted to 60%
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2e2e2e",
          height: "100%",
        }}
      >
        <ImageComparizon
          originalImage={uploadedFilePath ? `file://${uploadedFilePath}` : null} // Use the uploaded file path
          processedImage={resultPath ? `file://${resultPath}` : null}
        />
      </div>
    </div>
  );
}

export default App;
