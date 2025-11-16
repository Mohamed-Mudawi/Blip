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
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  const redirectUri = process.env.TWITTER_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Missing Twitter environment variables" },
      { status: 500 }
    );
  }

  try {
    const body = new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: process.env.TWITTER_CODE_VERIFIER || "challenge",
    });

    // Add Basic auth header with client_id:client_secret
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "Authorization": `Basic ${credentials}`,
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

    // Fetch Twitter user info
    let twitterUserId = "";
    let twitterUsername = "";
    try {
      const userRes = await fetch("https://api.twitter.com/2/users/me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        twitterUserId = userData.data?.id || "";
        twitterUsername = userData.data?.username || "";
      }
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }

    // TODO: Store in database when Prisma is ready
    // For now, just set the cookie and redirect back
    console.log(`Twitter user connected: @${twitterUsername} (${twitterUserId})`);

    // Set as HTTP-only cookie
    return NextResponse.redirect(new URL("/", req.url), {
      headers: {
        "Set-Cookie": `twitter_access_token=${tokenData.access_token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${tokenData.expires_in || 7200}`,
      },
    });
  } catch (err) {
    console.error("Twitter callback error:", err);
    return NextResponse.json(
      { error: "Unexpected error during token exchange" },
      { status: 500 }
    );
  }
}
