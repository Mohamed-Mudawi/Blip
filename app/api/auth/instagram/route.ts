import { NextResponse } from "next/server";

export async function GET() {
  const appId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing INSTAGRAM_APP_ID or INSTAGRAM_REDIRECT_URI in env" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: "instagram_basic,instagram_content_publish,pages_read_engagement,pages_manage_metadata",
    response_type: "code",
    state: "state123",
  });

  const url = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  return NextResponse.redirect(url);
}
