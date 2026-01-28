import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { QrCode, Camera, XCircle, CheckCircle, User, Clock, Home, Loader2 } from 'lucide-react';
import { Visitor, Host } from '@/types/visitor';
import { format } from 'date-fns';

interface QRScannerProps {
  visitors: Visitor[];
  hosts: Host[];
  onCheckIn?: (id: string) => void;
  onCheckOut?: (id: string) => void;
}

interface ScannedVisitor {
  id: string;
  name: string;
  checkIn: string;
  host: string;
}

export const QRScanner = ({ visitors, hosts, onCheckIn, onCheckOut }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedVisitor | null>(null);
  const [foundVisitor, setFoundVisitor] = useState<Visitor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';

  const startScanner = async () => {
    setIsScanning(true);
    setError(null);
    setScannedData(null);
    setFoundVisitor(null);
    setIsLoading(true);

    try {
      // Small delay to ensure the container is mounted
      await new Promise((resolve) => setTimeout(resolve, 100));

      scannerRef.current = new Html5Qrcode(scannerContainerId);

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // Ignore scan errors (no QR code in frame)
        }
      );
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to start scanner:', err);
      setError('Camera access denied or not available');
      setIsScanning(false);
      setIsLoading(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleScanSuccess = async (decodedText: string) => {
    try {
      const data: ScannedVisitor = JSON.parse(decodedText);
      setScannedData(data);

      // Find the visitor in our records
      const visitor = visitors.find((v) => v.id === data.id);
      setFoundVisitor(visitor || null);

      // Stop scanning after successful scan
      await stopScanner();
    } catch (err) {
      console.error('Invalid QR code data:', err);
      setError('Invalid visitor badge QR code');
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const getHostInfo = (hostId: string) => {
    return hosts.find((h) => h.id === hostId);
  };

  const handleAction = () => {
    if (!foundVisitor) return;

    if (foundVisitor.status === 'checked-in' && onCheckOut) {
      onCheckOut(foundVisitor.id);
    } else if (foundVisitor.status === 'pending' && onCheckIn) {
      onCheckIn(foundVisitor.id);
    }

    setScannedData(null);
    setFoundVisitor(null);
  };

  const host = foundVisitor ? getHostInfo(foundVisitor.host) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <QrCode className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">QR Scanner</h2>
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-6 text-center">
          {!isScanning && !scannedData ? (
            <div className="space-y-4">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <QrCode className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Scan Visitor Badge</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Point your camera at a visitor's QR badge to verify their entry
                </p>
              </div>
              <Button onClick={startScanner} className="gap-2">
                <Camera className="h-4 w-4" />
                Start Scanner
              </Button>
            </div>
          ) : isScanning ? (
            <div className="space-y-4">
              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span>Starting camera...</span>
                </div>
              )}
              <div
                id={scannerContainerId}
                className={`mx-auto overflow-hidden rounded-lg ${isLoading ? 'hidden' : ''}`}
                style={{ maxWidth: '300px' }}
              />
              <Button variant="outline" onClick={stopScanner}>
                Cancel Scan
              </Button>
            </div>
          ) : null}

          {error && (
            <div className="mt-4 rounded-lg bg-destructive/10 p-4 text-destructive">
              <XCircle className="mx-auto h-8 w-8" />
              <p className="mt-2">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setError(null);
                  startScanner();
                }}
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scanned Result Dialog */}
      <Dialog open={!!scannedData} onOpenChange={() => setScannedData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Visitor Badge Scanned</DialogTitle>
          </DialogHeader>

          {foundVisitor ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {foundVisitor.photo ? (
                  <img
                    src={foundVisitor.photo}
                    alt={foundVisitor.name}
                    className="h-16 w-16 rounded-full border-2 border-primary object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{foundVisitor.name}</h3>
                  <Badge
                    variant="outline"
                    className={
                      foundVisitor.status === 'checked-in'
                        ? 'border-success bg-success/10 text-success'
                        : foundVisitor.status === 'pending'
                        ? 'border-warning bg-warning/10 text-warning'
                        : 'border-muted bg-muted text-muted-foreground'
                    }
                  >
                    {foundVisitor.status === 'checked-in' && <CheckCircle className="mr-1 h-3 w-3" />}
                    {foundVisitor.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted p-4">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Visiting</p>
                    <p className="text-sm font-medium">{host?.flatNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Host</p>
                    <p className="text-sm font-medium">{host?.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Check-in Time</p>
                    <p className="text-sm font-medium">
                      {format(new Date(foundVisitor.checkInTime), 'dd MMM yyyy, HH:mm')}
                    </p>
                  </div>
                </div>
              </div>

              {foundVisitor.status === 'checked-in' && onCheckOut && (
                <Button className="w-full bg-success hover:bg-success/90" onClick={handleAction}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Check Out Visitor
                </Button>
              )}

              {foundVisitor.status === 'checked-out' && (
                <div className="text-center text-muted-foreground">
                  Visitor already checked out at{' '}
                  {foundVisitor.checkOutTime &&
                    format(new Date(foundVisitor.checkOutTime), 'HH:mm')}
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center">
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <h3 className="mt-3 font-semibold">Visitor Not Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                This badge is not registered in the system
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
