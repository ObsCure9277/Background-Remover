'use client';

import { useEffect, useState } from 'react';

interface ProcessingProgressProps {
  isVisible: boolean;
}

export default function ProcessingProgress({ isVisible }: ProcessingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 15;
        const newProgress = prev + increment;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="text-center py-8">
      <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
        <div
          className="bg-white h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-gray-600">Processing your image...</p>
    </div>
  );
}