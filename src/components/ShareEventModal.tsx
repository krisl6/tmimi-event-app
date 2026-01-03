import React, { useState, useEffect } from 'react';
import { X, Copy, Check, QrCode, Download, Share2 } from 'lucide-react';
import { Button } from './Button';
import { generateQRCode, downloadQRCode } from '../lib/qrcode';

interface ShareEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventCode: string;
  eventName: string;
}

export const ShareEventModal: React.FC<ShareEventModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventCode,
  eventName,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loadingQR, setLoadingQR] = useState(false);

  const shareUrl = `${window.location.origin}/events/join/${eventCode}`;

  useEffect(() => {
    if (isOpen) {
      generateQR();
    }
  }, [isOpen, eventCode]);

  const generateQR = async () => {
    setLoadingQR(true);
    try {
      const qrUrl = await generateQRCode(shareUrl);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setLoadingQR(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(eventCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      downloadQRCode(qrCodeUrl, `${eventName}-qr-code.png`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${eventName}`,
          text: `Join my event "${eventName}" on Tmimi!`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">Share Event</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Event Code */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Event Code
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 bg-blue-50 border-2 border-primary rounded-lg">
                <p className="text-3xl font-bold text-primary text-center tracking-wider">
                  {eventCode}
                </p>
              </div>
              <Button
                variant="outline"
                icon={copiedCode ? Check : Copy}
                onClick={handleCopyCode}
                className={copiedCode ? 'text-success border-success' : ''}
              >
                {copiedCode ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="mt-2 text-xs text-text-muted">
              Share this code with friends to join your event
            </p>
          </div>

          {/* Share Link */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary"
              />
              <Button
                variant="outline"
                icon={copiedLink ? Check : Copy}
                onClick={handleCopyLink}
                className={copiedLink ? 'text-success border-success' : ''}
              >
                {copiedLink ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              QR Code
            </label>
            <div className="bg-white border-2 border-border rounded-lg p-6">
              {loadingQR ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : qrCodeUrl ? (
                <div className="space-y-4">
                  <img
                    src={qrCodeUrl}
                    alt="Event QR Code"
                    className="w-full max-w-xs mx-auto"
                  />
                  <Button
                    variant="outline"
                    icon={Download}
                    fullWidth
                    onClick={handleDownloadQR}
                  >
                    Download QR Code
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-text-muted">
                  <QrCode size={48} className="mx-auto mb-2 opacity-30" />
                  <p>Failed to generate QR code</p>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-text-muted">
              Scan this QR code to join the event instantly
            </p>
          </div>

          {/* Share Button (Mobile) */}
          {navigator.share && (
            <Button
              icon={Share2}
              fullWidth
              onClick={handleShare}
            >
              Share via...
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
