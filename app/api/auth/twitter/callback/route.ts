import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.json({ error: "Missing ?code" }, { status: 400 });
  }

  if (state !== "state123") {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const clientId = process.env.TWITTER_CLIENT_ID;
  const redirectUri = process.env.TWITTER_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing TWITTER_CLIENT_ID or TWITTER_REDIRECT_URI in env" },
      { status: 500 }
    );
  }

  try {
    const body = new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: "challenge", // MUST match code_challenge from the authorize step
    });

    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body,
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error("Twitter token error:", text);
      return NextResponse.json(
        {
          error: "Failed to exchange token with Twitter",
          details: text,
        },
        { status: 500 }
      );
    }

    const tokenData = await tokenRes.json();
    console.log("TOKEN RESPONSE:", tokenData);

    if (!tokenData.access_token) {
      return NextResponse.json(
        { error: "No access_token in Twitter response", tokenData },
        { status: 500 }
      );
    }

    // TODO: Store tokenData.access_token (and refresh_token) in a DB or HTTP-only cookie.
    // For now, just return them so you can see it's working:
    return NextResponse.json({ success: true, tokenData });
  } catch (err) {
    console.error("Twitter callback error:", err);
    return NextResponse.json(
      { error: "Unexpected error during token exchange" },
      { status: 500 }
    );
  }
}
