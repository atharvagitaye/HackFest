import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scan, X, CheckCircle, Camera, AlertCircle } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (qrToken: string) => void;
  onClose: () => void;
  isScanning?: boolean;
}

export default function QRScanner({ onScanSuccess, onClose, isScanning = false }: QRScannerProps) {
  const [error, setError] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [autoStartAttempted, setAutoStartAttempted] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerIdRef = useRef("qr-reader-" + Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    // Detect mobile device
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
    
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = useCallback(async () => {
    try {
      setError("");
      setPermissionDenied(false);
      
      // Check if we're in a secure context (required for camera on mobile)
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        setError("Camera access requires HTTPS or localhost. Mobile Chrome will not show a permission prompt on HTTP. Please access the site via https:// or use localhost instead of an IP address.");
        setPermissionDenied(true);
        return;
      }

      // Check if camera API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera API not available in this browser. Please use a modern browser like Chrome, Firefox, or Safari.");
        setPermissionDenied(true);
        return;
      }

      setScanning(true);

      // Request camera permission explicitly
      try {
        const constraints = {
          video: { 
            facingMode: isMobile ? { ideal: "environment" } : "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        // Stop the test stream - Html5Qrcode will create its own
        stream.getTracks().forEach(track => track.stop());
        // Wait for the camera hardware to fully release before re-acquiring
        await new Promise<void>(resolve => setTimeout(resolve, 600));
      } catch (permErr: any) {
        console.error("Permission error:", permErr);
        setScanning(false);
        setPermissionDenied(true);
        
        if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
          if (isMobile) {
            setError("Camera permission denied. Please allow camera access:\n\n1. Tap the lock icon (🔒) or info icon (ⓘ) in the address bar\n2. Tap 'Permissions' or 'Site settings'\n3. Enable 'Camera'\n4. Refresh the page and try again");
          } else {
            setError("Camera permission denied. Please allow camera access in your browser settings and try again.");
          }
        } else if (permErr.name === 'NotFoundError' || permErr.name === 'DevicesNotFoundError') {
          setError("No camera found on this device.");
        } else if (permErr.name === 'NotReadableError') {
          setError("Camera is already in use by another application. Please close other apps using the camera and try again.");
        } else {
          setError(`Unable to access camera: ${permErr.message || 'Unknown error'}. Please check your browser permissions.`);
        }
        return;
      }

      const html5QrCode = new Html5Qrcode(readerIdRef.current);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: isMobile ? { ideal: "environment" } : "environment" }, // Use back camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Success callback
          onScanSuccess(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Error callback - can be ignored as it fires frequently during scanning
          console.debug("QR scan error:", errorMessage);
        }
      );
    } catch (err: any) {
      console.error("Scanner start error:", err);
      setError(err.message || "Failed to start camera. Please check permissions.");
      setScanning(false);
      setPermissionDenied(true);
    }
  }, [isMobile, onScanSuccess]);

  useEffect(() => {
    if (!isMobile || autoStartAttempted || scanning || error) {
      return;
    }

    setAutoStartAttempted(true);
    startScanning();
  }, [isMobile, autoStartAttempted, scanning, error, startScanning]);

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Scanner stop error:", err);
      }
    }
    setScanning(false);
    setError("");
    setPermissionDenied(false);
    scannerRef.current = null;
  };

  const handleClose = async () => {
    await stopScanning();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Scan Pickup QR Code</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <p className="font-semibold mb-2 whitespace-pre-line">{error}</p>
              {permissionDenied && !isMobile && (
                <div className="text-xs mt-2 space-y-1">
                  <p className="font-semibold">How to enable camera:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Chrome/Edge:</strong> Click the camera icon in the address bar</li>
                    <li><strong>Firefox:</strong> Click the camera icon in the address bar or go to Settings → Privacy & Security → Permissions</li>
                    <li><strong>Safari:</strong> Safari → Settings → Website Settings → Camera</li>
                  </ul>
                  <p className="mt-2">After granting permission, click "Try Again" below.</p>
                </div>
              )}
              {permissionDenied && isMobile && !error.includes('HTTPS') && (
                <div className="text-xs mt-3 space-y-2 bg-amber-50 border border-amber-200 rounded p-2">
                  <p className="font-semibold text-amber-900">Mobile Chrome Camera Access:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-1 text-amber-900">
                    <li>Tap the <strong>lock icon (🔒)</strong> or <strong>three dots (...)</strong> in the address bar</li>
                    <li>Tap <strong>"Permissions"</strong> or <strong>"Site settings"</strong></li>
                    <li>Find <strong>"Camera"</strong> and set to <strong>"Allow"</strong></li>
                    <li>Return to this page and tap <strong>"Try Again"</strong></li>
                  </ol>
                  <p className="mt-2 text-amber-900 font-semibold">Note: If you still don't see a permission prompt, make sure you're accessing via <strong>https://</strong> or <strong>localhost</strong> (not an IP address).</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {!scanning && !error && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Camera className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                <p className="font-semibold mb-1">Camera permission required</p>
                <p>When prompted, click "Allow" to grant camera access. Position the QR code within the frame for automatic scanning.</p>
              </AlertDescription>
            </Alert>
            <Button onClick={startScanning} className="w-full" disabled={isScanning}>
              <Scan className="w-4 h-4 mr-2" />
              {isScanning ? "Processing..." : "Start Camera"}
            </Button>
          </div>
        )}

        {error && permissionDenied && (
          <div className="space-y-2">
            <Button onClick={startScanning} className="w-full" variant="default">
              <Scan className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleClose} className="w-full" variant="outline">
              Cancel
            </Button>
          </div>
        )}

        {scanning && (
          <>
            <div id={readerIdRef.current} className="rounded-lg overflow-hidden mb-4"></div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Scanning for QR code...
            </div>
            <Button onClick={stopScanning} variant="outline" className="w-full">
              Stop Scanning
            </Button>
          </>
        )}

        {isScanning && (
          <Alert className="mt-4 bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-800 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Processing pickup confirmation...
            </AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  );
}
