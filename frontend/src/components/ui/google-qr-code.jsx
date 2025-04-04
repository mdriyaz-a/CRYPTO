import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export function GoogleQRCode({ secret, email, issuer = 'CryptoLearn' }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Generate the TOTP URI
  const totpUri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  
  // Generate QR code URL using Google Charts API
  const qrCodeUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(totpUri)}`;
  
  useEffect(() => {
    console.log('GoogleQRCode component mounted');
    console.log('Secret:', secret);
    console.log('Email:', email);
    console.log('TOTP URI:', totpUri);
    console.log('QR Code URL:', qrCodeUrl);
  }, [secret, email, totpUri, qrCodeUrl]);
  
  const handleImageLoad = () => {
    console.log('QR code image loaded successfully');
    setIsLoading(false);
  };
  
  const handleImageError = () => {
    console.error('QR code image failed to load');
    setIsLoading(false);
    setHasError(true);
  };
  
  if (!secret) {
    return (
      <div className="flex items-center justify-center w-[200px] h-[200px] bg-gray-100 rounded-md">
        <p className="text-gray-500 text-center">No QR code available</p>
      </div>
    );
  }
  
  return (
    <div className="relative w-[200px] h-[200px] border border-gray-200 rounded-md overflow-hidden bg-white">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <p className="text-red-500 text-center p-4">
            Failed to load QR code.<br/>
            Please use the secret key below.
          </p>
        </div>
      ) : (
        <img 
          src={qrCodeUrl}
          alt="TOTP QR Code"
          className="w-full h-full object-contain"
          style={{ display: isLoading ? 'none' : 'block' }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
}