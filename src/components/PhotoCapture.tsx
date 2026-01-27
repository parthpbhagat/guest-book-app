import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw } from 'lucide-react';

interface PhotoCaptureProps {
  onCapture: (photoData: string) => void;
  currentPhoto?: string;
}

export const PhotoCapture = ({ onCapture, currentPhoto }: PhotoCaptureProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 320 },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCapturing(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.7);
        onCapture(photoData);
        stopCamera();
      }
    }
  };

  const clearPhoto = () => {
    onCapture('');
  };

  if (currentPhoto && !isCapturing) {
    return (
      <div className="space-y-2">
        <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-primary">
          <img src={currentPhoto} alt="Visitor" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={clearPhoto}
            className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-destructive-foreground shadow-md"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={startCamera} className="w-full">
          <RotateCcw className="mr-2 h-4 w-4" />
          Retake Photo
        </Button>
      </div>
    );
  }

  if (isCapturing) {
    return (
      <div className="space-y-3">
        <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-xl border-2 border-primary bg-black">
          <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={stopCamera} className="flex-1">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="button" onClick={capturePhoto} className="flex-1">
            <Camera className="mr-2 h-4 w-4" />
            Capture
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button type="button" variant="outline" onClick={startCamera} className="w-full">
      <Camera className="mr-2 h-4 w-4" />
      Take Photo
    </Button>
  );
};
