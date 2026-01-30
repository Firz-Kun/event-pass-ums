import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Camera, CheckCircle2, XCircle, RefreshCw, QrCode } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { mockEvents } from '@/data/mockEvents';

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

interface ScanResult {
  status: ScanStatus;
  message: string;
  eventTitle?: string;
}

const Scanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult>({
    status: 'idle',
    message: 'Point your camera at an event QR code to check in',
  });

  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    // Check for camera support
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then(() => setHasCamera(true))
      .catch(() => setHasCamera(false));

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      codeReader.current = new BrowserMultiFormatReader();
      setIsScanning(true);
      setScanResult({
        status: 'scanning',
        message: 'Scanning... Hold the QR code steady',
      });

      await codeReader.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            const text = result.getText();
            handleScanResult(text);
          }
        }
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
      setScanResult({
        status: 'error',
        message: 'Failed to start camera. Please check permissions.',
      });
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset();
      codeReader.current = null;
    }
    setIsScanning(false);
  };

  const handleScanResult = (text: string) => {
    stopScanning();

    // Parse the QR code - expected format: ums-emas://checkin/{eventId}
    const match = text.match(/ums-emas:\/\/checkin\/(.+)/);
    
    if (match) {
      const eventId = match[1];
      const event = mockEvents.find((e) => e.id === eventId);
      
      if (event) {
        setScanResult({
          status: 'success',
          message: 'Check-in successful!',
          eventTitle: event.title,
        });
      } else {
        setScanResult({
          status: 'error',
          message: 'Event not found. The QR code may be invalid.',
        });
      }
    } else {
      setScanResult({
        status: 'error',
        message: 'Invalid QR code format. Please scan a valid UMS event QR code.',
      });
    }
  };

  const resetScanner = () => {
    setScanResult({
      status: 'idle',
      message: 'Point your camera at an event QR code to check in',
    });
  };

  return (
    <MainLayout>
      <section className="py-12 lg:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <QrCode className="h-8 w-8" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                QR Check-in
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Scan the event QR code to mark your attendance
              </p>
            </div>

            {/* Scanner Area */}
            <div className="mt-10">
              <div
                className={cn(
                  'relative overflow-hidden rounded-2xl border-2 border-dashed transition-colors',
                  scanResult.status === 'success' && 'border-green-500 bg-green-50',
                  scanResult.status === 'error' && 'border-destructive bg-destructive/5',
                  scanResult.status === 'scanning' && 'border-primary',
                  scanResult.status === 'idle' && 'border-border bg-muted/30'
                )}
              >
                {/* Video Preview */}
                <div className="aspect-square w-full bg-black">
                  {hasCamera === false ? (
                    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                      <Camera className="h-16 w-16 text-muted-foreground/50" />
                      <p className="mt-4 text-muted-foreground">
                        Camera access denied. Please enable camera permissions to scan QR codes.
                      </p>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      className={cn(
                        'h-full w-full object-cover',
                        !isScanning && 'hidden'
                      )}
                    />
                  )}
                  
                  {!isScanning && hasCamera !== false && (
                    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                      {scanResult.status === 'success' ? (
                        <>
                          <CheckCircle2 className="h-20 w-20 text-green-500" />
                          <h3 className="mt-4 font-serif text-2xl font-bold text-green-700">
                            {scanResult.message}
                          </h3>
                          {scanResult.eventTitle && (
                            <p className="mt-2 text-green-600">
                              Checked in to: {scanResult.eventTitle}
                            </p>
                          )}
                        </>
                      ) : scanResult.status === 'error' ? (
                        <>
                          <XCircle className="h-20 w-20 text-destructive" />
                          <h3 className="mt-4 font-serif text-xl font-bold text-destructive">
                            Check-in Failed
                          </h3>
                          <p className="mt-2 text-muted-foreground">
                            {scanResult.message}
                          </p>
                        </>
                      ) : (
                        <>
                          <Camera className="h-16 w-16 text-muted-foreground/50" />
                          <p className="mt-4 text-muted-foreground">
                            {scanResult.message}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Scanning overlay */}
                {isScanning && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-48 w-48 rounded-2xl border-4 border-primary animate-pulse" />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
                {!isScanning ? (
                  <>
                    {(scanResult.status === 'success' || scanResult.status === 'error') && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="gap-2"
                        onClick={resetScanner}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Scan Another
                      </Button>
                    )}
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={startScanning}
                      disabled={hasCamera === false}
                    >
                      <Camera className="h-4 w-4" />
                      {scanResult.status === 'idle' ? 'Start Scanning' : 'Scan Again'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="destructive"
                    size="lg"
                    className="gap-2"
                    onClick={stopScanning}
                  >
                    <XCircle className="h-4 w-4" />
                    Stop Scanning
                  </Button>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-12 rounded-xl border border-border bg-card p-6">
              <h3 className="font-serif text-lg font-semibold text-card-foreground">
                How to Check In
              </h3>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    1
                  </span>
                  <span>Click "Start Scanning" to activate your camera</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    2
                  </span>
                  <span>Point your camera at the event QR code displayed at the venue</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    3
                  </span>
                  <span>Hold steady until the QR code is recognized</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    4
                  </span>
                  <span>Your attendance will be recorded automatically</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Scanner;
