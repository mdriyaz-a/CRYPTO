import { useEffect, useRef } from 'react';

export function QRCodeCanvas({ value, size = 200, bgColor = '#ffffff', fgColor = '#000000' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!value) return;

    // Function to draw QR code on canvas
    const drawQRCode = async () => {
      try {
        // Create an Image element
        const img = new Image();
        
        // Set up onload handler
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          
          const ctx = canvas.getContext('2d');
          
          // Clear canvas
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, size, size);
          
          // Draw the image
          ctx.drawImage(img, 0, 0, size, size);
          
          console.log('QR code drawn on canvas successfully');
        };
        
        // Set error handler
        img.onerror = (e) => {
          console.error('Failed to load QR code image:', e);
          
          // Draw error message on canvas
          const canvas = canvasRef.current;
          if (!canvas) return;
          
          const ctx = canvas.getContext('2d');
          
          // Clear canvas
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, size, size);
          
          // Draw error message
          ctx.fillStyle = '#ff0000';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('QR Code', size/2, size/2 - 10);
          ctx.fillText('Not Available', size/2, size/2 + 10);
        };
        
        // Set the source to the data URI
        img.src = value;
      } catch (error) {
        console.error('Error drawing QR code:', error);
      }
    };

    drawQRCode();
  }, [value, size, bgColor, fgColor]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size} 
      style={{ 
        width: size, 
        height: size,
        maxWidth: '100%',
        border: '1px solid #e2e8f0',
        borderRadius: '0.375rem'
      }}
    />
  );
}