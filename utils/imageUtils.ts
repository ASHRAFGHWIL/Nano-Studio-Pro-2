export const downloadImage = (
  base64Data: string,
  filename: string,
  format: 'png' | 'jpeg' | 'webp',
  scale: number
) => {
  const img = new Image();
  img.src = base64Data;
  img.crossOrigin = "anonymous"; 
  
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(img.naturalWidth * scale);
    canvas.height = Math.floor(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Use high quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // For JPEG, fill background with white (handling transparency)
    if (format === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    let mimeType = 'image/png';
    let quality = 1.0;

    if (format === 'jpeg') {
      mimeType = 'image/jpeg';
      quality = 0.92;
    } else if (format === 'webp') {
      mimeType = 'image/webp';
      quality = 0.92;
    }
    
    const dataURI = canvas.toDataURL(mimeType, quality);
    
    const a = document.createElement('a');
    a.href = dataURI;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
};