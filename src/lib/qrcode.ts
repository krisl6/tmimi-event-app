// QR Code generation utility using QRCode.js
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const QRCode = (await import('qrcode')).default;
    
    const qrDataUrl = await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: '#2563eb', // Primary color
        light: '#ffffff',
      },
    });
    
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const downloadQRCode = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
