import { randomUUID } from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUTPUT_DIR = path.join(process.cwd(), "public", "renders");
const DATA_URL_PREFIX = "data:image/png;base64,";
const MAX_FILE_SIZE_BYTES = 6 * 1024 * 1024; // 6MB safety cap

const canUseVercelBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!canUseVercelBlob && process.env.VERCEL) {
      return NextResponse.json(
        {
          message:
            "Blob storage belum dikonfigurasi. Set environment `BLOB_READ_WRITE_TOKEN`.",
        },
        { status: 500 },
      );
    }

    const body = await request.json();
    const imageData =
      typeof body?.imageData === "string" ? body.imageData : null;

    if (!imageData || !imageData.startsWith(DATA_URL_PREFIX)) {
      return NextResponse.json(
        { message: "Invalid image payload." },
        { status: 400 },
      );
    }

    const base64 = imageData.slice(DATA_URL_PREFIX.length);
    const buffer = Buffer.from(base64, "base64");

    if (buffer.byteLength === 0 || buffer.byteLength > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { message: "Image too large or empty." },
        { status: 400 },
      );
    }

    const id = randomUUID();
    const filename = `${id}.png`;

    if (canUseVercelBlob) {
      try {
        const { put } = await import("@vercel/blob");
        const blob = await put(`renders/${filename}`, buffer, {
          access: "public",
          contentType: "image/png",
        });

        return NextResponse.json({ id, url: blob.url });
      } catch (blobError) {
        console.error("Failed to upload render to Vercel Blob", blobError);
        if (process.env.VERCEL) {
          return NextResponse.json(
            { message: "Tidak dapat menyimpan hasil render (Blob error)." },
            { status: 500 },
          );
        }
      }
    }

    if (!existsSync(OUTPUT_DIR)) {
      await mkdir(OUTPUT_DIR, { recursive: true });
    }

    await writeFile(path.join(OUTPUT_DIR, filename), buffer);

    return NextResponse.json({
      id,
      url: `/renders/${filename}`,
    });
  } catch (error) {
    console.error("Failed to persist render", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menyimpan render." },
      { status: 500 },
    );
  }
}
