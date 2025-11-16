import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as any[];

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const saved: Array<{ url: string; name: string; size: number; type: string }> = [];

  for (const file of files) {
    // `file` is a File/Blob-like object provided by the runtime
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}_${file.name}`;
    const filePath = path.join(uploadDir, safeName);
    await fs.writeFile(filePath, buffer);
    saved.push({ url: `/uploads/${safeName}`, name: file.name, size: buffer.length, type: file.type });
  }

  return NextResponse.json({ files: saved });
}
