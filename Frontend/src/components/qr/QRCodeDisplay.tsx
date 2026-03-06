import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, QrCode } from "lucide-react";

interface QRCodeDisplayProps {
  qrToken: string;
  donationInfo?: {
    foodType: string;
    quantity: string;
    pickupLocation: string;
  };
}

export default function QRCodeDisplay({ qrToken, donationInfo }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (canvasRef.current && qrToken) {
      QRCode.toCanvas(
        canvasRef.current,
        qrToken,
        {
          width: 280,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (err) => {
          if (err) {
            console.error("QR Code generation error:", err);
            setError("Failed to generate QR code");
          }
        }
      );
    }
  }, [qrToken]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `qr-code-${qrToken.slice(0, 8)}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <Card className="p-6 bg-card border-2 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Pickup QR Code</h3>
      </div>

      {error ? (
        <div className="text-center py-8 text-destructive">{error}</div>
      ) : (
        <>
          <div className="flex justify-center mb-4 bg-white p-4 rounded-lg">
            <canvas ref={canvasRef} />
          </div>

          {donationInfo && (
            <div className="bg-muted rounded-lg p-3 mb-4 text-sm space-y-1">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Food:</span> {donationInfo.foodType}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Quantity:</span> {donationInfo.quantity}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Location:</span> {donationInfo.pickupLocation}
              </p>
            </div>
          )}

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Show this QR code to the recipient for instant pickup confirmation
            </p>
            <Button onClick={handleDownload} variant="outline" size="sm" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
