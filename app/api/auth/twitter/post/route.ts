import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { content, mediaUrls } = await req.json();

    const cookies = req.headers.get("cookie") ?? "";
    const match = cookies.match(/twitter_access_token=([^;]+)/);
    const accessToken = match?.[1];

    if (!accessToken)
        return NextResponse.json({ error: "Not authenticated with Twitter" }, { status: 401 });

    // If media URLs were provided but the app cannot upload media directly to Twitter,
    // append the URLs to the tweet text as a fallback. (Direct media upload requires
    // Twitter media endpoints and potentially OAuth1.0a credentials.)
    const text = (mediaUrls && mediaUrls.length > 0)
        ? `${content}\n\n${mediaUrls.join("\n")}`
        : content;

    const tweet = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
    });

    const data = await tweet.json();
    return NextResponse.json(data);
}
