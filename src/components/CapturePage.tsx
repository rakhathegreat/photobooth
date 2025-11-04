"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

const MAX_PHOTOS = 4;
const TARGET_WIDTH = 429;
const TARGET_HEIGHT = 301;

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

const CapturePage = () => {
  const [photoCount, setPhotoCount] = useState(0);
  const [timer, setTimer] = useState("3s");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const shutterAudioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  // Kamera
  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", frameRate: { ideal: 60, max: 60 } },
          audio: false,
        });

        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        setStream(mediaStream);
        streamRef.current = mediaStream;
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current
        .play()
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") {
            return;
          }
          console.error("Unable to start video preview", err);
        });
    }
  }, [stream]);

  useEffect(() => {
    const audio = new Audio("/cekrek.wav");
    audio.preload = "auto";
    shutterAudioRef.current = audio;

    return () => {
      shutterAudioRef.current?.pause();
      shutterAudioRef.current = null;
    };
  }, []);

  const takePhoto = useCallback(async () => {
    if (isLoading) return;
    setLoading(true);

    try {
      if (photoCount >= MAX_PHOTOS) {
        sessionStorage.setItem(
          "capturedPhotos",
          JSON.stringify(capturedPhotos),
        );
        router.push("/success");
        return;
      }

      if (!videoRef.current || !canvasRef.current) {
        throw new Error("Camera preview is not ready");
      }

      const seconds = parseInt(timer, 10);
      setCountdown(seconds);

      for (let i = seconds; i > 0; i--) {
        setCountdown(i);
        await wait(1000);
      }

      setCountdown(null);

      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 150);

      const shutterAudio = shutterAudioRef.current;
      if (shutterAudio) {
        try {
          shutterAudio.currentTime = 0;
          await shutterAudio.play();
        } catch (err) {
          if (
            !(err instanceof DOMException) ||
            (err.name !== "AbortError" && err.name !== "NotAllowedError")
          ) {
            console.error("Unable to play shutter sound", err);
          }
        }
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Unable to access canvas context");
      }

      const sourceRatio = video.videoWidth / video.videoHeight;
      const targetRatio = TARGET_WIDTH / TARGET_HEIGHT;

      let sx = 0;
      let sy = 0;
      let sWidth = video.videoWidth;
      let sHeight = video.videoHeight;

      if (sourceRatio > targetRatio) {
        const expectedWidth = video.videoHeight * targetRatio;
        sx = (video.videoWidth - expectedWidth) / 2;
        sWidth = expectedWidth;
      } else if (sourceRatio < targetRatio) {
        const expectedHeight = video.videoWidth / targetRatio;
        sy = (video.videoHeight - expectedHeight) / 2;
        sHeight = expectedHeight;
      }

      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(
        video,
        sx,
        sy,
        sWidth,
        sHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      ctx.restore();

      const photoDataUrl = canvas.toDataURL("image/png");
      const nextPhotos = [...capturedPhotos, photoDataUrl].slice(0, MAX_PHOTOS);

      setCapturedPhotos(nextPhotos);
      setPhotoCount(nextPhotos.length);

      if (nextPhotos.length >= MAX_PHOTOS) {
        sessionStorage.setItem("capturedPhotos", JSON.stringify(nextPhotos));
        router.push("/success");
      }
    } catch (error) {
      console.error("Failed to capture photo", error);
    } finally {
      setLoading(false);
    }
  }, [capturedPhotos, isLoading, photoCount, router, timer]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;

      if (event.code === "Space" || event.key === " ") {
        const target = event.target as HTMLElement | null;
        if (target) {
          const tagName = target.tagName;
          if (
            ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(tagName) ||
            target.isContentEditable
          ) {
            return;
          }
        }

        event.preventDefault();
        takePhoto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [takePhoto]);

  return (
    <main className="relative flex h-full w-full flex-1 items-center justify-center gap-8 overflow-hidden px-8 py-16">
      {/* Flash overlay */}
      {isFlashing && (
        <div className="fixed inset-0 bg-white/60 z-50 pointer-events-none transition-opacity duration-1000"></div>
      )}

      {/* Bagian kiri: Kamera + controls */}
      <div className="relative flex max-h-[80vh] max-w-4xl flex-1 flex-col items-center justify-center">
        <div className="mb-4 text-center text-2xl font-semibold text-white">
          {photoCount}/{MAX_PHOTOS}
        </div>

        <div className="relative mb-8 w-full max-w-2xl aspect-[429/301] overflow-hidden rounded-2xl bg-black">
          {stream ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover transform scale-x-[-1]"
              />
              {/* Countdown */}
              {countdown && (
                <div className="absolute inset-0 flex items-center justify-center z-40">
                  <span className="text-white text-[6rem] font-bold drop-shadow-lg">
                    {countdown}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              Camera Preview
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="text-center mb-8 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-white">Select Timer</span>
            <Select value={timer} onValueChange={setTimer}>
              <SelectTrigger className="w-20 bg-transparent border-gray-300 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3s">3s</SelectItem>
                <SelectItem value="5s">5s</SelectItem>
                <SelectItem value="10s">10s</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-7">
            <Button
              onClick={() => {
                if (isLoading || countdown) return;

                setCapturedPhotos((prev) => {
                  if (prev.length === 0) return prev;
                  const next = prev.slice(0, -1);
                  const nextCount = next.length;
                  setPhotoCount(nextCount);
                  if (nextCount > 0) {
                    sessionStorage.setItem(
                      "capturedPhotos",
                      JSON.stringify(next),
                    );
                  } else {
                    sessionStorage.removeItem("capturedPhotos");
                  }
                  return next;
                });

                setCountdown(null);
                setIsFlashing(false);
              }}
              disabled={capturedPhotos.length === 0 || isLoading || !!countdown}
              className="bg-transparent border border-gray-300 text-white hover:bg-gray-100/20 cursor-pointer text-lg px-8 py-3 rounded-full font-semibold"
            >
              Retake Previous
            </Button>
            <Button
              onClick={takePhoto}
              disabled={!!countdown || isLoading}
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3 rounded-full font-semibold"
            >
              {photoCount === 0
                ? `Start Capture (${MAX_PHOTOS} Photos)`
                : photoCount >= MAX_PHOTOS
                  ? isLoading
                    ? "Loading..."
                    : "Finish"
                  : !!countdown ? "Capturing..." : "Take next"}
            </Button>
          </div>
        </div>
      </div>

      {/* Bagian kanan: Preview foto */}
      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
        {capturedPhotos.length > 0 &&
          capturedPhotos.map((photo, index) => (
            <div
              key={index}
              className="w-64 aspect-[429/301] rounded-lg overflow-hidden border border-gray-300"
            >
              <img
                src={photo}
                alt={`Captured ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
      </div>
    </main>
  );
};

export default CapturePage;
