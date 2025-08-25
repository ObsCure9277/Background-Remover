import React from "react";
import { ImgComparisonSlider } from "@img-comparison-slider/react";

interface ImageComparizonProps {
  originalImage: string | null;
  processedImage: string | null;
}

const ImageComparizon: React.FC<ImageComparizonProps> = ({
  originalImage,
  processedImage,
}) => {
  if (!originalImage || !processedImage) {
    return (
      <div style={{ textAlign: "center", color: "var(--accent-color)", fontWeight: "bold" }}>
        <p>Please upload an image and process it to compare.</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "800px", maxHeight: "800px", margin: "0 auto" }}>
      <h3
        style={{
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: "16px",
        }}
      >
        Image Comparison
      </h3>
      <ImgComparisonSlider>
        <img
          slot="first"
          src={originalImage}
          alt="Original"
          style={{ width: "100%", height: "auto" }}
        />
        <img
          slot="second"
          src={processedImage}
          alt="Processed"
          style={{ width: "100%", height: "auto" }}
        />
      </ImgComparisonSlider>
    </div>
  );
};

export default ImageComparizon;