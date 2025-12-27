import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Zap, Image as ImageIcon, X, Plus, Play, Trash2 } from 'lucide-react';

interface CameraProps {
  onAnalyze: (images: string[]) => void;
  isProcessing: boolean;
}

export const Camera: React.FC<CameraProps> = ({ onAnalyze, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  const MAX_IMAGES = 10;

  const startCamera = useCallback(async () => {
    try {
      setIsStreaming(false); // Reset on start
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Rear camera preferred
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Camera access denied or unavailable. Please upload a photo.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const toggleFlash = () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const capabilities = track.getCapabilities() as any;
    
    // Check if torch is supported
    if (capabilities.torch || ('torch' in track.getSettings())) {
      track.applyConstraints({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        advanced: [{ torch: !isFlashOn }] as any
      }).then(() => setIsFlashOn(!isFlashOn))
      .catch(e => console.log("Flash not supported", e));
    }
  };

  const processImage = (imageSource: CanvasImageSource, width: number, height: number) => {
    if (!canvasRef.current || width === 0 || height === 0) return;

    const canvas = canvasRef.current;
    
    // Calculate scaled dimensions (max width 1024 to save bandwidth)
    const MAX_WIDTH = 1024;
    let newWidth = width;
    let newHeight = height;

    if (width > MAX_WIDTH) {
      const ratio = MAX_WIDTH / width;
      newWidth = MAX_WIDTH;
      newHeight = height * ratio;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw white background first to prevent transparent PNG issues
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, newWidth, newHeight);
      
      ctx.drawImage(imageSource, 0, 0, newWidth, newHeight);
      
      // Use 0.8 quality for better text readability
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      if (capturedImages.length < MAX_IMAGES) {
        setCapturedImages(prev => [...prev, imageData]);
      }
    }
  };

  const handleCapture = () => {
    if (videoRef.current && isStreaming) {
      const video = videoRef.current;
      // Double check dimensions
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        processImage(video, video.videoWidth, video.videoHeight);
      } else {
        console.warn("Video not ready: dimensions are 0");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        // Use a separate FileReader for each file
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
             // CRITICAL FIX: Create a NEW detached canvas for every image.
             // Using the shared ref causes race conditions where one image overwrites 
             // another before the data is saved, leading to duplicates.
             const tempCanvas = document.createElement('canvas');
             
             const MAX_WIDTH = 1024;
             let newWidth = img.width;
             let newHeight = img.height;
             
             if (img.width > MAX_WIDTH) {
                 const ratio = MAX_WIDTH / img.width;
                 newWidth = MAX_WIDTH;
                 newHeight = img.height * ratio;
             }
             
             tempCanvas.width = newWidth;
             tempCanvas.height = newHeight;
             
             const ctx = tempCanvas.getContext('2d');
             if (ctx) {
                 ctx.fillStyle = '#FFFFFF';
                 ctx.fillRect(0, 0, newWidth, newHeight);
                 ctx.drawImage(img, 0, 0, newWidth, newHeight);
                 
                 const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.8);
                 
                 setCapturedImages(prev => {
                     if (prev.length >= MAX_IMAGES) return prev;
                     return [...prev, dataUrl];
                 });
             }
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  const handleVideoLoad = () => {
    setIsStreaming(true);
    // Explicitly play to ensure frame availability on some mobile browsers
    videoRef.current?.play().catch(e => console.log("Play interrupted", e));
  };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearBatch = () => {
    setCapturedImages([]);
  };

  const triggerAnalysis = () => {
    if (capturedImages.length > 0) {
      onAnalyze(capturedImages);
    }
  };
  
  useEffect(() => {
    if (!isProcessing && capturedImages.length > 0) {
        // Handle logic if needed when coming back from processing
    }
  }, [isProcessing]);

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Hidden Canvas (Only used for live camera capture) */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 opacity-0 pointer-events-none" />
      
      {/* Video Feed */}
      {error ? (
        <div className="text-white text-center p-6 z-10 w-full max-w-sm">
          <p className="mb-6 text-red-400 font-medium bg-red-500/10 p-4 rounded-lg border border-red-500/20">{error}</p>
          <label className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full cursor-pointer transition w-full">
            <ImageIcon size={20} />
            Upload Photos
            <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleFileUpload} 
                className="hidden" 
            />
          </label>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleVideoLoad}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* Loading State for Camera */}
      {!isStreaming && !error && (
        <div className="absolute z-0 flex flex-col items-center justify-center text-gray-500">
           <div className="w-10 h-10 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin mb-2"></div>
           <p className="text-sm">Starting Camera...</p>
        </div>
      )}

      {/* Overlay - Scanner Box (Only show if queue is empty to encourage first scan) */}
      {!error && isStreaming && capturedImages.length === 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
          <div className="w-72 h-72 border border-white/20 rounded-2xl relative overflow-hidden bg-white/5 backdrop-blur-[2px]">
            {/* Scan Line Animation */}
            <div className={`absolute left-0 w-full h-0.5 bg-blue-400/80 shadow-[0_0_20px_rgba(96,165,250,0.8)] ${isProcessing ? 'animate-scan-line' : 'top-1/2'}`} />
            
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
          </div>
          <p className="absolute mt-96 text-white/90 font-medium text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md shadow-lg border border-white/10">
            Tap shutter to add items
          </p>
        </div>
      )}

      {/* Batch Queue Thumbnails */}
      {capturedImages.length > 0 && (
        <div className="absolute bottom-32 left-0 right-0 px-4 z-30">
            <div className="flex justify-between items-end mb-2">
                 <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded backdrop-blur-md">
                    {capturedImages.length} / {MAX_IMAGES} items
                 </span>
                 <button onClick={clearBatch} className="text-xs text-red-400 bg-black/50 px-2 py-1 rounded backdrop-blur-md flex items-center gap-1">
                    <Trash2 size={12} /> Clear
                 </button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {capturedImages.map((img, idx) => (
                    <div key={idx} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-white/30">
                        <img src={img} className="w-full h-full object-cover" alt={`scan ${idx}`} />
                        <button 
                            onClick={() => removeImage(idx)}
                            className="absolute top-0 right-0 bg-red-500 text-white p-0.5"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-0 w-full p-8 pb-10 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-between items-center z-20">
        {/* Gallery / File Upload */}
        <label className="p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition cursor-pointer border border-white/10 active:scale-95">
          <ImageIcon size={24} />
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            multiple 
            onChange={handleFileUpload} 
            className="hidden" 
          />
        </label>

        {/* Shutter Button OR Analyze Button */}
        {capturedImages.length > 0 ? (
            <button
                onClick={triggerAnalysis}
                disabled={isProcessing}
                className="w-20 h-20 rounded-full bg-primary hover:bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
                {isProcessing ? (
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <div className="flex flex-col items-center">
                        <Play size={24} fill="currentColor" />
                        <span className="text-[10px] font-bold mt-1">SCAN {capturedImages.length}</span>
                    </div>
                )}
            </button>
        ) : (
            <button
            onClick={handleCapture}
            disabled={isProcessing || !!error || !isStreaming}
            className={`
                w-20 h-20 rounded-full border-4 flex items-center justify-center
                transition-all duration-200 shadow-lg shadow-black/50
                ${isProcessing || !isStreaming
                ? 'border-gray-500 opacity-50 cursor-not-allowed scale-95' 
                : 'border-white scale-100 hover:scale-105 active:scale-95 hover:border-blue-400'
                }
            `}
            >
            <div className={`w-16 h-16 rounded-full transition-colors duration-200 ${isProcessing ? 'bg-gray-500' : 'bg-white'}`} />
            </button>
        )}

        {/* Add Button (Visual helper if images exist) or Flash */}
        {capturedImages.length > 0 ? (
             <button
             onClick={handleCapture}
             disabled={capturedImages.length >= MAX_IMAGES}
             className={`p-4 rounded-full backdrop-blur-md transition border border-white/10 active:scale-95 ${capturedImages.length >= MAX_IMAGES ? 'opacity-50' : 'bg-white/10 text-white'}`}
           >
             <Plus size={24} />
           </button>
        ) : (
            <button
            onClick={toggleFlash}
            disabled={!isStreaming}
            className={`p-4 rounded-full backdrop-blur-md transition border border-white/10 active:scale-95 ${isFlashOn ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
            <Zap size={24} fill={isFlashOn ? "currentColor" : "none"} />
            </button>
        )}
      </div>
    </div>
  );
};
