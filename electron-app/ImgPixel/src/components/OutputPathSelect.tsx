/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface OutputPathSelectProps {
  onSelect: (path: string) => void;
}

const OutputPathSelect: React.FC<OutputPathSelectProps> = ({ onSelect }) => {
  const handleSelectPath = async () => {
    const folderPath = await (window as any).electron?.ipcRenderer?.invoke(
      "select-output-folder"
    );
    if (folderPath) {
      onSelect(folderPath);
    }
  };

  return (
    <div style={{ marginTop: 16, textAlign: "left" }}>
      <button
        style={{
          padding: "12px 24px",
          borderRadius: "8px",
          border: "2px solid var(--border-color)",
          background: "var(--button-bg-color)",
          color: "var(--text-color)",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "4px 4px 0 var(--shadow-color)",
          transition: "background-color 0.3s, transform 0.2s, box-shadow 0.3s",
        }}
        onClick={handleSelectPath}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor =
            "var(--button-hover-bg-color)";
          (e.target as HTMLButtonElement).style.color = "var(--text-color)";
          (e.target as HTMLButtonElement).style.transform = "translate(-2px, -2px)";
          (e.target as HTMLButtonElement).style.boxShadow = "6px 6px 0 var(--shadow-color)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "var(--button-bg-color)";
          (e.target as HTMLButtonElement).style.color = "var(--text-color)";
          (e.target as HTMLButtonElement).style.transform = "translate(0, 0)";
          (e.target as HTMLButtonElement).style.boxShadow = "4px 4px 0 var(--shadow-color)";
        }}
      >
        Choose Output Path
      </button>
    </div>
  );
};

export default OutputPathSelect;