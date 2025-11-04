import React from "react";
import { ImgComparisonSlider } from "@img-comparison-slider/react";

interface ImageComparisonProps {
  originalImage: string | null;
  processedImage: string | null;
}

const ImageComparison: React.FC<ImageComparisonProps> = ({
  originalImage,
  processedImage,
}) => {
  if (!originalImage && !processedImage) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🖼️</div>
        <h3 className="empty-state-title">No Image Yet</h3>
        <p className="empty-state-text">
          Upload an image and remove its background to see the comparison here
        </p>
      </div>
    );
  }

  if (originalImage && !processedImage) {
    return (
      <div className="preview-single">
        <div className="preview-label">Original Image</div>
        <img
          src={originalImage}
          alt="Original"
          className="preview-image"
        />
        <p className="preview-hint">
          Click "Remove Background" to process your image
        </p>
      </div>
    );
  }

  return (
    <div className="comparison-wrapper">
      <div className="comparison-labels">
        <span className="label-original">Original</span>
        <span className="label-processed">Background Removed</span>
      </div>
      <div className="comparison-slider">
        <ImgComparisonSlider>
          <img
            slot="first"
            src={originalImage!}
            alt="Original"
            className="comparison-image"
          />
          <img
            slot="second"
            src={processedImage!}
            alt="Processed"
            className="comparison-image"
          />
        </ImgComparisonSlider>
      </div>
      <p className="comparison-hint">Drag the slider to compare</p>
    </div>
  );
};

export default ImageComparison;
