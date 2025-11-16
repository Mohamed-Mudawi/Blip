import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookies = req.headers.get("cookie") ?? "";
  const match = cookies.match(/instagram_access_token=([^;]+)/);
  const accessToken = match?.[1];

  return NextResponse.json({ connected: Boolean(accessToken) });
}
