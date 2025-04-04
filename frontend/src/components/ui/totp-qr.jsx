import { useEffect, useState } from 'react';

export function TOTPQRCode({ secret, email, size = 200, issuer = 'CryptoLearn' }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  useEffect(() => {
    if (!secret || !email) return;
    
    // Create the TOTP URI
    const uri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    
    // Create a QR code URL using a public QR code API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(uri)}`;
    
    setQrCodeUrl(qrUrl);
  }, [secret, email, size, issuer]);
  
  if (!qrCodeUrl) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '1px solid #e2e8f0',
          borderRadius: '0.375rem',
          backgroundColor: '#f8f9fa'
        }}
      >
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
          Loading QR Code...
        </p>
      </div>
    );
  }
  
  return (
    <img 
      src={qrCodeUrl} 
      alt="TOTP QR Code"
      style={{ 
        width: size, 
        height: size,
        maxWidth: '100%',
        border: '1px solid #e2e8f0',
        borderRadius: '0.375rem'
      }}
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.parentNode.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 1rem;">Failed to load QR code.<br/>Please use the secret key.</p>';
      }}
    />
  );
}