const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiResponse {
  success: boolean;
  image?: string;
  filename?: string;
  error?: string;
}

export interface ExportOptions {
  width?: number;
  height?: number;
  format: 'png' | 'jpg' | 'webp';
  quality?: number;
  maintainAspectRatio: boolean;
}

export class BackgroundRemoverAPI {
  static async removeBackground(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/remove-background`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process image');
    }

    return response.json();
  }

  static async downloadFile(filename: string, options?: ExportOptions): Promise<Blob> {
    const url = new URL(`${API_BASE_URL}/download/${filename}`);
    
    if (options) {
      if (options.width) url.searchParams.set('width', options.width.toString());
      if (options.height) url.searchParams.set('height', options.height.toString());
      if (options.format) url.searchParams.set('format', options.format);
      if (options.quality) url.searchParams.set('quality', options.quality.toString());
      if (options.maintainAspectRatio !== undefined) {
        url.searchParams.set('maintainAspectRatio', options.maintainAspectRatio.toString());
      }
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return response.blob();
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}