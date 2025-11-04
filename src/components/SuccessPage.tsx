'use client'

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 1500;
const FRAME_SLOTS = [
  { x: 36, y: 110, w: 429, h: 301 },
  { x: 36, y: 428, w: 429, h: 301 },
  { x: 36, y: 750, w: 429, h: 301 },
  { x: 36, y: 1065, w: 429, h: 301 },
] as const;

const SuccessPage = () => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCanvasReady, setCanvasReady] = useState(false);
  const [isDownloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("capturedPhotos");
    const parsed: unknown = stored ? JSON.parse(stored) : null;

    if (!Array.isArray(parsed) || parsed.length === 0) {
      router.replace("/");
      return;
    }

    const sanitized = parsed
  .filter((item): item is string => Boolean(typeof item === "string" && item.length))
  .slice(0, FRAME_SLOTS.length);

    if (sanitized.length === 0) {
      router.replace("/");
      return;
    }

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        image.src = src;
      });

    const renderComposite = async () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (!canvas || !ctx) {
        setError("Canvas is not available.");
        return;
      }

      setCanvasReady(false);
      setError(null);

      try {
        const [template, ...photoImages] = await Promise.all([
          loadImage("/layout.png"),
          ...sanitized.map((photo) => loadImage(photo)),
        ]);

        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        photoImages.forEach((image, index) => {
          const slot = FRAME_SLOTS[index];
          if (!slot) return;
          const { x, y, w, h } = slot;
          ctx.drawImage(image, x, y, w, h);
        });

        ctx.drawImage(template, 0, 0, canvas.width, canvas.height);
        setCanvasReady(true);
      } catch (err) {
        console.error("Failed to render composite image", err);
        setError(
          "Gagal menyiapkan foto. Silakan ulangi pengambilan gambar dari awal.",
        );
      }
    };

    renderComposite();
  }, [router]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isCanvasReady) return;

    setDownloading(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "photobooth.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloading(false);
    }
  };

  const handleRetake = () => {
    sessionStorage.removeItem("capturedPhotos");
    router.replace("/");
  };

  return (
    <main className="flex h-full w-full items-center justify-center px-6 py-6">
      <div className="flex h-full w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center lg:items-start lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Photo Captured <span className="text-[#3E08AB]">Successfully!</span>
          </h1>

          <p className="text-lg text-gray-300 max-w-md">
            Unduh hasil foto kamu atau kembali untuk mengambil ulang.
          </p>

          <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
            <Button
              onClick={downloadImage}
              disabled={!isCanvasReady || isDownloading}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-full cursor-pointer"
            >
              {isDownloading ? "Preparing..." : "Download Photo"}
            </Button>

            <Button
              onClick={handleRetake}
              size="lg"
              className="bg-transparent border border-gray-500 hover:bg-gray-100/30 px-10 py-3 text-lg font-semibold rounded-full cursor-pointer"
            >
              Retake
            </Button>
          </div>

          {error && (
            <p className="text-sm text-red-400 max-w-md">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="relative flex items-center justify-center rounded-2xl border border-gray-700/50 bg-black/40 p-4">
            <canvas
              ref={canvasRef}
              className="max-h-[75vh] w-auto rounded-lg shadow-lg"
              aria-hidden={!isCanvasReady}
            />
            {!isCanvasReady && !error && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-white">
                Rendering photo...
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default SuccessPage;
