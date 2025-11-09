/**
 * Image Enhancement Service for Receipt Processing
 * Enhances faded/light receipts for better readability
 */

export class ImageEnhancer {
  /**
   * Enhance a receipt image for better visibility
   * Applies contrast, brightness, and sharpening adjustments
   */
  async enhanceReceipt(imageBlob: Blob): Promise<Blob> {
    try {
      // Create image element
      const img = new Image();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      return new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
            // Create canvas for image processing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              throw new Error('Failed to get canvas context');
            }
            
            // Set canvas size to image size
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw original image
            ctx.drawImage(img, 0, 0);
            
            // Get image data for processing
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Apply image enhancements
            this.applyAutoLevels(data);
            this.adjustContrast(data, 1.3); // Increase contrast by 30%
            this.adjustBrightness(data, 1.1); // Increase brightness by 10%
            this.sharpen(imageData, ctx, canvas.width, canvas.height);
            
            // Put processed image back
            ctx.putImageData(imageData, 0, 0);
            
            // Convert to blob
            canvas.toBlob((blob) => {
              URL.revokeObjectURL(imageUrl);
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert canvas to blob'));
              }
            }, 'image/jpeg', 0.95); // High quality JPEG
          } catch (error) {
            URL.revokeObjectURL(imageUrl);
            reject(error);
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          reject(new Error('Failed to load image'));
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Image enhancement failed:', error);
      // Return original if enhancement fails
      return imageBlob;
    }
  }
  
  /**
   * Apply auto-levels to normalize the image histogram
   */
  private applyAutoLevels(data: Uint8ClampedArray) {
    // Find min and max values for each channel
    let minR = 255, maxR = 0;
    let minG = 255, maxG = 0;
    let minB = 255, maxB = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      minR = Math.min(minR, data[i]);
      maxR = Math.max(maxR, data[i]);
      minG = Math.min(minG, data[i + 1]);
      maxG = Math.max(maxG, data[i + 1]);
      minB = Math.min(minB, data[i + 2]);
      maxB = Math.max(maxB, data[i + 2]);
    }
    
    // Apply level adjustments
    for (let i = 0; i < data.length; i += 4) {
      data[i] = this.stretchValue(data[i], minR, maxR);
      data[i + 1] = this.stretchValue(data[i + 1], minG, maxG);
      data[i + 2] = this.stretchValue(data[i + 2], minB, maxB);
    }
  }
  
  /**
   * Stretch pixel values to full range
   */
  private stretchValue(value: number, min: number, max: number): number {
    if (max === min) return value;
    return Math.round(((value - min) / (max - min)) * 255);
  }
  
  /**
   * Adjust image contrast
   */
  private adjustContrast(data: Uint8ClampedArray, factor: number) {
    const adjust = (value: number) => {
      return Math.round(((value / 255 - 0.5) * factor + 0.5) * 255);
    };
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, adjust(data[i])));
      data[i + 1] = Math.max(0, Math.min(255, adjust(data[i + 1])));
      data[i + 2] = Math.max(0, Math.min(255, adjust(data[i + 2])));
    }
  }
  
  /**
   * Adjust image brightness
   */
  private adjustBrightness(data: Uint8ClampedArray, factor: number) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] * factor));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * factor));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * factor));
    }
  }
  
  /**
   * Apply sharpening filter to enhance edges
   */
  private sharpen(imageData: ImageData, ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Simple sharpening kernel
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    
    const side = Math.round(Math.sqrt(kernel.length));
    const halfSide = Math.floor(side / 2);
    
    const src = imageData.data;
    const output = new Uint8ClampedArray(src.length);
    
    // Apply convolution
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dstIdx = (y * width + x) * 4;
        let r = 0, g = 0, b = 0;
        
        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = y + cy - halfSide;
            const scx = x + cx - halfSide;
            
            if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
              const srcIdx = (scy * width + scx) * 4;
              const weight = kernel[cy * side + cx];
              
              r += src[srcIdx] * weight;
              g += src[srcIdx + 1] * weight;
              b += src[srcIdx + 2] * weight;
            }
          }
        }
        
        output[dstIdx] = Math.max(0, Math.min(255, r));
        output[dstIdx + 1] = Math.max(0, Math.min(255, g));
        output[dstIdx + 2] = Math.max(0, Math.min(255, b));
        output[dstIdx + 3] = src[dstIdx + 3]; // Keep alpha
      }
    }
    
    // Copy output back to imageData
    for (let i = 0; i < src.length; i++) {
      src[i] = output[i];
    }
  }
  
  /**
   * Add a digital stamp/watermark to the receipt
   */
  async stampReceipt(
    imageBlob: Blob,
    stampData: {
      userName: string;
      date: string;
      jobNumber: string;
      costCode: string;
      status?: string;
    }
  ): Promise<Blob> {
    try {
      const img = new Image();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      return new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              throw new Error('Failed to get canvas context');
            }
            
            // Set canvas size
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw original image
            ctx.drawImage(img, 0, 0);
            
            // Add semi-transparent stamp overlay
            const stampHeight = 120;
            const stampWidth = 300;
            const margin = 20;
            
            // Position stamp at top-right
            const stampX = canvas.width - stampWidth - margin;
            const stampY = margin;
            
            // Draw stamp background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(stampX, stampY, stampWidth, stampHeight);
            
            // Draw stamp border
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(stampX, stampY, stampWidth, stampHeight);
            
            // Add stamp text
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('FIELDFORGE RECEIPT', stampX + 10, stampY + 25);
            
            ctx.font = '12px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`User: ${stampData.userName}`, stampX + 10, stampY + 45);
            ctx.fillText(`Date: ${stampData.date}`, stampX + 10, stampY + 65);
            ctx.fillText(`Job: ${stampData.jobNumber}`, stampX + 10, stampY + 85);
            ctx.fillText(`Code: ${stampData.costCode}`, stampX + 10, stampY + 105);
            
            // Add status if provided
            if (stampData.status) {
              ctx.fillStyle = stampData.status === 'APPROVED' ? '#00ff00' : '#ffaa00';
              ctx.font = 'bold 12px Arial';
              ctx.fillText(stampData.status, stampX + stampWidth - 80, stampY + 105);
            }
            
            // Convert to blob
            canvas.toBlob((blob) => {
              URL.revokeObjectURL(imageUrl);
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert canvas to blob'));
              }
            }, 'image/jpeg', 0.95);
          } catch (error) {
            URL.revokeObjectURL(imageUrl);
            reject(error);
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          reject(new Error('Failed to load image'));
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Failed to stamp receipt:', error);
      return imageBlob;
    }
  }
}

export const imageEnhancer = new ImageEnhancer();
