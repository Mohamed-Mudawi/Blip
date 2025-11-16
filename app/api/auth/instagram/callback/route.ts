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

  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Missing Instagram environment variables" },
      { status: 500 }
    );
  }

  try {
    // Step 1: Exchange code for access token (short-lived)
    const tokenRes = await fetch("https://graph.instagram.com/v18.0/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error("Instagram token error:", text);
      return NextResponse.json(
        { error: "Failed to exchange token with Instagram", details: text },
        { status: 500 }
      );
    }

    const tokenData = await tokenRes.json();
    console.log("Instagram token response:", tokenData);

    if (!tokenData.access_token) {
      return NextResponse.json(
        { error: "No access_token in Instagram response", tokenData },
        { status: 500 }
      );
    }

    // Step 2: Get long-lived access token (valid for 60 days)
    const longLivedRes = await fetch(
      `https://graph.instagram.com/v18.0/access_token?grant_type=ig_refresh_token&access_token=${tokenData.access_token}&client_secret=${appSecret}`,
      { method: "GET" }
    );

    let finalToken = tokenData.access_token;
    if (longLivedRes.ok) {
      const longLivedData = await longLivedRes.json();
      finalToken = longLivedData.access_token || tokenData.access_token;
      console.log("Got long-lived token");
    }

    // Step 3: Get user info and business account info
    let instagramUsername = "";
    let instagramUserId = "";
    try {
      const userRes = await fetch(
        `https://graph.instagram.com/v18.0/me?fields=id,username,name&access_token=${finalToken}`
      );
      if (userRes.ok) {
        const userData = await userRes.json();
        instagramUserId = userData.id || "";
        instagramUsername = userData.username || userData.name || "";
      }
    } catch (err) {
      console.error("Failed to fetch Instagram user info:", err);
    }

    console.log(`Instagram user connected: @${instagramUsername} (${instagramUserId})`);

    // Set as HTTP-only cookie
    return NextResponse.redirect(new URL("/", req.url), {
      headers: {
        "Set-Cookie": `instagram_access_token=${finalToken}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 24 * 60 * 60}`,
      },
    });
  } catch (err) {
    console.error("Instagram callback error:", err);
    return NextResponse.json(
      { error: "Unexpected error during token exchange" },
      { status: 500 }
    );
  }
}
