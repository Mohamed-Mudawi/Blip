import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const redirectUri = process.env.TWITTER_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing TWITTER_CLIENT_ID or TWITTER_REDIRECT_URI in env" },
      { status: 500 }
    );
  }

  // NOTE: For now we keep the simple "challenge" to match your callback.
  // This is OK for local dev. For production you'll want proper PKCE.
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "tweet.read tweet.write users.read offline.access",
    state: "state123",
    code_challenge: "challenge",
    code_challenge_method: "plain",
  });

  const url = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;

  return NextResponse.redirect(url);
}
