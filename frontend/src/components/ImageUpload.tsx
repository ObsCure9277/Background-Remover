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
    <div style={{ marginBottom: "10px", width: "100%" }}>
      <div
        style={{
          fontWeight: "bold",
          fontSize: "1.2rem",
          marginBottom: 8,
          color: "var(--text-color)",
          textAlign: "left",
        }}
      >
        Step 1: Select Image
      </div>
      {!file ? (
        <div
          {...getRootProps()}
          style={{
            border: "3px dashed var(--accent-color)",
            background: "var(--button-bg-color)",
            color: "var(--text-color)",
            borderRadius: "16px",
            padding: "48px 16px",
            textAlign: "center",
            marginTop: "24px",
            marginBottom: "24px",
            cursor: "pointer",
            width: "100%",
            maxWidth: "450px",
          }}
        >
          <input {...getInputProps()} />
          <Upload
            style={{
              width: 48,
              height: 48,
              color: "var(--accent-color)",
              marginBottom: 16,
            }}
          />
          <h3
            style={{
              fontWeight: "bold",
              fontSize: "1.3rem",
              color: "var(--text-color)",
            }}
          >
            {isDragActive
              ? "Drop your image here"
              : "Drag and drop or click to select image"}
          </h3>
          <p style={{ color: "var(--accent-color)" }}>
            PNG, JPG, JPEG, GIF, BMP, WEBP • Max 10MB
          </p>
        </div>
      ) : (
        <div style={{ textAlign: "left" }}>
          <p
            style={{
              fontWeight: "bold",
              color: "var(--text-color)",
              marginBottom: "16px",
            }}
          >
            Selected File: {file.name}
          </p>
          <div style={{ marginBottom: "16px" }}>
            <button
              onClick={clearFile}
              style={{
                background: "var(--button-bg-color)",
                color: "var(--text-color)",
                border: "2px solid var(--border-color)",
                borderRadius: "8px",
                fontWeight: "bold",
                padding: "8px 24px",
                marginRight: "12px",
                cursor: "pointer",
              }}
              disabled={processing}
            >
              Choose Different Image
            </button>
            <button
              onClick={handleRemoveBg}
              style={{
                background: "var(--button-bg-color)",
                color: "var(--text-color)",
                border: "2px solid var(--border-color)",
                borderRadius: "8px",
                fontWeight: "bold",
                padding: "8px 24px",
                cursor: "pointer",
              }}
              disabled={processing}
            >
              {processing ? "Processing..." : "Remove Background"}
            </button>
          </div>
        </div>
      )}
      {error && (
        <div
          style={{
            marginTop: 16,
            padding: "12px",
            background: "var(--accent-color)",
            color: "var(--text-color)",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
        >
          <AlertCircle style={{ marginRight: 8 }} />
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
