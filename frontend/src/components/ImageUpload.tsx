import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, AlertCircle } from "lucide-react";

interface ImageUploadProps {
  file: File | null;
  setFile: (file: File | null) => void;
  processing: boolean;
  clearFile: () => void;
  handleRemoveBg: () => void;
  error: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  file,
  setFile,
  processing,
  clearFile,
  handleRemoveBg,
  error,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const f = acceptedFiles[0];
      if (f) {
        console.log("File uploaded:", f);
        setFile(f);
      } else {
        console.error("No valid file selected.");
      }
    },
    [setFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDropRejected: (fileRejections) => {
      console.error("File rejected:", fileRejections);
      alert("Invalid file. Please upload an image under 10MB.");
    },
  });

  return (
    <div className="upload-container">
      <h3 className="section-title">
        <span className="step-number">1</span>
        Upload Image
      </h3>

      {!file ? (
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? "dropzone-active" : ""}`}
        >
          <input {...getInputProps()} />
          <Upload className="upload-icon" size={56} />
          <h3 className="dropzone-title">
            {isDragActive
              ? "Drop your image here"
              : "Drag & drop or click to upload"}
          </h3>
          <p className="dropzone-subtitle">
            PNG, JPG, JPEG, GIF, BMP, WEBP • Max 10MB
          </p>
        </div>
      ) : (
        <div className="file-selected">
          <div className="file-info">
            <div className="file-name">
              <span className="file-icon">📁</span>
              <span className="file-text">{file.name}</span>
            </div>
            <div className="file-size">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          <div className="action-buttons">
            <button
              onClick={clearFile}
              className="button-secondary"
              disabled={processing}
            >
              Change Image
            </button>
            <button
              onClick={handleRemoveBg}
              className="button-primary"
              disabled={processing}
            >
              {processing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="button-icon">✨</span>
                  Remove Background
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
